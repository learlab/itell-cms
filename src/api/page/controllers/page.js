"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

const generatePageEmbeddings = async (ctx) => {
  try {
    const pageData = ctx.request.body;
    await strapi.service("api::page.page").generatePageEmbeddings(pageData);
    ctx.send({ message: "Embeddings generated successfully." });
  } catch (error) {
    ctx.badRequest(`Error in generatePageEmbeddings: ${error.message}`);
  }
};

const deleteAllEmbeddings = async (ctx) => {
  try {
    const pageId = ctx.params.id;
    await strapi.service("api::page.page").deleteAllEmbeddings(pageId);
    ctx.send({ message: "Embeddings deleted successfully." });
  } catch (error) {
    ctx.badRequest(`Error in deleteAllEmbeddings: ${error.message}`);
  }
};

const validatePostActivities = async (ctx) => {
  try {
    const pageData = ctx.request.body;
    await strapi.service("api::page.page").validatePostActivities(pageData);
    ctx.send({ message: "Page data validation successful." });
  } catch (e) {
    ctx.badRequest("Error in validations: " + e.message);
  };
  }




module.exports = createCoreController("api::page.page", () => ({
  generatePageEmbeddings,
  deleteAllEmbeddings,
  validatePostActivities,
}));