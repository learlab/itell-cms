const { generateChunkFields } = require("./updateChunkFields");
const { generatePageEmbeddings, deleteAllEmbeddings } = require("./embeddings");
const {validatePostActivities} = require("./validations");

module.exports = {
  // Publishing is always "creating" even if a previously published version exists
  // Will also trigger when a new page is created in draft mode
  afterCreate: async (event) => {
    try{
      const { result } = event;
    await validatePostActivities(result)
    result.Content = await generateChunkFields(result.Content);
      await generatePageEmbeddings(result);
    } catch (error) {
      strapi.log.error('Error in afterCreate lifecycle', error);
    }
  },

  afterUpdate: async (event) => {
    try{
      const { result } = event;
      await validatePostActivities(result)
      result.Content = await generateChunkFields(result.Content);
      await generatePageEmbeddings(result);
    } catch (error) {
      strapi.log.error('Error in afterUpdate lifecycle', error);
    }
  },

  beforeDelete: async (event) => {
    try{
      const { params } = event;
      await deleteAllEmbeddings(params.where.id);
    } catch (error) {
      strapi.log.error('Error in beforeDelete lifecycle', error);
    }
  },

  beforeDeleteMany: async (event) => {
    try{
      const { params } = event;
      for (let id of params.where["$and"][0].id["$in"]) {
        await deleteAllEmbeddings(id);
      }
    } catch (error) {
      strapi.log.error('Error in beforeDeleteMany lifecycle', error);
    }
  },
};
