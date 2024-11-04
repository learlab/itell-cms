import React, { useState, useEffect } from "react";
import {Field, Flex} from "@strapi/design-system";
import { Textarea } from "@strapi/design-system";
import { unstable_useContentManagerContext as useContentManagerContext } from "@strapi/strapi/admin";
import PropTypes from 'prop-types';

// Component for constructed response field
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

  useEffect(() => {
    if (
      values[dynamicZone][index]["QuestionAnswerResponse"] &&
      JSON.parse(values[dynamicZone][index]["QuestionAnswerResponse"])[
        "answer"
      ] !== value
    ) {
      onChange({
        target: {
          name,
          value: JSON.parse(
            values[dynamicZone][index]["QuestionAnswerResponse"],
          )["answer"],
          type: attribute.type,
        },
      });
    }
  }, [values[dynamicZone][index]["QuestionAnswerResponse"]]);

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
        <Textarea
          placeholder="Answer to the question"
          name="content"
          value={value}
          onChange={(e) =>
            onChange({
              target: { name, value: e.target.value, type: attribute.type },
            })}
          disabled
        >
          {value}
        </Textarea>
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
