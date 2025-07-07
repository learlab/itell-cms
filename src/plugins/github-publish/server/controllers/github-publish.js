const axios = require("axios");

const pluginId = "plugin.github-publish";

module.exports = ({ strapi }) => ({
  // Check if workflow is in_progress https://docs.github.com/en/rest/reference/actions#list-workflow-runs
  check: async (ctx) => {
    const { owner, repo, workflow_id, token, branch } =
      strapi.config.get(pluginId);

    const headers = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${token}`,
    };

    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/runs?branch=${branch}`;

    const { data: inProgressData } = await axios.get(
      `${url}&status=in_progress`,
      {
        headers,
      },
    );
    const { data: queuedData } = await axios.get(`${url}&status=queued`, {
      headers,
    });
    const busy = !!(inProgressData.total_count + queuedData.total_count);

    let lastWeek = new Date();
    lastWeek.setMinutes(lastWeek.getMinutes() - (1440 * 7));

    let table_url = `https://api.github.com/repos/${owner}/${repo}/actions/runs?created=>${lastWeek.toISOString()}&branch=${branch}&event=workflow_dispatch`
    console.log(table_url)

    const response = await axios.get(table_url);

    let runs = response['data']['workflow_runs'];


    // const logHeaders = {
    //   Authorization: `token ${token}`,
    // };
    // let logs = await (axios.get("https://api.github.com/repos/learlab/itell-rs/actions/jobs/44988551414/logs", {headers}))
    // console.log(logs)
    ctx.send({ busy });
  },

  publish: async (ctx) => {
    const {
      owner,
      repo,
      workflow_id,
      token,
      branch: ref,
    } = strapi.config.get(pluginId);

    const headers = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${token}`,
    };

    const inputs = ctx.request.body;

    const data = {
      ref: ref,
      inputs,
    };

    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`;

    try {
      const response = await axios.post(url, data, { headers });
      const success = response.status === 204;

      const statusUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/runs?branch=${ref}`;

      const { data: inProgressData } = await axios.get(
        `${statusUrl}&status=in_progress`,
        {
          headers,
        },
      );

      const { data: queued } = await axios.get(
        `${statusUrl}&status=queued`,
        {
          headers,
        },
      );

      console.log(inProgressData.total_count)
      console.log(queued.total_count)

      ctx.send({ success });
    } catch (error) {
      // Log the full error response for debugging
      console.error(
        "Error triggering GitHub workflow:",
        error.response?.data || error.message,
      );
      ctx.throw(500, "Failed to trigger GitHub workflow " + error.message);
    }
  },

  getTexts: (ctx) => {
    const text_json = strapi.config.get(pluginId);
    return {
      text_json,
    };
  },
});
