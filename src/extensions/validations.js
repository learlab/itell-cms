"use strict";
const { ApplicationError } = require("@strapi/utils");
const yup = require("yup");

function validateKeyPhraseField(event) {
  const { data } = event.params;
  const keyphrase_string = data.KeyPhrase ? data.KeyPhrase : "[]";
  try {
    if(keyphrase_string.search(/^((\w| |\n)+,)+((\w| |\n)+)$/g) === -1){
      throw new Error('Invalid Keyphrase format');
    }
  } catch {
    throw new ApplicationError(
      `Header: ${data.Header}\nKeyphrase Parsing Error: ${keyphrase_string}`,
    );
  }
}

module.exports = {
  validateKeyPhraseField,
};
