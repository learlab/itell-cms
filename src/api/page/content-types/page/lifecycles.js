const { generatePageEmbeddings, deleteAllEmbeddings } = require('./embeddings');

module.exports = { 
    afterCreate: async (event) => {
        const { result, params } = event;
        generatePageEmbeddings(result);
    },

    afterUpdate: async (event) => {
        const { result, params } = event;
        generatePageEmbeddings(result);
    },

    beforeDelete: async (event) => {
        const { result, params } = event;
        await deleteAllEmbeddings(params.where.id);
    },

    beforeDeleteMany: async (event) => {
        const { result, params } = event;
        for (let id of params.where["$and"][0].id["$in"]) {
            await deleteAllEmbeddings(id);
        }
    }
  };