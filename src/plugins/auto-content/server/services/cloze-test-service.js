"use strict";

module.exports = ({ strapi }) => {
  const createClozeTest = async (summary, text) => {
    try {
      // Import the generateCloze function from the page content types
      const {
        generateCloze,
      } = require("../../../../api/page/content-types/page/clozeService");

      const clozeResult = await generateCloze(summary, text);
      return clozeResult;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return {
    createClozeTest,
  };
};
