module.exports = ({ strapi }) => {
    const volumeSummaryService =
      strapi.plugins["auto-content"].service("volumeSummaryService");
  
    const createVolumeSummary = async (ctx) => {
      const text = ctx.request.body.text;
  
      if (text && text.length > 0) {
        try {
          return volumeSummaryService.createVolumeSummary(text);
        } catch (err) {
          console.log(err);
          ctx.throw(500, err);
        }
      }
      return ctx.throw(400, "Text is missing.");
    };
  
    return {
      createVolumeSummary,
    };
  };
  