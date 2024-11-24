"use strict";

const fetch = require("node-fetch");

module.exports = ({ strapi }) => {
  const extractKeyPhrase = async (text) => {
    const ctx = strapi.requestContext.get();
    try {
      // prompt is based on formatting from parse-gpt-mc notebook
      const prompt = [
        {
          role: "user",
          content:`You will generate 3 to 5 keyphrases from the provided passage. The passage comes from an educational text, and the keyphrases should represent important concepts in the passage. A good keyphrase will be concise, and will likely be a noun phrase, like "patent infringement" or "epistemological belief." A bad keyphrase will be wordy and vague, like "extend the idea of scope," or will end mid-sentence like "defective condition unreasonably dangerous." Make sure the keyphrases do not overlap. For example, "sale" and "contract for sale" should not both be provided as keyphrases. Return the result as a single line of the values each separated by a comma.`+
            text,
        },
      ];
      console.log(text)
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
            model: "gpt-3.5-turbo-1106",
            // response_format:{ "type": "json_object" },
            messages: prompt,
            temperature: 0.7,
            max_tokens: 120,
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
    extractKeyPhrase,
  };
};
