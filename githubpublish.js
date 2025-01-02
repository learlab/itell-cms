const fs = require("fs");

let hasModules = true;
let hasChapters = true;

const URL = "https://itell-strapi-um5h.onrender.com/api/";
const pagesQuery = "?populate[Pages][populate][0]=Content&populate[Pages][populate][1]=Chapter";
const chaptersQuery =
  "?populate[0]=Chapters.Pages.Quiz.Questions.Answers&populate[1]=Chapters.Pages.Content";
const modulesQuery =
  "?populate[0]=Modules&populate[1]=Modules.Chapters.Pages&populate[2]=Modules.Chapters.Pages.Content";

const headerFindingRegex = /(#{3,}[\w -]+)/g;

const userGuideDocumentID="ndmsjtkd9fc5wi3ivaudxrdx"


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

async function parseChapters(textData){
  let nextSlug = "null"
  for(let chapterIndex in textData){
    let chapter = textData[chapterIndex];
    if(parseInt(chapterIndex) === textData.length - 1){
      nextSlug = "null"
    }
    else{
      nextSlug = textData[parseInt(chapterIndex) + 1]["Pages"][0]["Slug"]
    }
    chapter["Pages"] = chapter["Pages"].reverse()
    for(let i in chapter["Pages"]){
      let page = chapter["Pages"][i]
      await writePage(page, `  title: ${chapter["Title"]}\n  slug: ${chapter["Slug"]}`,
        parseInt(i) === chapter["Pages"].length-1? nextSlug : chapter["Pages"][parseInt(i) + 1]["Slug"]);
    }
  }
}

async function writePage(pageData, parents, nextSlug){
  let header = "---\n"
  let stream = fs.createWriteStream(`./output/textbook/${pageData["Slug"]}.md`);
  header += `assignments:${pageData["HasSummary"] ? "\n- summary" : "null"}\n`
  header += "chunks:\n"
  let cris = []
  for(let chunk of pageData["Content"]){
    let type
    if(chunk["__component"] === "page.chunk"){
      type = "regular"
    }
    else if(chunk["__component"] === "page.plain-chunk"){
      type = "plain"
    }
    else{
      type = "video"
    }

    header += `- title: ${chunk["Header"]}\n  slug: ${chunk["Slug"]}\n  type: ${type}\n`
    let matches = chunk["MDX"].match(headerFindingRegex)
    if(matches !== null){
      header += "  headings:\n"
      for(let heading of matches){
        header += `  - level: ${heading.includes("####") ? "4" : "3"}\n    slug: ${heading.replaceAll("#", "").toLowerCase().trim().replaceAll(" ", "-")}\n    title:${heading.replaceAll("#", "")}\n`
      }
    }
    if(chunk["Question"] && chunk["Question"] !== null){
      cris.push(`question: ${chunk["Question"]}\n  answer: ${chunk["ConstructedResponse"]}\n  slug: ${chunk["Slug"]}`)
    }
  }
  if(cris.length === 0){
    header += "cri: []\n"
  }
  else{
    header += "cri: \n"
    for(let cri of cris){
      header += `- ${cri}\n`
    }
  }
  header += `next_slug: ${nextSlug}\norder: ${pageData["Order"]}\nparent:\n${parents}\n`
  if(pageData["Quiz"] === null){
    header += "quiz: null\n"
  }
  else{
    header += "quiz:\n"
    let questions = pageData["Quiz"]["Questions"]
    for(let question of questions){
      header += `- question: "${question["Question"].replaceAll("\t", "\\t")}"\n  answers:\n`
      for(let answer of question["Answers"]){
        header += `  - answer: "${answer["Text"].replaceAll("\t", "\\t")}"\n    correct: ${answer["IsCorrect"]}\n`
      }
    }
  }
  header += `slug: ${pageData["Slug"]}\ntitle: ${pageData["Title"]}\n`
  header += "---\n\n"
  stream.write(header)
  let content = ""
  for(let chunk of pageData["Content"]){

    /***
     * This part uses the MDX for video chunks because right now they don't have MD field implemented for video chunks
     */
    if(chunk["__component"]==="page.video"){
      let matches = chunk["MDX"].match(headerFindingRegex)

      if(matches !== null) {
        for(let match of matches){
          chunk["MDX"] = chunk["MDX"].replace(match, match + `{#${match.replaceAll("#", "").toLowerCase().trim().replaceAll(" ", "-")}}`)
        }
      }

      content += `## ${chunk["Header"]} {${chunk["Slug"]} ${chunk["ShowHeader"] ? "" : ".sr-only"}}\n\n${chunk["MDX"].replaceAll(/[\u200B-\u200D\uFEFF\u00A0]/g, "")}\n\n`
    }
    else{
      let matches = chunk["MD"].match(headerFindingRegex)

      if(matches !== null) {
        for(let match of matches){
          chunk["MD"] = chunk["MD"].replace(match, `${match} {#${match.replaceAll("#", "").toLowerCase().trim().replaceAll(" ", "-")}}`)
        }
      }
      content += `## ${chunk["Header"]} {#${chunk["Slug"]} ${chunk["ShowHeader"] ? "" : ".sr-only"}}\n\n${chunk["MD"].replaceAll(/[\u200B-\u200D\uFEFF\u00A0]/g, " ")}\n\n`
    }
  }
  stream.write(content)
}
async function createGuide(){
  const guideRes = await fetch(`${URL}texts/${userGuideDocumentID}?populate[0]=Pages.Content`, {
    cache: "no-store",
  });
  let guideData = await guideRes.json();
  let guidePage = guideData["data"]["Pages"][0]
  let stream = fs.createWriteStream(`./output/guide/user-guide.md`);

  let header = "---\ncondition: stairs\n---\n\n"
  stream.write(header)
  for(let chunk of guidePage["Content"]){
    stream.write(`## ${chunk["Header"]}\n${chunk["MD"].replaceAll(/[\u200B-\u200D\uFEFF\u00A0]/g, "")}\n`)
  }
}

async function run() {
  let textId = getTextID();
  let textData = await getTextData(textId);

  hasChapters = textData["Chapters"].length > 0;
  hasModules = textData["Modules"].length > 0;

  makeDir("./output/textbook/")
  makeDir("./output/guide/")

  /***
   * THIS PART DOES NOT HAVE THE MODULES IN PLACE YET. I HAVE NO IDEA WHAT MODULES LOOK LIKE IN ITELL MD AS OF NOW.
   * WILL ADD MODULE SUPPORT ONCE CLARIFICATION HAS BEEN RECEIVED
   */

  if(hasChapters){
    const res = await fetch(`${URL}texts/${textId}${chaptersQuery}`, {
      cache: "no-store",
    });
    let data = await res.json();
    await parseChapters(data["data"]["Chapters"])
  }
  else{
    const res = await fetch(`${URL}texts/${textId}${pagesQuery}`, {
      cache: "no-store",
    });
    let data = await res.json();
    const pages = data["data"]["Pages"];
    for(let i in pages){
      let page = pages[i]
      await writePage(page, "null", i === pages.length-1? "null" : pages[i + 1]["Slug"]);
    }
  }

  // create user guide
  await createGuide();
}

run();
