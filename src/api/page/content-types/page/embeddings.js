/* global strapi */
"use strict";
const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;

async function generatePageEmbeddings(pageData) {
  try {
    // Get the page entry from the db so we can populate relations
    const entry = await strapi.db.query("api::page.page").findOne({
      where: { documentId: pageData.documentId },
      populate: true,
    });

    if (!entry.Volume) {
      throw new Error(
        `Unable to generate embeddings because Volume relation is not specified.`,
      );
    }

    // Prepare payload
    const payload = pageData.Content.map((item) => ({
      text_slug: entry.Volume.Slug,
      module_slug: entry.Module?.slug,
      chapter_slug: entry.Chapter?.Slug,
      page_slug: pageData.Slug,
      chunk_slug: item.Slug,
      content: item.CleanText,
    }));

    for (const item of payload) {
      console.log("Payload", payload);
      await strapi.service("api::page.page").generateEmbedding(item);
    }
  } catch (error) {
    console.log(error);
    throw new ApplicationError(
      `Error in generatePageEmbeddings: ${error.message}`,
    );
  }
}

async function deleteAllEmbeddings(id) {
  try {
    const entry = await strapi.db.query("api::page.page").findOne({
      where: { id: id },
      populate: true,
    });

    if (!entry) {
      throw new Error(`Page not found for documentId: ${id}`);
    }

    const deletePayload = {
      page_slug: entry.Slug,
      chunk_slugs: [],
    };

    await strapi.service("api::page.page").deleteEmbeddings(deletePayload);
  } catch (error) {
    console.log(error);
    throw new ApplicationError(
      `Error in deleteAllEmbeddings: ${error.message}`,
    );
  }
}

module.exports = {
  generatePageEmbeddings,
  deleteAllEmbeddings,
};
