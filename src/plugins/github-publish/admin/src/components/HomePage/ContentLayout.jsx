import * as React from 'react';

import { Box } from '@strapi/design-system';

const ContentLayout = ({ children }) => {
  return (
    <Box paddingLeft={10} paddingRight={10}>
      {children}
    </Box>
  );
};

export { ContentLayout };
