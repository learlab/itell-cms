module.exports = ({ env }) => ({
  'github-publish': {
    enabled: true,
    config: {
      owner: "learlab", // The GitHub organisation or user
      repo: "itell-rs", // The name of the repository
      workflow_id: "fetch-volume.yml", // The workflow_id or filename
      token: env("GITHUB_TOKEN"), // The GitHub personal access token with access to trigger workflows and view build status
      branch: "main", // The branch the workflow should be triggered on
      text_json: env("TEXT_JSON"),
    },
    resolve: './src/plugins/github-publish'
  },
  upload: {
    config: {
      provider: "strapi-provider-upload-supabase",
      providerOptions: {
        apiUrl: env("SUPABASE_API_URL"),
        apiKey: env("SUPABASE_API_KEY"),
        bucket: env("SUPABASE_BUCKET"),
        directory: env("SUPABASE_DIRECTORY"),
        options: {},
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  'auto-content': {
    enabled: true,
    resolve: "./src/plugins/auto-content",
    config: {
      API_TOKEN: env("OPEN_AI_API_TOKEN"),
    }
  },
  ckeditor: {
    enabled: true,
    resolve: "./src/plugins/ckeditor"
  },
  'preview-button': {
    enabled: true,
    config: {
      contentTypes: [
        {
          uid: 'api::page.page',
          targetField: 'id',
          draft: {
            url: 'https://itell-preview.vercel.app/?page={id}',
          },
          published: {
            url: 'https://itell-preview.vercel.app/?page={id}',
          },
        }
      ]
    }
  }
});
