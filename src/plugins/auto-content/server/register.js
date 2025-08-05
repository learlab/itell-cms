"use strict";

module.exports = ({ strapi }) => {
  strapi.customFields.register([
    {
      name: "question",
      plugin: "auto-content",
      type: "text",
      inputSize: {
        default: 12,
        isResizable: true,
      },
    },
    {
      name: "constructedResponse",
      plugin: "auto-content",
      type: "text",
      inputSize: {
        default: 12,
        isResizable: true,
      },
    },
    {
      name: "generatedQuestion",
      plugin: "auto-content",
      type: "text",
      inputSize: {
        default: 12,
        isResizable: true,
      },
    },
    {
      name: "keyPhrase",
      plugin: "auto-content",
      type: "text",
      inputSize: {
        default: 12,
        isResizable: true,
      },
    },
    {
      name: "slug",
      plugin: "auto-content",
      type: "text",
      inputSize: {
        default: 12,
        isResizable: true,
      },
    },
    {
      name: "volumeSummary",
      plugin: "auto-content",
      type: "text",
      inputSize: {
        default: 12,
        isResizable: true,
      },
    },
    {
      name: "pageSummary",
      plugin: "auto-content",
      type: "text",
      inputSize: {
        default: 12,
        isResizable: true,
      },
    },
    {
      name: "clozeTest",
      plugin: "auto-content",
      type: "text",
      inputSize: {
        default: 12,
        isResizable: true,
      },
    },
  ]);
};
