import React from 'react';
import { ParentSummonsModal } from './ParentSummonsModal';

/** Reuses the complete summons document viewer/editor shell with conference report content. */
export const ConferenceSummaryModal = ({ isOpen, onClose, record, records = [] }) => (
  <ParentSummonsModal
    isOpen={isOpen}
    onClose={onClose}
    record={record}
    student={record?.student}
    records={records}
    conferenceMode
  />
);
