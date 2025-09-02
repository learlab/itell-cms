const { generateChunkFields } = require("./updateChunkFields");
const { generatePageEmbeddings, deleteAllEmbeddings } = require("./embeddings");
const { validatePostActivities } = require("./validations");
const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;

module.exports = {
  // Publishing is always "creating" even if a previously published version exists
  // Will also trigger when a new page is created in draft mode
  afterCreate: async (event) => {
    try {
      const { result } = event;
      await validatePostActivities(result);
      result.Content = await generateChunkFields(result.Content);
      await generatePageEmbeddings(result);
    } catch (error) {
      strapi.log.error('Error in afterCreate lifecycle:', error);
      throw new ApplicationError(`Failed to process page after creation: ${error.message}`);
    }
  },

  afterUpdate: async (event) => {
    try {
      const { result } = event;
      await validatePostActivities(result);
      result.Content = await generateChunkFields(result.Content);
      await generatePageEmbeddings(result);
    } catch (error) {
      strapi.log.error('Error in afterUpdate lifecycle:', error);
      throw new ApplicationError(`Failed to process page after update: ${error.message}`);
    }
  },

  beforeDelete: async (event) => {
    try {
      const { params } = event;
      await deleteAllEmbeddings(params.where.id);
    } catch (error) {
      strapi.log.error('Error in beforeDelete lifecycle:', error);
      throw new ApplicationError(`Failed to delete page embeddings: ${error.message}`);
    }
  },

  beforeDeleteMany: async (event) => {
    try {
      const { params } = event;
      for (let id of params.where["$and"][0].id["$in"]) {
        await deleteAllEmbeddings(id);
      }
    } catch (error) {
      strapi.log.error('Error in beforeDeleteMany lifecycle:', error);
      throw new ApplicationError(`Failed to delete multiple page embeddings: ${error.message}`);
    }
  },
};