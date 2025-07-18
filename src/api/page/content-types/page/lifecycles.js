const {
  generateChunkFields,
  getPageSummaryAndText,
} = require("./updateChunkFields");
const { generatePageEmbeddings, deleteAllEmbeddings } = require("./embeddings");
const { generateCloze } = require("./clozeService");
const { validatePostActivities } = require("./validations");

async function handleClozeGeneration(result) {
  const { summary, text } = getPageSummaryAndText(result);
  // TODO: @rachel delete housekeeping comments before merge
  console.log("Cloze Test Generation - Page Summary:", summary);
  console.log("Cloze Test Generation - Page Text:", text);
  try {
    const clozeResult = await generateCloze(summary, text);
    console.log("Cloze API result:", clozeResult);
  } catch (err) {
    console.error("Error generating cloze:", err);
  }
}

module.exports = {
  // Publishing is always "creating" even if a previously published version exists
  // Will also trigger when a new page is created in draft mode
  afterCreate: async (event) => {
    console.log("=== afterCreate lifecycle triggered ===");
    const { result } = event;
    console.log("Lifecycle result object:", result);
    await validatePostActivities(result);
    result.Content = await generateChunkFields(result.Content);
    await generatePageEmbeddings(result);
    await handleClozeGeneration(result);
  },

  afterUpdate: async (event) => {
    const { result } = event;
    await validatePostActivities(result);
    result.Content = await generateChunkFields(result.Content);
    await generatePageEmbeddings(result);
    await handleClozeGeneration(result);
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
