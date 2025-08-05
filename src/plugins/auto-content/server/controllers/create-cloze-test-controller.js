module.exports = ({ strapi }) => {
  const clozeTestService =
    strapi.plugins["auto-content"].service("clozeTestService");

  const createClozeTest = async (ctx) => {
    const { summary, text } = ctx.request.body;

    if (summary && text && summary.length > 0 && text.length > 0) {
      try {
        return clozeTestService.createClozeTest(summary, text);
      } catch (err) {
        console.log(err);
        ctx.throw(500, err);
      }
    }
    return ctx.throw(400, "Summary and text are required.");
  };

  return {
    createClozeTest,
  };
};
