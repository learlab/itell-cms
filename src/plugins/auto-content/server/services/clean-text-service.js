"use strict";

const unified = require("unified");
const remove = require("unist-util-remove");
const toText = require("hast-util-to-text");
const isElement = require("hast-util-is-element");
const rehypeParse = require("rehype-parse");

function removeTables() {
  return (tree) =>
    remove(tree, { cascade: true }, (node) => {
      return isElement(node, "table");
    }) || undefined;
}

function rehypeText(options) {
  const self = this;
  const settings = { ...self.data("settings"), ...options };

  self.Compiler = Compiler;

  function Compiler(tree) {
    return toText(tree, settings);
  }
}

module.exports = ({ strapi }) => {
  const cleanText = async (html) => {
    if (!html) return null;

    const text = await unified()
      .use(rehypeParse)
      .use(removeTables)
      .use(rehypeText)
      .process(html);
    
    return String(text);
  };

  return {
    cleanText,
  };
};
