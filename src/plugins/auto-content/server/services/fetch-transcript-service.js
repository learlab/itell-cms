"use strict";

const fetch = require("node-fetch");

module.exports = ({ strapi }) => {
  const getTranscript = async (url, start, end, ctx) => {
    const start_num = parseInt(start);
    const end_num = parseInt(end);

      const response = await fetch(
        `https://itell-api.learlab.vanderbilt.edu/generate/transcript`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "API-Key": process.env.ITELL_API_KEY,
          },
          body: JSON.stringify({
            url: url,
            start_time: start_num,
            end_time: end_num ? end_num : null,
          }),
        },
      );
      if(response.status === 500){
        return ctx.badRequest('Problem obtaining transcript. Contact LearLab for API update.' );
      }

      else if(response.status === 422){
        return ctx.badRequest('Invalid input for the URL.');
      }
      else{
        try{
          const result = await response.json();
          return result.transcript;
        }
        catch(e){
          return ctx.badRequest(`Couldn't parse API result. Contact LearLab for API update: ${e}`);
        }
      }

  };

  return {
    getTranscript,
  };
};
