"use strict";
const { errors } = require('@strapi/utils');
const { ApplicationError } = errors;
const yup = require("yup");

function validateKeyPhraseField(event) {
  const { data } = event.params;
  const keyphrase_string = data.KeyPhrase ? data.KeyPhrase : "";
  try {
    if(keyphrase_string.length > 0 && keyphrase_string.search(/^((\w| |\n-)+,)+((\w| |\n-)+)$/g) === -1){
      throw new Error('Invalid Keyphrase format');
    }
  } catch {
    throw new ApplicationError(
      `Keyphrase Parsing Error: ${keyphrase_string}`,
    );
  }
}

module.exports = {
  validateKeyPhraseField,
};
