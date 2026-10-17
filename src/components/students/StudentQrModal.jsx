import React, { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import { Modal } from '../common/Modal';
import { getStudentQrCodeUrl } from '../../utils/qrHelper';

export const StudentQrModal = ({ isOpen, onClose, student }) => {
  const [qrState, setQrState] = useState({ studentId: null, url: '', error: '' });

  useEffect(() => {
    if (!isOpen || !student) return undefined;
    let active = true;
    const studentId = String(student.id ?? student.student_id ?? '');

    getStudentQrCodeUrl(student, 420, 2)
      .then(url => {
        if (active) setQrState({ studentId, url, error: '' });
      })
      .catch(qrError => {
        if (active) setQrState({
          studentId,
          url: '',
          error: qrError.message || 'Could not generate this student QR code.'
        });
      });

    return () => { active = false; };
  }, [isOpen, student]);

  if (!student) return null;

  const studentId = String(student.id ?? student.student_id ?? '');
  const qrDataUrl = qrState.studentId === studentId ? qrState.url : '';
  const qrError = qrState.studentId === studentId ? qrState.error : '';
  const fullName = [student.fname, student.mname, student.lname].filter(Boolean).join(' ');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student QR Code"
      maxWidth="420px"
      icon={QrCode}
    >
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`Secure QR code for ${fullName || studentId}`}
            style={{ width: 'min(100%, 280px)', aspectRatio: '1', objectFit: 'contain', padding: '10px', background: '#ffffff', border: '1px solid var(--border-subtle, #e2e8f0)', borderRadius: '8px' }}
          />
        ) : (
          <div role="status" aria-live="polite" style={{ width: 280, minHeight: 280, display: 'grid', placeItems: 'center', padding: '16px', color: qrError ? '#dc2626' : 'var(--text-secondary, #64748b)', fontSize: '13px' }}>
            {qrError || 'Generating secure QR code...'}
          </div>
        )}
        <div style={{ minWidth: 0, maxWidth: '100%' }}>
          <div style={{ color: 'var(--text-primary, #0f172a)', fontSize: '15px', fontWeight: 700, overflowWrap: 'anywhere' }}>{fullName}</div>
          <div style={{ marginTop: '3px', color: 'var(--text-secondary, #64748b)', fontSize: '12px' }}>Student ID: {student.student_id || studentId}</div>
        </div>
      </div>
      <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle, #e2e8f0)', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
};

export default StudentQrModal;