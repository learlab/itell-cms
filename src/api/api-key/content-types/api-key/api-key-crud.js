"use strict";

async function createAPIKey(ctx) {
  const payload = {
    nickname: ctx.Nickname,
    role: ctx.Role,
  };
  const api_key = await strapi
    .service("api::api-key.api-key")
    .generateAPIKey(payload);

  console.log(api_key, ctx.id);


  const entry = await strapi.entityService.update('api::api-key.api-key', ctx.id, {
    data: {
      ApiKey: api_key,
    },
  });

  return entry;
}

async function deleteAPIKey(id) {
  const entry = await strapi.entityService.findOne('api::api-key.api-key', id, {
  });
  const payload = {
    api_key: entry.api_key,
  };

  await strapi.service("api::api-key.api-key").deleteAPIKey(payload);
}

module.exports = {
  createAPIKey,
  deleteAPIKey,
};
