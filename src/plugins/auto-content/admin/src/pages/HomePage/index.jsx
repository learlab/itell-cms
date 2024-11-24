import React from "react";

import {
  Box,
  Typography
} from "@strapi/design-system";

const HomePage = () => {
  return (
    <Box>
      <h1>Welcome to</h1>
    </Box>
    // <Main>
    //   <h2>Content Generator Plugin</h2>
    //   <h4>Generate content for your iTELL app.</h4>
    //   <div>
    //     <Typography variant="epsilon">
    //       Content generator adds a new auto-content field type. This field is
    //       intended to be used within a component that contains another field
    //       called CleanText. To generate content, simply press Generate, and the
    //       CleanText field will be used to populate the auto-content field.
    //       <br />
    //       <br />
    //       Currently, question generation is supported for Chunk and Video
    //       components. It supports Question, Answer, and Keyphrase Generation. It
    //       is also capable of fetching a transcript for YouTube videos and
    //       generating the same content for them.
    //       <br />
    //       <br />
    //       After generating content, you should review it to make sure it meets
    //       your standards. Automatically generated content can be edited and
    //       saved like any other field.
    //     </Typography>
    //   </div>
    // </Main>
  );
};

export default HomePage;
