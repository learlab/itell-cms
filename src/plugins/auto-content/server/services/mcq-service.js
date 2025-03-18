"use strict";

import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const fetch = require("node-fetch");

module.exports = ({strapi}) => {
  const createMCQ = async (Identifier) => {
    let text = ""
    let volume;
    let pastQuestions
    let questionType
    try{
      const entry = await strapi.entityService.findMany('api::quiz.quiz', {
        populate: {AssociatedChapter: true, Questions: true},
        filters: {
          Identifier: Identifier,
        },
      });
      for(let question of entry[0].Questions){
        if(question.__component === 'quizzes.generated-mcq' && question.GeneratedQuestion !== 'Currently being generated...'){
          pastQuestions+=question.GeneratedQuestion + "\n"
        }
        else if (question.__component === 'quizzes.multiple-choice-question' && question.Question !== null){
          pastQuestions+=question.GeneratedQuestion + "\n"
        }
      }
      const chapter = await strapi.entityService.findMany('api::chapter.chapter', {
        populate: {Pages: true, Volume: true},
        filters: {
          documentId: entry[0].AssociatedChapter.documentId,
        },
      });
      volume = chapter[0].Volume
      for(let page of chapter[0].Pages) {
        const page = await strapi.entityService.findMany('api::page.page', {
          populate: {Content: true},
          filters: {
            documentId: chapter[0].Pages[0].documentId,
          },
        });

        for (let chunk of page[0].Content) {
          text += chunk.CleanText

        }

      }
    }
    catch (error) {
      console.log(error);
    }
    try {
      // prompt is based on formatting from parse-gpt-mc notebook
      const prompt = [
        {
          role: "user",
          content: `
          You are a strategic reading coach that designs high-quality multiple-choice tests for adult learners. The questions you create provide valid and reliable information about students' reading comprehension.
      
          # Question Types for Reading Comprehension
          ## Paraphrase Questions
          Ask students to restate explicitly presented information in different words. These assess textbase-level understanding without requiring connections between text parts or outside knowledge. They focus on single sentences or discrete ideas.
      
          ## Inference Questions
          ### Bridging Inference Questions: 
          Require connections between separate ideas in different parts of the text. More demanding and often depend on prior knowledge, especially for distant text connections.
          ### Elaborative Inference Questions:
          Ask students to combine prior knowledge with text information to form conclusions beyond what's explicitly stated. These assess deeper understanding.
      
          ## Recall Questions
          Test memory for specific information presented in the text. Unlike paraphrase questions, these target precise retrieval of information, terms, or details from the text, primarily assessing text-based comprehension.
          Different question types measure different aspects of comprehension: text-based questions (recall, paraphrase) assess textbase representation, while inference questions better evaluate situation model and deeper understanding, particularly for readers with higher prior knowledge.
      
          # Format
          Provide your response as a JSON object with the following structure:
      
          {
            "question": "Your question here",
            "correct_answer": "Correct option text",
            "distractors": [
              "Distractor option text 1",
              "Distractor option text 2",
              "Distractor option text 3"
            ],
            "explanation": "Explanation of why this is the correct answer"
          }
          
          # Constraints
          - The question should be a single multiple choice question.
          - The question type should be paraphrase, inference, or recall.
          - The question will assess comprehension of the provided chapter text.
          - The question should not overlap with existing questions.
          - All options should be distinct, parallel in structure, and of similar length.
          - Distractors should be plausible, incorrect options.
      
          # Distractor Guidelines
          - For paraphrase questions: include options with similar wording but incorrect meaning
          - For inference questions: include plausible but unsupported inferences
          - For recall questions: include include plausible but incorrect details
      
          # Validation
          - Paraphrase questions must be answerable from a single explicit part of the text
          - Bridging inference questions must require connecting two or more text elements
          - Elaborative inference questions must require applying outside knowledge
          - Recall questions must test specific details without requiring rephrasing
      
          # Inputs
          ## Text Title
          ${volume.Title}
          ## Text Summary
          ${volume.Summary}
          ## Chapter text
          ${text}
          ## Existing questions
          ${pastQuestions}
          ## Question Type
          ${questionType ? questionType : ["paraphrase", "inference", "recall"][Math.floor(Math.random() * 3)]}
      
          # Directive
          Provide a single multiple-choice question formatted as a JSON object that meets the above criteria.
          `,
        },
      ];

      const formatMCQ = z.object({
        question: z.string(),
        correct_answer: z.string(),
        distractors: z.array(z.string()),
        explanation: z.string(),
      });

      const response = await fetch(
        `https://api.openai.com/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${strapi
              .plugin("auto-content")
              .config("API_TOKEN")}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-2024-08-06",
            messages: prompt,
            temperature: 0.7,
            response_format: zodResponseFormat(formatMCQ, "question"),
          }),
        },
      );
      const res = await response.json();
      return res;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    createMCQ,
  };
};
