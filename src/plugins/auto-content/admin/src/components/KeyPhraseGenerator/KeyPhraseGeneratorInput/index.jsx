import React, { useState, useEffect } from "react";
import { Button } from "@strapi/design-system";
import { Textarea, Grid } from "@strapi/design-system";
import useDebounce from "./useDebounce";
import { unstable_useContentManagerContext as useContentManagerContext } from "@strapi/strapi/admin";

// Component for raw QA field
export default function Index({
  name,
  error,
  description,
  onChange,
  value,
  intlLabel,
  options,
  attribute,
}) {
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
  function showLoading() {
    const loadingString = "Currently being generated...";

    onChange({
      target: { name, value: loadingString, type: attribute.type },
    });
  }

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

  const generateKeyPhrase = async () => {
    try {
      showLoading();
      // create clean text to feed into QA generation
      const cleanTextFeed = await getTargetText();

      const response = await fetch(`/auto-content/extract-keyphrase`, {
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

      const parsedResponse = await response.json().then((res) => {
        // Probably will need to add a new column in Strapi db if we want to use the JSON feature
        if ("error" in res) {
          return `Error generating kephrases!: ${res.error.message}`;
        } else {
          return res.choices[0].message.content.trim();
        }
      });

      onChange({
        target: { name, value: parsedResponse, type: attribute.type },
      });
    } catch (err) {
      throw new Error(`Error generating kephrases! status: ${err}`);
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
      const generatedCleanText = await response.json().then((res) => {
        return res["contents"];
      });

      return generatedCleanText;
    } catch (err) {
      throw new Error(`Error generating clean text! status: ${err}`);
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

      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }

      let fetchedTranscript;

      try {
        fetchedTranscript = await response.text();
      } catch (error) {
        console.error("Error fetching transcript:", error);
        fetchedTranscript = "Error fetching transcript";
        throw new Error(`Error fetching transcript! status: ${error}`);
      }

      return fetchedTranscript;
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Grid gap={2}>
      <Grid.Item col={12}>
        <Textarea
          fullWidth
          placeholder="This area will show the generated key phrases."
          label={fieldName}
          name="content"
          onChange={(e) =>
            onChange({
              target: { name, value: e.target.value, type: attribute.type },
            })
          }
        >
          {value}
        </Textarea>
      </Grid.Item>
      <Grid.Item col={12}>
        <Button fullWidth onClick={() => generateKeyPhrase()}>
          Extract key phrases from text
        </Button>
      </Grid.Item>
    </Grid>
  );
}
