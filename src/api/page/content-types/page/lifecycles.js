const { generateChunkFields } = require("./updateChunkFields");
const { generatePageEmbeddings, deleteAllEmbeddings } = require("./embeddings");
const {validatePostActivities} = require("./validations");
const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;
module.exports = {
  // Publishing is always "creating" even if a previously published version exists
  // Will also trigger when a new page is created in draft mode
  afterCreate: async (event) => {
    const { result } = event;
    await validatePostActivities(result)
    result.Content = await generateChunkFields(result.Content);
      await generatePageEmbeddings(result);
  },
  beforeUpdate: async (event) => {
    const { params } = event;
    const entry = await strapi.db.query("api::page.page").findMany({
      where: { Slug: params.data.Slug },
      populate: true,
    });
    if(entry.length === 0){
      throw new ApplicationError(
        `Error in validations: Page slug was changed on existing document`,
      );
    }
  },
  afterUpdate: async (event) => {
    const { result } = event;
    await validatePostActivities(result)
    result.Content = await generateChunkFields(result.Content);
    await generatePageEmbeddings(result);
  },

  beforeDelete: async (event) => {
    const { params } = event;
    await deleteAllEmbeddings(params.where.id);
  },

  beforeDeleteMany: async (event) => {
    const { params } = event;
    for (let id of params.where["$and"][0].id["$in"]) {
      await deleteAllEmbeddings(id);
    }
  },
};
