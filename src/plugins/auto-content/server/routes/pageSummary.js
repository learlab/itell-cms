module.exports = {
    // accessible only from admin UI
    type: "admin",
    routes: [
      {
        method: "POST",
        path: "/create-page-summary",
        handler: "pageSummaryField.createPageSummary",
        config: { policies: [] },
      },
    ],
  };