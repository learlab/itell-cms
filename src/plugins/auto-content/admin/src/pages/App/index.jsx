/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from "react";
import {Route, Routes} from "react-router-dom";
import pluginId from "../../pluginId";
import HomePage from "../HomePage";
import { Page } from '@strapi/strapi/admin';


const App = () => {
  return (
    <Routes>
      <Route index component={HomePage} />
      <Route path="*" element={<Page.Error />} />
    </Routes>
  );
};

export default App;
