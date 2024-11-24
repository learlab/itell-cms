const fs = require("fs");

let hasModules = true;
let hasChapters = true;

const URL = "https://strapi-blue.onrender.com/api/";
const pagesQuery = "?populate[Pages][populate][0]=Content";
const chaptersQuery =
  "?populate[0]=Chapters&populate[1]=Chapters.Pages&populate[2]=Chapters.Pages.Content";
const modulesQuery =
  "?populate[0]=Modules&populate[1]=Modules.Chapters.Pages&populate[2]=Modules.Chapters.Pages.Content";

function getTextID() {
  if (process.argv.length === 2) {
    console.error("Expected at least one argument!");
    process.exit(1);
  }
  return process.argv[2];
}

async function getTextData(textID) {
  const res = await fetch(`${URL}texts/${textID}?populate=*`, {
    cache: "no-store",
  });

  let data = await res.json();

  if (data["data"] == null) {
    process.exit(1);
  }

  return data["data"];
}

function makeDir(path) {
  if (!fs.existsSync(path)) {
    fs.mkdir(path, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
}

async function entryPages(pages, startingPath) {
  for (let i = 0; i < pages.length; ++i) {
    let pageData = pages[i];

    let path = startingPath;
    let stream;

    if (hasChapters) {
      if (i !== 0) {
        path = startingPath + "section-" + i + ".mdx";
        stream = fs.createWriteStream(path);
        stream.write(
          '---\ntitle: "' +
            pageData["Title"] +
            '"' +
            "\npage_slug: " +
            pageData["Slug"] +
            "\nsummary: " +
            pageData["HasSummary"] +
            "\nquiz: " +
            (pageData["Quiz"] !== null) +
            "\nreference_summary: " +
            pageData["ReferenceSummary"] +
            "\n---\n",
        );
      } else {
        path = startingPath + "index.mdx";
        stream = fs.createWriteStream(path);
        stream.write(
          '---\ntitle: " ' +
            pageData["Title"] +
            '"' +
            "\npage_slug: " +
            pageData["Slug"] +
            "\nsummary: " +
            pageData["HasSummary"] +
            "\nquiz: " +
            (pageData["Quiz"] !== null) +
            "\n---\n",
        );
      }
    } else {
      path = startingPath + "chapter-" + i + ".mdx";
      stream = fs.createWriteStream(path);
      stream.write(
        '---\ntitle: "' +
          pageData["Title"] +
          '"' +
          "\npage_slug: " +
          pageData["Slug"] +
          "\nsummary: " +
          pageData["HasSummary"] +
          "\nquiz: " +
          (pageData["Quiz"] !== null) +
          "\n---\n",
      );
    }

    for (let l = 0; l < pageData["Content"].length; ++l) {
      let curChunk = pageData["Content"][l];
      if (
        curChunk["__component"] === "page.chunk" ||
        curChunk["__component"] === "page.plain-chunk"
      ) {
        let chunkSlug = curChunk["Slug"];
        if (curChunk["Slug"] != null) {
          chunkSlug = chunkSlug.replaceAll('"', "");
        } else {
          chunkSlug = "";
        }

        let inputString = `<section className="content-chunk" aria-labelledby="${chunkSlug}" data-subsection-id="${chunkSlug}"`;
        stream.write(inputString);
        if (curChunk.ShowHeader) {
          stream.write(` data-show-header="true">\n\n`);
          if (curChunk.HeaderLevel === "H3") {
            stream.write(`### ${curChunk.Header} \\{#${chunkSlug}}\n\n`);
          } else if (curChunk.HeaderLevel === "H4") {
            stream.write(`#### ${curChunk.Header} \\{#${chunkSlug}}\n\n`);
          } else {
            stream.write(`## ${curChunk.Header} \\{#${chunkSlug}}\n\n`);
          }
        } else {
          stream.write(` data-show-header="false">\n\n`);
          stream.write(
            `<h2 className="sr-only" id="${chunkSlug}">${curChunk.Header}</h2>\n\n`,
          );
        }
        if (curChunk.MDX != null) {
          stream.write(
            /*
            Replaces:
            1. 0 width space characters
            2. <br> in old html embed components (legacy)
            3. Adds pageSlugs to sandboxes
            4. Adds pageSlugs to sandboxes (legacy)
             */
            curChunk.MDX.replaceAll(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
              .replaceAll(/(<br\s*\/?>\s*)+/g, "\n\n")
              .replaceAll("__temp_slug__", pageData["Slug"])
              .replaceAll("test-page-no-chunks", pageData["Slug"]),
          );
        }
        stream.write("\n\n</section>\n\n");
      } else if (curChunk["__component"] === "page.video") {
        // fill in later
      }
    }
    stream.end();
  }
}

async function makeModules(textId) {
  const data = await fetch(`${URL}texts/${textId}${modulesQuery}`, {
    cache: "no-store",
  });
  const newTextData = await data.json();
  const moduleInformation = newTextData["data"]["Modules"];
  for (let i = 0; i < moduleInformation.length; ++i) {
    makeDir("./output/module-" + (i + 1));

    let chaptersData = moduleInformation[i]["Chapters"];
    let chapterPath;
    for (let j = 0; j < chaptersData.length; ++j) {
      if (chaptersData[j]["ChapterNumber"] == null) {
        chapterPath =
          "./output/module-" + (i + 1) + "/chapter-" + (j + 1) + "/";
      } else {
        chapterPath =
          "./output/module-" +
          (i + 1) +
          "/chapter-" +
          chaptersData[j]["ChapterNumber"] +
          "/";
      }
      makeDir(chapterPath);
      await entryPages(chaptersData[j]["Pages"], chapterPath);
    }
  }
}

async function makeChapters(textId) {
  const data = await fetch(`${URL}texts/${textId}${chaptersQuery}`, {
    cache: "no-store",
  });
  const newTextData = await data.json();
  const chapterList = newTextData["data"]["Chapters"];
  let chapterPath;
  for (let i = 0; i < chapterList.length; ++i) {
    if (chapterList[i]["ChapterNumber"] == null) {
      chapterPath = "./output/chapter-" + (i + 1) + "/";
    } else {
      chapterPath =
        "./output/chapter-" +
        chapterList[i]["ChapterNumber"] +
        "/";
    }
    makeDir(chapterPath);
    let pages = chapterList[i]["Pages"];

    if (pages) {
      await entryPages(pages, chapterPath);
    }
  }
}

async function run() {
  let textId = getTextID();
  let textData = await getTextData(textId);

  hasChapters = textData["Chapters"].length > 0;
  hasModules = textData["Modules"].length > 0;

  if (!fs.existsSync("./output/")) {
    fs.mkdir("./output/", (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  if (hasModules) {
    await makeModules(textId);
  } else if (hasChapters) {
    await makeChapters(textId);
  } else {
    const res = await fetch(`${URL}texts/${textId}${pagesQuery}`, {
      cache: "no-store",
    });
    let data = await res.json();
    const pages = data["data"]["Pages"];
    await entryPages(pages, "output/");
  }
}

run();
