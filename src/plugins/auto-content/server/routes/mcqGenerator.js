module.exports = {
  // accessible only from admin UI
  type: "admin",
  routes: [
    {
      method: "POST",
      path: "/create-mcq",
      handler: "mcqGeneratorField.createMCQ",
      config: { policies: [] },
    },
  ],
};
