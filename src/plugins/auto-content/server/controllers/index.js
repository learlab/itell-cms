"use strict";

module.exports = {
  contentGenerator: require("./content-generation-controller"),
  cleanTextGenerator: require("./cleantext-generation-controller"),
  transcriptGenerator: require("./fetch-transcript-controller"),
  keyPhraseGenerator: require("./keyphrase-extraction-controller"),
  pageSummaryField: require("./create-page-summary-controller"),
  volumeSummaryField: require("./create-volume-summary-controller")
};
