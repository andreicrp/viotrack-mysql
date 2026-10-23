import React from 'react';

/** Displays a student-specific QR with the VioTrack mark over its center. */
export const BrandedStudentQr = ({ src, alt, style = {}, logoSize = '19%', className }) => (
  <span
    className={className}
    style={{
      position: 'relative',
      display: 'inline-grid',
      placeItems: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      ...style
    }}
  >
    <img src={src} alt={alt} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }} />
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: logoSize,
        aspectRatio: '1',
        transform: 'translate(-50%, -50%)',
        display: 'grid',
        placeItems: 'center',
        padding: '2px',
        borderRadius: '5px',
        background: '#ffffff',
        boxShadow: '0 0 0 2px #ffffff'
      }}
    >
      <img src="/images/viotrack-logo-nobg.png" alt="" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }} />
    </span>
  </span>
);

export default BrandedStudentQr;
