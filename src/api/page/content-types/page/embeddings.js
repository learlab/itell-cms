"use strict";

async function generatePageEmbeddings(ctx) {
  const entry = await strapi.entityService.findOne("api::page.page", ctx.id, {
    populate: "*",
  });
  var chapter = null;
  const chapter_id = entry.Chapter ? entry.Chapter.id : null;
  var this_module_slug = null;
  if (chapter_id) {
    chapter = await strapi.entityService.findOne(
      "api::chapter.chapter",
      chapter_id,
      { populate: "module" }
    );
    this_module_slug = chapter.module ? chapter.module.slug : null;
  }

  const payload = entry.Content.map((item) => ({
    text_slug: entry.Volume?.Slug,
    module_slug: this_module_slug,
    chapter_slug: chapter ? chapter.Slug : null,
    page_slug: entry.Slug,
    chunk_slug: item.Slug,
    content: item.CleanText,
  }));

  payload.map((item) =>
    strapi.service("api::page.page").generateEmbedding(item)
  );

  const deletePayload = {
    page_slug: entry.Slug,
    chunk_slugs: entry.Content.map((item) => item.Slug),
  };

  strapi.service("api::page.page").deleteEmbeddings(deletePayload);
}

const deleteAllEmbeddings = async (id) => {
  const entry = await strapi.entityService.findOne("api::page.page", id, {
    populate: "*",
  });

  const deletePayload = {
    page_slug: entry.Slug,
    chunk_slugs: [],
  };

  strapi.service("api::page.page").deleteEmbeddings(deletePayload);
};

module.exports = {
  generatePageEmbeddings,
  deleteAllEmbeddings,
};
