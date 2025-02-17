module.exports = ({ strapi }) => {
  const mcqGeneratorService =
    strapi.plugins["auto-content"].service("mcqGeneratorService");

  const createMCQ = async (ctx) => {
    const id = ctx.request.body.identifier;
    if (id && id.length > 0) {
      try {
        return mcqGeneratorService.createMCQ(id);
      } catch (err) {
        console.log(err);
        ctx.throw(500, err);
      }
    }
    return ctx.throw(400, "Identifier is missing.");
  };

  return {
    createMCQ,
  };
};
