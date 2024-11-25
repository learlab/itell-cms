module.exports = ({ strapi }) => {
    const pageSummaryService =
      strapi.plugins["auto-content"].service("pageSummaryService");
  
    const createPageSummary = async (ctx) => {
      const text = ctx.request.body.text;
  
      if (text && text.length > 0) {
        try {
          return pageSummaryService.createPageSummary(text);
        } catch (err) {
          console.log(err);
          ctx.throw(500, err);
        }
      }
      return ctx.throw(400, "Text is missing.");
    };
  
    return {
        createPageSummary,
    };
  };
  