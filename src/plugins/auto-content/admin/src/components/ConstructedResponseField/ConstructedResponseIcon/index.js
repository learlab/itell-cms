import React from "react";

import { Flex, Icon } from "@strapi/design-system";
import { Message } from "@strapi/icons";
import styled from "styled-components";

const IconBox = styled(Flex)`
  /* Hard code color values */
  /* to stay consistent between themes */
  background-color: #f0f0ff; /* primary100 */
  border: 1px solid #d9d8ff; /* primary200 */

  svg > path {
    fill: #4945ff; /* primary600 */
  }
`;

const ConstructedResponseIcon = () => {
  return (
    <IconBox
      justifyContent="center"
      alignItems="center"
      width={7}
      height={6}
      hasRadius
      aria-hidden
    >
      <Icon as={Message} />
    </IconBox>
  );
};

export default ConstructedResponseIcon;
