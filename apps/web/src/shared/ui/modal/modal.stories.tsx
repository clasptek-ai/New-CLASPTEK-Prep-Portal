import React from 'react';
import { Modal } from './Modal';

export default {
  title: 'Overlays/Modal',
  component: Modal,
};

export const Default = () => (
  <Modal isOpen={true} onClose={() => {}} title="Exam Diagnostic Instructions">
    Please ensure your microphone and audio headsets are configured properly before launching.
  </Modal>
);
