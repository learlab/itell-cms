module.exports = ({ strapi }) => {
    const volumeSummaryService =
      strapi.plugins["auto-content"].service("volumeSummaryService");

    const createVolumeSummary = async (ctx) => {
      const title = ctx.request.body.title;

      if (title && title.length > 0) {
        try {
          return volumeSummaryService.createVolumeSummary(title);
        } catch (err) {
          console.log(err);
          ctx.throw(500, err);
        }
      }
      return ctx.throw(400, "title is missing.");
    };

    return {
      createVolumeSummary,
    };
  };
