/* global strapi */
"use strict";

async function validatePostActivities(pageData) {
  try {
    if (pageData.HasSummary && pageData.Quiz.count !== 0) {
      throw new Error(
        `Page cannot have multiple end of page activities. Remove quiz or summary.`,
      );
    }
    return "Page data validation successful.";
  }
  catch (error) {
    throw new Error(
      `Error in validations: ${error.message}`,
    );
  }
}

module.exports = {
  validatePostActivities,
};
