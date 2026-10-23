import React from 'react';
import { LayoutList, LayoutGrid } from 'lucide-react';

export const ViewModeToggle = ({ viewMode = 'list', onChange, size = 'sm' }) => {
  return (
    <div
      className="view-mode-toggle"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--view-toggle-bg, #f8fafc)',
        padding: '3px',
        borderRadius: '9px',
        border: '1.5px solid var(--view-toggle-border, #cbd5e1)',
        gap: '3px',
        height: '38px',
        boxSizing: 'border-box'
      }}
    >
      <button
        type="button"
        onClick={() => onChange('list')}
        title="List View"
        aria-label="List View"
        aria-pressed={viewMode === 'list'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '0 8px',
          fontSize: '12px',
          fontWeight: viewMode === 'list' ? 700 : 500,
          color: viewMode === 'list' ? '#ffffff' : 'var(--view-toggle-muted, #64748b)',
          background: viewMode === 'list' ? 'var(--view-toggle-active, #0f172a)' : 'transparent',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: viewMode === 'list' ? 'var(--view-toggle-shadow, 0 1px 3px rgba(15, 23, 42, 0.25))' : 'none'
        }}
      >
        <LayoutList size={15} strokeWidth={2.4} />
      </button>

      <button
        type="button"
        onClick={() => onChange('grid')}
        title="Grid View"
        aria-label="Grid View"
        aria-pressed={viewMode === 'grid'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '0 8px',
          fontSize: '12px',
          fontWeight: viewMode === 'grid' ? 700 : 500,
          color: viewMode === 'grid' ? '#ffffff' : 'var(--view-toggle-muted, #64748b)',
          background: viewMode === 'grid' ? 'var(--view-toggle-active, #0f172a)' : 'transparent',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: viewMode === 'grid' ? 'var(--view-toggle-shadow, 0 1px 3px rgba(15, 23, 42, 0.25))' : 'none'
        }}
      >
        <LayoutGrid size={15} strokeWidth={2.4} />
      </button>

      <style>{`
        [data-theme="dark"] .view-mode-toggle {
          --view-toggle-bg: #0b0d10;
          --view-toggle-border: #30363d;
          --view-toggle-active: #000000;
          --view-toggle-muted: #a1a1aa;
          --view-toggle-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
        }
        [data-theme="dark"] .view-mode-toggle button[aria-pressed="true"] {
          color: #ffffff !important;
          background: #000000 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7) !important;
        }
      `}</style>
    </div>
  );
};
