const fetch = require("node-fetch");

async function generateCloze(summary, pageText) {
  const apiUrl = "https://itell-api.learlab.vanderbilt.edu/generate/cloze";
  const apiKey = process.env.ITELL_API_KEY;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "API-Key": apiKey,
    },
    body: JSON.stringify({
      summary,
      page: pageText,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloze API error: ${error}`);
  }

  return response.json();
}

module.exports = { generateCloze };
