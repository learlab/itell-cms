"use strict";

/**
 * page service
 */

const { createCoreService } = require("@strapi/strapi").factories;
const fetch = require("node-fetch");

// eslint-disable-next-line no-unused-vars
module.exports = createCoreService("api::page.page", ({ strapi }) => ({ 
  async generateEmbedding(ctx) {
    const targetURL = `${process.env.ITELL_API_URL}/generate/embedding`;

    const response = await fetch(targetURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": process.env.ITELL_API_KEY,
      },
      body: JSON.stringify(ctx),
    });

    if (response.status !== 201) {
      const errorDetails = await response.text();
      throw new Error(`Error Response from iTELL API: ${errorDetails}`);
    }

    return response;
  },

  async deleteEmbeddings(ctx) {
    const targetURL = `${process.env.ITELL_API_URL}/delete/embedding`;

    const response = await fetch(targetURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": process.env.ITELL_API_KEY,
      },
      body: JSON.stringify(ctx),
    });
    if (response.status !== 202) {
      const errorDetails = await response.text();
      throw new Error(errorDetails);
    }
    return response;
  },
}));
