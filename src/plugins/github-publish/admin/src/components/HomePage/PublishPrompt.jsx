import React from "react";

import {
  Dialog,
  Flex,
  Typography,
  Button
} from "@strapi/design-system";
import { Upload } from "@strapi/icons";
import PropTypes from "prop-types";

const PublishPrompt = ({
  isOpen,
  title,
  description,
  cancelLabel,
  publishLabel,
  handleCancel,
  handlePublish,
}) => (
  <Dialog.Root onClose={handleCancel} title={title} isOpen={isOpen}>
    <Dialog.Content>
      <Dialog.Footer>
        <Dialog.Cancel>
          <Button variant="tertiary" onClick={handleCancel}>
            {cancelLabel}
          </Button>
        </Dialog.Cancel>
        <Dialog.Action>
          <Button startIcon={<Upload />} onClick={handlePublish}>
            {publishLabel}
          </Button>
        </Dialog.Action>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
);

PublishPrompt.propTypes = {
  isOpen: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  cancelLabel: PropTypes.string,
  publishLabel: PropTypes.string,
  handleCancel: PropTypes.func,
  handlePublish: PropTypes.func,
};

export default PublishPrompt;
