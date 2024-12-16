"use strict";

const fetch = require("node-fetch");

module.exports = ({strapi}) => {
  const createVolumeSummary = async (title) => {
    let text = ""
    try{
      const entry = await strapi.entityService.findMany('api::text.text', {
        populate: {Pages: true},
        filters: {
          Title: title,
        },
      });
      for(let page of entry[0].Pages){
        text +=`## ${page.Title} \n ${page.PageSummary}\n`
      }
    }
    catch (error) {
      console.log(error);
    }
    try {
      // prompt is based on formatting from parse-gpt-mc notebook
      const prompt = [{
        role: "user",
        content: 'You will be provided with one summary for each page of a text. Using these summaries, please generate a new summary for the entire text. Your summary should be one paragraph of about 100 words.'
      },
        {
          "role": "user",
          "content": text
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
    createVolumeSummary,
  };
};
