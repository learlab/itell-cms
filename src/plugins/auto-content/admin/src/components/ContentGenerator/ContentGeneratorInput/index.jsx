import React, { useState, useEffect } from "react";
import {Button, Field, Flex} from '@strapi/design-system';
import { Textarea, Grid } from "@strapi/design-system";
import { unstable_useContentManagerContext as useContentManagerContext } from "@strapi/strapi/admin";
import useDebounce from "./useDebounce";
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
 }) =>{
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

  const debouncedTextFieldValue = useDebounce(
    values[dynamicZone][index]["Text"],
    300,
  );

  const debouncedVideoFieldValue = useDebounce(
    {
      url: values[dynamicZone][index]["URL"],
      startTime: values[dynamicZone][index]["StartTime"],
      endTime: values[dynamicZone][index]["EndTime"],
    },
    300,
  );

  // check if content type is text or video
  function checkContentType() {
    return "Text" in values[dynamicZone][index];
  }

  // change text to show API is being called
  // needs to be a dict since other custom fields (question and answer) expect it
  function showLoading() {
    const loadingJSON = JSON.stringify({
      question: "Currently being generated...",
      answer: "Currently being generated...",
    });
    onChange({
      target: { name, value: loadingJSON, type: attribute.type },
    });
  }

  useEffect(() => {
    let curJSON;
    try {
      curJSON = JSON.parse(value);
    } catch (error) {
      curJSON = JSON.stringify({ question: "", answer: "" });
    }
    let newJSON = curJSON;

    if (values[dynamicZone][index]["Question"]) {
      const newQuestion = values[dynamicZone][index]["Question"];
      if (newQuestion !== curJSON["question"]) {
        newJSON = { ...newJSON, question: newQuestion };
      }
    }

    if (values[dynamicZone][index]["ConstructedResponse"]) {
      const newConstructedResponse =
        values[dynamicZone][index]["ConstructedResponse"];
      if (newConstructedResponse !== curJSON["answer"]) {
        newJSON = { ...newJSON, answer: newConstructedResponse };
      }
    }

    if (JSON.stringify(newJSON) !== JSON.stringify(curJSON)) {
      onChange({
        target: { name, value: JSON.stringify(newJSON), type: attribute.type },
      });
    }
  }, [
    values[dynamicZone][index]["Question"],
    values[dynamicZone][index]["ConstructedResponse"],
  ]);

  async function getTargetText() {
    let cleanTextFeed;
    // Check content type
    const contentIsText = checkContentType();
    // If content type is text
    if (contentIsText) {
      // Check if same text has been used for cleanText generation
      if (debouncedTextFieldValue == currentText) {
        return targetText;
      } else {
        setCurrentText(debouncedTextFieldValue);
        cleanTextFeed = await generateCleanText();
        setTargetText(cleanTextFeed);
        return cleanTextFeed;
      }
    } else {
      // If content type is video
      // Check if same transcript has been used for cleanText generation
      if (
        debouncedVideoFieldValue["url"] == currentVideo["url"] &&
        debouncedVideoFieldValue["startTime"] == currentVideo["startTime"] &&
        debouncedVideoFieldValue["endTime"] == currentVideo["endTime"]
      ) {
        return targetText;
      } else {
        setCurrentVideo({
          url: debouncedVideoFieldValue["url"],
          startTime: debouncedVideoFieldValue["startTime"],
          endTime: debouncedVideoFieldValue["endTime"],
        });
        cleanTextFeed = await fetchTranscript();
        setTargetText(cleanTextFeed);
        return cleanTextFeed;
      }
    }
  }

  // could use values.publishedAt === null to only allow content generation for unpublished content
  // authors would have to unpublish their content to re-generate the content

  const generateQA = async () => {
    try {
      showLoading();
      // create clean text to feed into QA generation
      const cleanTextFeed = await getTargetText();

      if(!cleanTextFeed){
        return
      }

      const response = await fetch(`/auto-content/generate-question`, {
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
      let parsedResponse = await response.json().then((res) => {
        return res.choices[0].message.content.trim();
      });

      let jsonResponse;

      // Check if output can be converted to JSON
      // Could use a JSON field instead of text field.
      try {
        jsonResponse = JSON.parse(parsedResponse);
      } catch (err) {
        parsedResponse = JSON.stringify({
          question:
            "Automatic question-generation has failed. Please try again.",
          answer: "Automatic answer-generation has failed. Please try again.",
        });
      }

      onChange({
        target: { name, value: parsedResponse, type: attribute.type },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const generateCleanText = async () => {
    try {
      // call CleanText service
      const response = await fetch(`/auto-content/clean-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(window.sessionStorage.jwtToken)}`,
        },
        body: JSON.stringify({
          text: `${debouncedTextFieldValue}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      return await response.text();
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTranscript = async () => {
    try {
      const payload = JSON.stringify({
        url: `${debouncedVideoFieldValue["url"]}`,
        startTime: `${debouncedVideoFieldValue["startTime"]}`,
        endTime: `${debouncedVideoFieldValue["endTime"]}`,
      });
      // fetch transcript service
      const response = await fetch(`/auto-content/fetch-transcript`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(window.sessionStorage.jwtToken)}`,
        },
        body: payload,
      });
      let fetchedTranscript;

      try {
        fetchedTranscript = await response.text();

        if(fetchedTranscript.includes("Error: ")){
          alert(fetchedTranscript)
        }
        else{
          return fetchedTranscript;
        }
      } catch (error) {
        console.log(error)
      }

    } catch (err) {
      console.log(error)
    }
  };

  // for testing. Might be nice to do something like
  // if process.env.NODE_ENV === "development"
  // but I don't really know if that would work.
  // useEffect(() => {
  //   console.log(modifiedData[dynamicZone][index]["Text"],);
  // }, [modifiedData[dynamicZone][index]["Text"],]);
  // end testing

  return (
    <Field.Root
      name={name}
      id={name}
      error={error}
      hint={hint}
      required={required}
    >
      <Flex direction="column" alignItems="stretch" gap={1}>
        <Field.Label action={labelAction}>{fieldName}</Field.Label>
        <Button fullWidth onClick={() => generateQA()}>
        Generate question and answer pair
        </Button>
        <Field.Hint />
        <Field.Error />
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
