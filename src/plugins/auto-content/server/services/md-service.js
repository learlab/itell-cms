"use strict";

var TurndownService = require("joplin-turndown");
var turndownPluginGfm = require("joplin-turndown-plugin-gfm");
var gfm = turndownPluginGfm.gfm; // GitHub Flavored Markdown

// Placeholder for page slugs; replaced by GithubPublish.js
const pageSlug = "__temp_slug__";

// Utility function to construct JSX attributes from HTML DOM
function stringifyAttributes(element, separator = " ") {
  var attrStr = Array.from(element.attributes)
    .filter((attr) => attr.specified && attr.name !== "class")
    .map((attr) => `${attr.name}="${attr.value}"`)
    .join(separator);
  if (attrStr.length > 0) {
    attrStr = separator + attrStr;
  }
  return attrStr;
}

var turndownService = new TurndownService({
  codeBlockStyle: "fenced",
  blankReplacement: function (_content, node) {
    if (
      node.nodeName === "SECTION" &&
      node.classList.contains("CodingSandbox")
    ) {
      // Preserve REPLs even when they are empty.
      const language = node.querySelector("pre code").className.split(" ")[1];
      const blockType = language === "python" ? "i-sandbox-py" : "i-sandbox-js";
      return `<${blockType} page-slug="${pageSlug}" code="">\n</${blockType}>\n`;
    } else if (node.isBlock) {
      // Default behavior of blankReplacement is newlines for blank block elements.
      return "\n\n";
    } else {
      // Empty string for blank inline elements.
      return "";
    }
  },
});

turndownService.use(gfm);

// Short name for turndownService.turndown
const td = (html) => turndownService.turndown(html);

// Rule for Fancy Fenced Code Blocks
/* DataModel
  <section class="StaticCode">
      Attributes:
      <p class="StaticAttributes">
        attr_string
      </p>
      <div>
          <pre><code class="language-python">code_content</code></pre>
      </div>
  </section>
*/
/* MDX Export
  ```python attr_string
  code_content
  ```
*/
turndownService.addRule("StaticCode", {
  filter: function (node) {
    return (
      node.nodeName === "SECTION" && node.getAttribute("class") === "StaticCode"
    );
  },
  replacement: function (_content, node) {
    const attributes = node.querySelector("p");
    const attrStr = attributes ? attributes.textContent.trim() : "";

    const codeBlock = node.querySelector("pre code");
    const language = codeBlock.className.split("-")[1];

    const codeContent = codeBlock.textContent.trim();

    return `\`\`\`${language} ${attrStr}\n${codeContent}\n\`\`\``;
  },
});

// Info
/* DataModel
  <section class="Info">
    <h3 class="InfoTitle">info_title</h3>
    <p class="InfoContent">info_content</p>
  </section>
*/
/* MDX Export
  <i-callout variant="info" title="info_title">
  
  info_content
  
  </i-callout>
*/
turndownService.addRule("Info", {
  filter: function (node) {
    return node.nodeName === "SECTION" && node.getAttribute("class") === "Info";
  },
  replacement: function (_content, node) {
    const infoTitle = node.querySelector(".InfoTitle").textContent;
    const infoContent = td(node.querySelector(".InfoContent").innerHTML);

    return `<i-callout variant="info" title="${infoTitle}">\n\n${infoContent}\n\n</i-callout>\n`;
  },
});

// Warnings
/* DataModel
  <section class="Warning">
    warning_content_HTML
  </section>
*/
/* MDX Export
  <i-callout variant="warning">

  warning_content_MD
  
  </i-callout>
*/
turndownService.addRule("Warning", {
  filter: function (node) {
    return (
      node.nodeName === "SECTION" && node.getAttribute("class") === "Warning"
    );
  },
  replacement: function (_content, node) {
    const warningContent = td(node.innerHTML);
    return `<i-callout variant="warning">\n\n${warningContent}\n\n</i-callout>\n`;
  },
});

// Callouts
/* DataModel
  <section class="Callout">
    callout_content_HTML
  </section>
*/
/* MDX Export
  <i-callout>
  
  callout_content_MD
  
  </i-callout>
*/
turndownService.addRule("Callout", {
  filter: function (node) {
    return (
      node.nodeName === "SECTION" && node.getAttribute("class") === "Callout"
    );
  },
  replacement: function (_content, node) {
    const calloutContent = td(node.innerHTML);
    return `<i-callout>\n\n${calloutContent}\n\n</i-callout>\n`;
  },
});

// Accordions
/* DataModel
  <div class="accordion accordion-items-stay-open" data-accordion-id="">
    <div class="accordion-item">
        <div class="accordion-header">
            <a class="accordion-button" href="#">
                accordion_title
            </a>
        </div>
        <div class="accordion-collapse collapse show">
            <div class="accordion-body">
                accordion_content_HTML
            </div>
        </div>
    </div>
  </div>
*/
/* MDX Export
  <i-accordion value="first" class-name="prose dark:prose-invert">
    <i-accordion-item value="1" title="accordion_title">
    
    accordion_content_MD

    </i-accordion-item>
  </i-accordion>
*/
turndownService.addRule("Accordion", {
  filter: function (node) {
    return node.nodeName === "DIV" && node.classList.contains("accordion");
  },
  replacement: function (_content, node) {
    const itemsDataModel = Array.from(node.querySelectorAll(".accordion-item"));
    let itemsJsxString = "";
    let count = 0;
    itemsDataModel.map((item) => {
      // Get simple textContent from header.
      const title = item.querySelector(".accordion-header").textContent.trim();

      // Get innerHtml from body. This has not been thoroughly tested, but is intended
      // to preserve e.g., lists, linebreaks that would be lost with .textContent.
      const itemContent = td(item.querySelector(".accordion-body").innerHTML);

      itemsJsxString += `<i-accordion-item value="${(count += 1)}" title="${title}">\n\n${itemContent}\n\n</i-accordion-item>\n`;
    });
    return `<i-accordion value="first" class-name="prose dark:prose-invert">\n${itemsJsxString}</i-accordion>\n`;
  },
});

// Images
/* DataModel
  <figure class="image">
    <img src="image.jpg" alt="image_description" />
    <figcaption>image_caption</figcaption>
  </figure>
*/
/* MDX Export
  <i-image src="image.jpg" alt="image_description">
  image_caption
  </i-image>
*/
turndownService.addRule("Image", {
  filter: function (node) {
    return (
      node.nodeName === "FIGURE" &&
      node.getAttribute("class").startsWith("image")
    );
  },

  replacement: function (_content, node) {
    let firstImg = null;
    let figcaption = null;

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeName === "IMG") firstImg = child;
      if (child.nodeName === "FIGCAPTION") figcaption = child.textContent;
    }

    var attrStr = stringifyAttributes(firstImg, "\n  ");

    if (figcaption) {
      return `<i-image${attrStr}>\n\n${figcaption}\n\n</i-image>`;
    } else {
      return `<i-image${attrStr}>\n</i-image>`;
    }
  },
});

// Math
/* DataModel
  <span class="math-tex">\( mathStr \)</span>
  <span class="math-tex">\[ mathStr \]</span>
*/
/* MDX Export
   $ mathStr $
  $$
  mathStr
  $$
*/
turndownService.addRule("Math", {
  filter: function (node) {
    return (
      node.nodeName === "SPAN" &&
      node.classList.contains("math-tex")
    );
  },
  replacement: function (content, node, options) {
    const mathStr = node.innerHTML
    if (mathStr.startsWith("\\[")) {
      // element is block, use `$$`
      // Replace `\[` with `$$\n` and `\]` with `\n$$`
      return mathStr.replace(/^\\\[/, "$$$$\n").replace(/\\\]$/, "\n$$$$");
    } else if (mathStr.startsWith("\\(")) {
      // element is in-line, use `$`
      // Replace `\(` with ` $` (note the additional space) and `\)` with `$`
      return mathStr.replace(/^\\\(/, " $").replace(/\\\)$/, "$");
    } else {
      console.log(`Math Parsing failed for "${mathStr}"`)
    }
  },
});

// Interactive Coding Sandboxes (REPLs)
// Exports <Sandbox> for JavaScript and <Notebook> for Python
/* DataModel
  <section class="CodingSandbox">
    <pre><code class="language-javascript">code_content</code></pre>
  </section>
*/
/* MDX Export
  <i-sandbox-js code = {`code_content`}>
  </i-sandbox-js>
*/
turndownService.addRule("REPL", {
  filter: function (node) {
    return (
      node.nodeName === "SECTION" &&
      node.getAttribute("class") === "CodingSandbox"
    );
  },
  replacement: function (_content, node) {
    const codeBlock = node.querySelector("pre code");
    const language = codeBlock.className.split("-")[1];

    const codeContent = codeBlock.textContent.trim();

    if (language === "python") {
      return `<i-sandbox-py  page-slug="${pageSlug}" code={\`${codeContent}\`}>\n</i-sandbox-py>\n`;
    } else if (language === "javascript") {
      return `<i-sandbox-js page-slug="${pageSlug}" code={\`${codeContent}\`}>\n</i-sandbox-js>\n`;
    }
  },
});

// Converts linebreaks
// Intended to help HTMLEmbeds create jsx compatible linebreaks.
turndownService.addRule("LineBreaks", {
  filter: "br",
  replacement: function () {
    return "\n\n";
  },
});

module.exports = ({ strapi }) => {
  const md = async (html) => {
    if (!html) return null;
    return td(html);
  };
  return { md };
};
