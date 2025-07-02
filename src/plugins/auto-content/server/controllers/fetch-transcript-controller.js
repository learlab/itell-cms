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
    return fetchTranscriptService.getTranscript(url, startTime, endTime, ctx);
  };

  return {
    fetchTranscript,
  };
};
