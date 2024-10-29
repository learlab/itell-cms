// import React, { memo, useEffect, useState } from "react";
// import {
//   Alert,
//   Box
// } from "@strapi/design-system";
// import { useFetchClient } from '@strapi/admin/strapi-admin';
// import { useIntl } from "react-intl";
// import styled from "styled-components";
//
// import { PublishButton, PublishPrompt } from "../../components/HomePage";
// import pluginId from "../../pluginId";
//
// const POLL_INTERVAL = 10000;
// const StyledAlert = styled(Alert)`
//   button {
//     display: none;
//   }
// `;
//
// const HomePage = () => {
//   const { get } = useFetchClient();
//
//   const { formatMessage } = useIntl();
//   const t = (id) => formatMessage({ id: `${pluginId}.home.${id}` });
//
//   const [ready, setReady] = useState(false);
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   let [texts, setTexts] = useState("hi");
//
//   const handleOpen = () => setIsOpen(true);
//   const handleClose = () => setIsOpen(false);
//
//   const handleError = (e = "Server error") => {
//     console.error(e);
//     setError(true);
//   };
//
//   const triggerPublish = async () => {
//     setBusy(true);
//     try {
//       const res = await fetch(`/${pluginId}/publish`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${JSON.parse(window.sessionStorage.jwtToken)}`,
//         },
//         body: JSON.stringify({
//           text: text,
//           textID: textID,
//           token: token,
//           owner: owner,
//           repository: repository,
//           dir: dir,
//         }),
//       });
//     } catch (e) {
//       handleError(e);
//     } finally {
//       handleClose();
//     }
//   };
//
//   let tempReady = false;
//
//   useEffect(() => {
//     let timeout;
//     const textJSON = async () => {
//       try {
//         const res = await fetch(`/${pluginId}/getTexts`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${JSON.parse(window.sessionStorage.jwtToken)}`,
//           },
//           body: JSON.stringify({
//             text: text,
//             token: token,
//           }),
//         });
//
//         try {
//           setTexts(await res.text());
//         } catch (error) {
//           console.error(error);
//         }
//
//         timeout = setTimeout(textJSON, POLL_INTERVAL);
//       } catch (e) {
//         handleError(e);
//       } finally {
//         setReady(tempReady);
//       }
//     };
//
//     textJSON();
//     return () => clearTimeout(timeout);
//   }, []);
//
//   useEffect(() => {
//     let timeout;
//
//     const checkBusy = async () => {
//       try {
//         const res = await get(`/${pluginId}/check`);
//         if (!!res?.busy === res?.busy) {
//           setBusy(res.busy);
//         } else {
//           handleError();
//         }
//
//         timeout = setTimeout(checkBusy, POLL_INTERVAL);
//       } catch (e) {
//         handleError(e);
//       } finally {
//         tempReady = true;
//
//         setReady(true);
//       }
//     };
//
//     checkBusy();
//
//     return () => clearTimeout(timeout);
//   }, []);
//
//   if (texts != "hi" && texts != undefined) {
//     texts = JSON.parse(JSON.parse(texts).text_json.text_json);
//   }
//
//   let [token, setToken] = useState("⬇️ Select a text ⬇️");
//
//   let [text, setText] = useState("⬇️ Select a text ⬇️");
//
//   let [owner, setOwner] = useState("⬇️ Select a text ⬇️");
//
//   let [textID, setTextID] = useState("⬇️ Select a text ⬇️");
//
//   let [repository, setRepository] = useState("⬇️ Select a text ⬇️");
//
//   let [dir, setDir] = useState("⬇️ Select a text ⬇️");
//
//   let handleTextChange = (e) => {
//     const inputs = JSON.parse(e.target.value);
//     setText(inputs.text);
//     setToken(inputs.token);
//     setOwner(inputs.owner);
//     setTextID(inputs.textID);
//     setRepository(inputs.repository);
//     setDir(inputs.dir);
//   };
//
//   return (
//     <Box>
//       <h2>
//         {t("title")}
//       </h2>
//       {/*<h4>*/}
//       {/*  {t("description")}*/}
//       {/*</h4>*/}
//       <div>
//         {error ? (
//           <StyledAlert variant="danger" title={t("error.title")}>
//             {t("error.description")}
//           </StyledAlert>
//         ) : (
//           <div>
//             {texts == "hi" ? (
//               <div />
//             ) : (
//               <div>
//                 <br />
//
//                 <select onChange={handleTextChange}>
//                   <option value="⬇️ Select a text ⬇️">
//                     {" "}
//                     -- Select a text --{" "}
//                   </option>
//                   {texts.map((text) => (
//                     <option value={JSON.stringify(text)}>{text.text}</option>
//                   ))}
//                 </select>
//               </div>
//             )}
//             <br />
//             <PublishButton
//               loading={!ready || busy}
//               loadingMessage={t(busy ? "busy" : "notready")}
//               buttonLabel={t("buttons.publish")}
//               onClick={handleOpen}
//               texts={texts}
//             />
//           </div>
//         )}
//       </div>
//       {/*<PublishPrompt*/}
//       {/*  isOpen={isOpen}*/}
//       {/*  title={t("prompt.title")}*/}
//       {/*  description={t("prompt.description")}*/}
//       {/*  cancelLabel={t("buttons.cancel")}*/}
//       {/*  publishLabel={t("buttons.publish")}*/}
//       {/*  handleCancel={handleClose}*/}
//       {/*  handlePublish={triggerPublish}*/}
//       {/*/>*/}
//     </Box>
//   );
// };
//
// export default memo(HomePage);

import React, { memo, useEffect, useState } from "react";

import {
  Alert,
  Box,
} from "@strapi/design-system";
import { useIntl } from "react-intl";
import styled from "styled-components";

import { PublishButton, PublishPrompt } from "../../components/HomePage";
import pluginId from "../../pluginId";
import {BaseHeaderLayout} from "../../components/HomePage/BaseHeaderLayout";
import {ContentLayout} from "../../components/HomePage/ContentLayout";

const POLL_INTERVAL = 10000;

const StyledAlert = styled(Alert)`
  button {
    display: none;
  }
`;

const HomePage = () => {
  const { formatMessage } = useIntl();
  const t = (id) => formatMessage({ id: `${pluginId}.home.${id}` });

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleError = (e = "Server error") => {
    console.error(e);
    setError(true);
  };

  const triggerPublish = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/${pluginId}/publish`, { method: "GET" });
      if (res?.success !== true) {
        handleError();
      }
    } catch (e) {
      handleError(e);
    } finally {
      handleClose();
    }
  };

  useEffect(() => {
    let timeout;

    const checkBusy = async () => {
      try {
        const res = await fetch(`/${pluginId}/check`, { method: "GET" });

        if (!!res?.busy === res?.busy) {
          setBusy(res.busy);
        } else {
          handleError();
        }

        timeout = setTimeout(checkBusy, POLL_INTERVAL);
      } catch (e) {
        handleError(e);
      } finally {
        setReady(true);
      }
    };

    checkBusy();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Box>
      <BaseHeaderLayout
        title={t("title")}
        subtitle={t("description")}
        as="h2"
      />
      <ContentLayout>
        {error ? (
          <StyledAlert variant="danger" title={t("error.title")}>
            {t("error.description")}
          </StyledAlert>
        ) : (
          <PublishButton
            loading={!ready || busy}
            loadingMessage={t(busy ? "busy" : "notready")}
            buttonLabel={t("buttons.publish")}
            onClick={handleOpen}
          />
        )}
      </ContentLayout>
      <PublishPrompt
        isOpen={isOpen}
        title={t("prompt.title")}
        description={t("prompt.description")}
        cancelLabel={t("buttons.cancel")}
        publishLabel={t("buttons.publish")}
        handleCancel={handleClose}
        handlePublish={triggerPublish}
      />
    </Box>
  );
};

export default memo(HomePage);
