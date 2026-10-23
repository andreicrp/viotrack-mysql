import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function PageLoader({ preview = false }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`page-loader ${isDark ? 'page-loader-dark' : 'page-loader-light'}${preview ? ' page-loader-preview' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="page-loader-content">
        <div className="page-loader-spinner" aria-hidden="true" />
        <div className="page-loader-copy">
          <span className="page-loader-label">Loading VioTrack</span>
          <span className="page-loader-caption">Getting your workspace ready</span>
        </div>
        <div className="page-loader-progress" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}

export default PageLoader;
