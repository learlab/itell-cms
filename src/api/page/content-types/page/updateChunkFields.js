/* global strapi */
"use strict";

var slugify = require("slugify");
const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;

// eslint-disable-next-line no-unused-vars
function validateKeyPhraseField(event) {
  /* Not currently used */
  const { data } = event.params;
  const keyphrase_string = data.KeyPhrase ? data.KeyPhrase : "";
  try {
    if (
      keyphrase_string.length > 0 &&
      keyphrase_string.search(/^((\w| |\n|-)+,)+((\w| |\n-)+)$/g) === -1
    ) {
      throw new Error("Invalid Keyphrase format");
    }
  } catch {
    throw new ApplicationError(`Keyphrase Parsing Error: ${keyphrase_string}`);
  }
}

async function slugPipeline(chunkData) {
  // @ts-ignore
  // Removes all special characters from the chunk before slugging it
  const slug = slugify(chunkData.Header, { remove: /[*+~.()'"!:@]/g });
  return `${slug}-${chunkData.id}`;
}

async function generateVideoChunkFields(chunkData) {
  const transcript = await strapi
    .service("plugin::auto-content.fetchTranscriptService")
    .getTranscript(chunkData.URL, chunkData.StartTime, chunkData.EndTime);

  var mdx = "<YoutubeVideo\n" + `src=${chunkData.URL}\n`;

  if (chunkData.Header) mdx += `title="${chunkData.Header}"`;

  if (chunkData.Description) mdx += `\n>\n${chunkData.Description}`;
  else mdx += ">";

  mdx += "\n</YoutubeVideo>";

  chunkData.CleanText = transcript;
  chunkData.MDX = mdx;

  chunkData.MD = mdx;

  return chunkData;
}

async function generateTextChunkFields(chunkData) {
  const cleanText = await strapi
    .service("plugin::auto-content.cleanTextService")
    .cleanText(chunkData.Text);

  const mdx = await strapi
    .service("plugin::auto-content.mdxService")
    .mdx(chunkData.Text);

  const md = await strapi
    .service("plugin::auto-content.mdService")
    .md(chunkData.Text);

  chunkData.CleanText = cleanText;
  chunkData.MDX = mdx;
  chunkData.MD = md;

  return chunkData;
}

async function generateChunkFields(content) {
  for (var chunkData of content) {
    if (!chunkData.Slug) {
      chunkData.Slug = await slugPipeline(chunkData);
    }

    if (chunkData.__component === "page.video") {
      chunkData = await generateVideoChunkFields(chunkData);
    } else if (
      chunkData.__component === "page.chunk" ||
      chunkData.__component === "page.plain-chunk"
    ) {
      chunkData = await generateTextChunkFields(chunkData);
    }

    // Perform the update
    await strapi.db.query(chunkData.__component).update({
      where: { id: chunkData.id },
      data: {CleanText: chunkData.CleanText, MDX: chunkData.MDX, MD: chunkData.MD, Slug: chunkData.Slug}
    });
  }
  return content;
}

module.exports = {
  generateChunkFields,
};
