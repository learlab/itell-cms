module.exports = {
  // accessible only from admin UI
  type: "admin",
  routes: [
    {
      method: "POST",
      path: "/create-volume-summary",
      handler: "volumeSummaryField.createVolumeSummary",
      config: { policies: [] },
    },
  ],
};