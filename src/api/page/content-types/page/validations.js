/* global strapi */
"use strict";

async function validatePostActivities(pageData) {
  try {
    if (pageData.HasSummary && pageData.Quiz.count !== 0) {
      throw new Error(
        `Page cannot have multiple end of page activities. Remove quiz or summary.`,
      );
    }
  } catch (e) {
    alert(`Error in validations: ${e.message}`);
  }
}

module.exports = {
  validatePostActivities,
};
