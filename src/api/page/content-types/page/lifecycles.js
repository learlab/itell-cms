const { generateChunkFields } = require("./updateChunkFields");
const { generatePageEmbeddings, deleteAllEmbeddings } = require("./embeddings");
const { validatePostActivities } = require("./validations");

module.exports = {
  // Publishing is always "creating" even if a previously published version exists
  // Will also trigger when a new page is created in draft mode
  afterCreate: async (event) => {
    const { result } = event;
    await validatePostActivities(result);
    result.Content = await generateChunkFields(result.Content);
    await generatePageEmbeddings(result);
  },

  afterUpdate: async (event) => {
    const { result } = event;
    await validatePostActivities(result);
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
