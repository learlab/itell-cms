import React, { useState, useEffect } from "react";
import {Button, Field, Flex} from "@strapi/design-system";
import { Textarea, Grid } from "@strapi/design-system";
import useDebounce from "./useDebounce";
import { unstable_useContentManagerContext as useContentManagerContext } from "@strapi/strapi/admin";
import PropTypes from 'prop-types';


// Component for raw QA field
const Index = ({
   name,
   attribute,
   value = '',
   labelAction = null,
   label,
   disabled = false,
   error = null,
   required = true,
   hint = '',
   placeholder,
   onChange,
 }) => {
  const { form } = useContentManagerContext();
  const { initialValues, values } = form;

  const [dynamicZone, index, fieldName] = name.split(".");
  const [currentText, setCurrentText] = useState("");
  const [currentVideo, setCurrentVideo] = useState({
    url: "",
    startTime: 0,
    endTime: 0,
  });
  const [targetText, setTargetText] = useState("");

  // check if content type is text or video
  function checkContentType() {
    let allCleanText = ""
    for(let chunk of values.Content){
        if(chunk.__component !== "page.plain-chunk"){
            allCleanText += chunk.CleanText
        }
    }
    return allCleanText;
  }

  // change text to show API is being called
  function showLoading() {
    const loadingString = "Currently being generated...";

    onChange({
      target: { name, value: loadingString, type: attribute.type },
    });
  }

  const createPageSummary = async () => {
    try {
      showLoading();
      // create clean text to feed into QA generation
      const cleanTextFeed = checkContentType();

      const response = await fetch(`/auto-content/create-page-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(window.sessionStorage.jwtToken)}`,
        },
        body: JSON.stringify({
          text: cleanTextFeed,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      let parsedResponse = await response.json()

      if ("error" in parsedResponse) {
        parsedResponse = `Error generating page summary!: ${parsedResponse.error.message}`;
      }
      else if(parsedResponse.choices[0].message.content.trim().length === 0 && parsedResponse.choices[0].finish_reason === "length"){
        parsedResponse = `Error generating page summary: ran out of tokens. `;
      } else {
        parsedResponse =  parsedResponse.choices[0].message.content.trim();
      }

      onChange({
        target: { name, value: parsedResponse, type: attribute.type },
      });
    } catch (err) {
      throw new Error(`Error generating page summary! status: ${err}`);
    }
  };

  return (
    <Field.Root
      name={name}
      id={name}
      error={error}
      hint={hint}
      required={required}
    >
      <Flex direction="column" alignItems="stretch" gap={1}>
        <Field.Label action={labelAction}>{name}</Field.Label>
        <Textarea
          placeholder='Write a one-paragraph summary of this page here, or press "Create Page Summary" to generate it.'
          name="content"
          value={value}
          onChange={(e) =>
            onChange({
              target: { name, value: e.target.value, type: attribute.type },
            })}
        >
          {value}
        </Textarea>
        <Field.Hint />
        <Field.Error />
      </Flex>
      <Flex direction="column" alignItems="stretch" gap={1}>
        <Button fullWidth onClick={() => createPageSummary()}>
          Create Page Summary
        </Button>
      </Flex>
    </Field.Root>
  );
}

Index.propTypes = {
  name: PropTypes.string.isRequired,
  attribute: PropTypes.object.isRequired,
  value: PropTypes.string,
  labelAction: PropTypes.object,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  required: PropTypes.bool,
  hint: PropTypes.string,
  placeholder: PropTypes.string,
};

const MemoizedInput = React.memo(Index);

export default MemoizedInput;
