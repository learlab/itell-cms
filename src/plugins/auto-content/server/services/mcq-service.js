"use strict";

const fetch = require("node-fetch");

module.exports = ({strapi}) => {
  const createMCQ = async (Identifier) => {
    let text = ""
    let volume;
    let pastQuestions
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
        Objective: You are an expert educational content designer creating a multiple-choice question that aligns with the chapter's learning objectives while avoiding redundancy. The question must be one of the following types: recall, paraphrase, or inferential.
        Inputs: You will be provided with the following inputs.
        - Chapter text: The primary source for generating questions.
        - Existing questions: Ensure your question is complementary and non-duplicative.
        - Volume summary & description: A high-level overview of key themes and concepts to guide question design
        Task guidelines:
        Step 1: Content Analysis
        - Extract 5-7 key concepts from the chapter, prioritizing themes, definitions, and cause-effect relationships emphasized in the Volume Summary.
        - For inferential questions, identify 2-3 scenarios where students apply concepts in new contexts.
        Step 2: Question Generation
        - Recall: Test foundational facts and definitions (e.g., "What is the definition of X?").
        - Paraphrase: Rephrase key ideas without directly quoting the textbook (e.g., "Which statement best describes X?").
        - Inferential: Require students to apply knowledge to a novel situation.
        - Only provide 1 correct answer choice and make the other incorrect.
        Format Criteria:
        - Ensure your output is in a MD format that follows the exact structure and keys as shown below but do NOT enclose it with \`\`\`MD\`\`\`:
          - question: "The question goes here"
            answers:
            - answer: "a.\\tThe first answer"
              correct: boolean if it's correct
            - answer: "b.\\tThe second answer"
              correct: boolean if it's correct
            - answer: "c.\\tThe third answer"
              correct: boolean if it's correct
            - answer: "d.\\tThe fourth answer"
              correct: boolean if it's correct
        `
      },
        {
          "role": "user",
          "content": `
          Inputs (Provided):
          Chapter text:
          [begin chapter text]
          ${text}
          [end chapter text]
          Existing questions
          ${pastQuestions}
          Volume summary and description
          Volume summary
          ${volume.VolumeSummary}
          Volume description
          ${volume.Description}

          Your directive:
          - Generate a single multiple choice question by rigorously following the criteria listed above.
          - Your response should be in the above format without any additional text or explanation.`
        }
      ];
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
