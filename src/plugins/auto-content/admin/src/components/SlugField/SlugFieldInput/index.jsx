import React, { useState, useEffect } from "react";
import {Textarea, Grid, Flex, Field} from "@strapi/design-system";
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
  const [dynamicZone, index, fieldName] = name.split(".");

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
          placeholder="This area will show the generated slug."
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
