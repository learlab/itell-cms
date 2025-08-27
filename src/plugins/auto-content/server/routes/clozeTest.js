module.exports = {
  // accessible only from admin UI
  type: "admin",
  routes: [
    {
      method: "POST",
      path: "/create-cloze-test",
      handler: "clozeTestField.createClozeTest",
      config: { policies: [] },
    },
  ],
};
