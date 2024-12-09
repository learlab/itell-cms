"use strict";

const fetch = require("node-fetch");

module.exports = ({ strapi }) => {
  const createPageSummary = async (text) => {
    try {
      // prompt is based on formatting from parse-gpt-mc notebook
      const prompt = [{
            role: "user",
            content: 'You will generate a summary from the provided text. The summary should be one paragraph of about 100 words in length.'
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
    createPageSummary,
  };
};
