import { Button, Field, Flex } from "@strapi/design-system";
import { JSONInput } from "@strapi/design-system";
import { unstable_useContentManagerContext as useContentManagerContext } from "@strapi/strapi/admin";
import PropTypes from "prop-types";
import React, { useState } from "react";

const Index = ({
  name,
  attribute,
  value = "",
  labelAction = null,
  label,
  disabled = false,
  error = null,
  required = true,
  hint = "",
  placeholder,
  onChange,
}) => {
  const { form } = useContentManagerContext();
  const { values } = form;

  const [dynamicZone, index, fieldName] = name.split(".");

  // Get page summary and text for cloze generation
  function getPageSummaryAndText() {
    const summary = values.PageSummary;
    let text = "";

    if (Array.isArray(values.Content)) {
      for (const item of values.Content) {
        if (item.__component === "page.chunk" && item.Text) {
          text += item.Text + "\n";
        }
        if (item.__component === "page.video" && item.CleanText) {
          text += item.CleanText + "\n";
        }
        // Ignore page.plain-chunk
      }
    }

    return { summary, text: text.trim() };
  }

  // change text to show API is being called
  function showLoading() {
    const loadingString = "Currently being generated...";

    onChange({
      target: { name, value: loadingString, type: attribute.type },
    });
  }

  const createClozeTest = async () => {
    try {
      showLoading();

      // Get page summary and text for cloze generation
      const { summary, text } = getPageSummaryAndText();

      if (!summary || !text) {
        throw new Error(
          "Page summary and content are required to generate cloze test",
        );
      }

      const response = await fetch(`/auto-content/create-cloze-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(window.sessionStorage.jwtToken)}`,
        },
        body: JSON.stringify({
          summary,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }

      const parsedResponse = await response.json();

      if ("error" in parsedResponse) {
        throw new Error(
          `Error generating cloze test: ${parsedResponse.error.message}`,
        );
      } else {
        // Store the cloze test result as JSON
        onChange({
          target: {
            name,
            value: JSON.stringify(parsedResponse),
            type: attribute.type,
          },
        });
      }
    } catch (err) {
      console.error("Error generating cloze test:", err);
      onChange({
        target: {
          name,
          value: `Error generating cloze test: ${err.message}`,
          type: attribute.type,
        },
      });
    }
  };

  // Parse JSON for display
  const displayValue = (() => {
    try {
      if (!value) return "";
      // Parse and re-stringify with proper formatting
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  })();

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
        <JSONInput
          value={displayValue}
          onChange={(value) => {
            onChange({
              target: { name, value: value, type: attribute.type },
            });
          }}
          disabled={true}
        />
        <Field.Hint />
        <Field.Error />
      </Flex>
      <Flex direction="column" alignItems="stretch" gap={1}>
        <Button fullWidth onClick={() => createClozeTest()}>
          Create Cloze Test
        </Button>
      </Flex>
    </Field.Root>
  );
};

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
