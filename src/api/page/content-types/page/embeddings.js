/* global strapi */
"use strict";
const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;

async function generatePageEmbeddings(ctx) {
  try {
    // Get the page entry
    const entry = await strapi.db.query("api::page.page").findOne({
      where: { documentId: ctx.documentId },
      populate: true,
    });

    if (!entry) {
      throw new Error(`Page not found for documentId: ${ctx.documentId}`);
    }

    // Get chapter information
    let chapter = null;
    let module = null;
    const chapter_id = entry.Chapter?.documentId;

    if (chapter_id) {
      chapter = await strapi.db.query("api::chapter.chapter").findOne({
        where: { documentId: chapter_id },
        populate: true,
      });
      module = chapter?.module?.slug;
    }

    if (!entry.Volume) {
      throw new Error(
        `Unable to generate embeddings because Volume relation is not specified.`,
      );
    }

    // Prepare payload
    const payload = entry.Content.map((item) => ({
      text_slug: entry.Volume?.Slug,
      module_slug: module,
      chapter_slug: chapter?.Slug,
      page_slug: entry.Slug,
      chunk_slug: item.Slug,
      content: item.CleanText,
    }));

    // Generate new embeddings sequentially to avoid transaction conflicts
    for (const item of payload) {
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
    throw new ApplicationError(
      `Error in deleteAllEmbeddings: ${error.message}`,
      { details: error },
    );
  }
}

module.exports = {
  generatePageEmbeddings,
  deleteAllEmbeddings,
};
