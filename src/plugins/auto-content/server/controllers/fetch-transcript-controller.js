const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;

module.exports = ({ strapi }) => {
  const fetchTranscriptService = strapi.plugins["auto-content"].service(
    "fetchTranscriptService",
  );

  const fetchTranscript = async (ctx) => {
    const url = ctx.request.body.url;
    const startTime = ctx.request.body.startTime;
    const endTime = ctx.request.body.endTime;
    console.log("URL: " + url, typeof url)
    if (url !== "undefined" && url !== "null" && url !== "") {
      try {
        return fetchTranscriptService.getTranscript(url, startTime, endTime);
      } catch (err) {
        console.log(err)
      }
    }
    else{
      return "Error: Blank URL provided. Please input URL"
    }
  };

  return {
    fetchTranscript,
  };
};
