"use strict";

const fetch = require("node-fetch");

module.exports = ({ strapi }) => {
  const createClozeTest = async (summary, text) => {
    try {
      const apiUrl = `${process.env.ITELL_API_URL}/generate/cloze`;
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
        signal: AbortSignal.timeout(60 * 1000),
      });

      if (!response.ok) {
        const error = await response.text();
        strapi.log.error(`Cloze API error: ${error}`);
        throw new Error(`Cloze API error: ${error}`);
      }

      // This will be returned to the frontend (admin UI).
      // Since JSON cloze field is read only, this should be more helpful than a general error in the website
      if (response.status === 500) {
        return {
          error: "500 Internal Server Error. Contact LearLab for API update",
        };
      }

      const json = await response.json();

      return json;
    } catch (error) {
      strapi.log.error(
        "Service error at /services/cloze-test-service.js at createClozeTest:",
        error,
      );
      throw error;
    }
  };

  return {
    createClozeTest,
  };
};
