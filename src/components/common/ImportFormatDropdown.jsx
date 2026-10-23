import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileText, Upload } from 'lucide-react';
import './ImportFormatDropdown.css';

export const ImportFormatDropdown = ({ onSelect, title = 'Choose an import format' }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const chooseFormat = (format) => {
    setOpen(false);
    onSelect(format);
  };

  return (
    <div className="import-format-dropdown" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="page-banner-btn-secondary import-format-trigger"
        title={title}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Upload size={14} strokeWidth={2.2} /> Import
        <ChevronDown size={13} className={open ? 'is-open' : ''} aria-hidden="true" />
      </button>
      {open && (
        <div className="import-format-menu" role="menu" aria-label="Import format">
          <button type="button" role="menuitem" onClick={() => chooseFormat('pdf')}>
            <FileText size={15} aria-hidden="true" /> Import from PDF
          </button>
          <button type="button" role="menuitem" onClick={() => chooseFormat('csv')}>
            <FileText size={15} aria-hidden="true" /> Import from CSV / Excel
          </button>
        </div>
      )}
    </div>
  );
};
