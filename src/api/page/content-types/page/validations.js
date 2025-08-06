/* global strapi */
"use strict";
const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;

async function validatePostActivities(pageData) {
  try {
    if (pageData.HasSummary && pageData.Quiz.count !== 0) {
      throw new Error(
        `Page cannot have multiple end of page activities. Remove quiz or summary.`,
      );
    }
    return "Page data validation successful.";
  }
  catch(e){
    throw new Error(
      `Error in validations: ${e.message}`,
    );  }
}

module.exports = {
  validatePostActivities,
};
