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
      const blockType = language === "python" ? "Notebook" : "Sandbox";
      return `<${blockType} pageSlug="${pageSlug}" code=""/>\n`;
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
  <Info title="info_title">
    info_content
  </Info>
*/
turndownService.addRule("Info", {
  filter: function (node) {
    return node.nodeName === "SECTION" && node.getAttribute("class") === "Info";
  },
  replacement: function (_content, node) {
    const infoTitle = node.querySelector(".InfoTitle").textContent;
    const infoContent = td(node.querySelector(".InfoContent").innerHTML);

    return `<Info title="${infoTitle}">\n${infoContent}\n</Info>\n`;
  },
});

// Warnings
/* DataModel
  <section class="Warning">
    warning_content_HTML
  </section>
*/
/* MDX Export
  <Warning>
    warning_content_MD
  </Warning>
*/
turndownService.addRule("Warning", {
  filter: function (node) {
    return (
      node.nodeName === "SECTION" && node.getAttribute("class") === "Warning"
    );
  },
  replacement: function (_content, node) {
    const warningContent = td(node.innerHTML);
    return `<Warning>\n${warningContent}\n</Warning>\n`;
  },
});

// Callouts
/* DataModel
  <section class="Callout">
    callout_content_HTML
  </section>
*/
/* MDX Export
  <Callout>
    callout_content_MD
  </Callout>
*/
turndownService.addRule("Callout", {
  filter: function (node) {
    return (
      node.nodeName === "SECTION" && node.getAttribute("class") === "Callout"
    );
  },
  replacement: function (_content, node) {
    const calloutContent = td(node.innerHTML);
    return `<Callout>\n${calloutContent}\n</Callout>\n`;
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
  <Accordion value="first" className="prose dark:prose-invert">
    <AccordionItem value="1" title="accordion_title">
        accordion_content_MD
    </AccordionItem>
  </Accordion>
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

      itemsJsxString += `<AccordionItem value="${(count += 1)}" title="${title}">\n${itemContent}\n</AccordionItem>\n`;
    });
    return `<Accordion value="first" className="prose dark:prose-invert">\n${itemsJsxString}</Accordion>\n`;
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
  <Image src="image.jpg" alt="image_description">
    image_caption
  </Image>
*/
turndownService.addRule("Image", {
  filter: function (node) {
    return (
      node.nodeName === "FIGURE" &&
      node.getAttribute("class").startsWith("image")
    );
  },

  replacement: function (_content, node) {
    const tag = "Image";
    let firstImg = null;
    let figcaption = null;

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeName === "IMG") firstImg = child;
      if (child.nodeName === "FIGCAPTION") figcaption = child.textContent;
    }

    var attrStr = stringifyAttributes(firstImg, "\n  ");

    if (figcaption) {
      return `<${tag}${attrStr}>\n${figcaption}\n</${tag}>`;
    } else {
      return `<${tag}${attrStr} />`;
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
  <Sandbox code = {`code_content`}/>
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
      return `<Notebook  pageSlug="${pageSlug}" code={\`${codeContent}\`}/>\n`;
    } else if (language === "javascript") {
      return `<Sandbox pageSlug="${pageSlug}" code={\`${codeContent}\`}/>\n`;
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
  const mdx = async (html) => {
    html = html.replaceAll(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
    if (!html) return null;
    return td(html);
  };
  return { mdx };
};
