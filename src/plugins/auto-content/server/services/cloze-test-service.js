"use strict";

const fetch = require("node-fetch");

module.exports = ({ strapi }) => {
  const createClozeTest = async (summary, text) => {
    try {
      const apiUrl = "https://itell-api.learlab.vanderbilt.edu/generate/cloze";
      const apiKey = process.env.ITELL_API_KEY;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API-Key": apiKey,
        },
        body: JSON.stringify({
          summary,
          page: text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Cloze API error: ${error}`);
      }

      return response.json();
    } catch (error) {
      console.log("Service error:", error);
      throw error;
    }
  };

  return {
    createClozeTest,
  };
};
