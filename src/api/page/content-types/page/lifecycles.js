
/*
 *
 * ============================================================
 * WARNING: THIS FILE HAS BEEN COMMENTED OUT
 * ============================================================
 *
 * CONTEXT:
 *
 * The lifecycles.js file has been commented out to prevent unintended side effects when starting Strapi 5 for the first time after migrating to the document service.
 *
 * STRAPI 5 introduces a new document service that handles lifecycles differently compared to previous versions. Without migrating your lifecycles to document service middlewares, you may experience issues such as:
 *
 * - `unpublish` actions triggering `delete` lifecycles for every locale with a published entity, which differs from the expected behavior in v4.
 * - `discardDraft` actions triggering both `create` and `delete` lifecycles, leading to potential confusion.
 *
 * MIGRATION GUIDE:
 *
 * For a thorough guide on migrating your lifecycles to document service middlewares, please refer to the following link:
 * [Document Services Middlewares Migration Guide](https://docs.strapi.io/dev-docs/migration/v4-to-v5/breaking-changes/lifecycle-hooks-document-service)
 *
 * IMPORTANT:
 *
 * Simply uncommenting this file without following the migration guide may result in unexpected behavior and inconsistencies. Ensure that you have completed the migration process before re-enabling this file.
 *
 * ============================================================
 */

// const { generatePageEmbeddings, deleteAllEmbeddings } = require("./embeddings");
// 
// module.exports = {
//   afterCreate: async (event) => {
//     const { result } = event;
//     generatePageEmbeddings(result);
//   },
// 
//   afterUpdate: async (event) => {
//     const { result } = event;
//     generatePageEmbeddings(result);
//   },
// 
//   beforeDelete: async (event) => {
//     const { params } = event;
//     await deleteAllEmbeddings(params.where.id);
//   },
// 
//   beforeDeleteMany: async (event) => {
//     const { params } = event;
//     for (let id of params.where["$and"][0].id["$in"]) {
//       await deleteAllEmbeddings(id);
//     }
//   },
// };
// 