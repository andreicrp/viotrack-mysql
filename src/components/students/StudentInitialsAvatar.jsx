import React, { useState } from 'react';
import { getStudentInitials } from '../../utils/studentInitials';
import { getStudentPhoto } from '../../utils/studentPhoto';

export const StudentInitialsAvatar = ({ student, className, style, ...props }) => {
  const image = getStudentPhoto(student?.image);
  const [failedImage, setFailedImage] = useState('');

  return (
    <span
      className={`student-initials-avatar${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
        border: '1px solid #e2e8f0',
        borderRadius: '50%',
        background: '#07345f',
        color: '#ffffff',
        fontWeight: 700,
        lineHeight: 1,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {getStudentInitials(student)}
      {image && failedImage !== image && (
        <img
          src={image}
          alt=""
          onError={() => setFailedImage(image)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
    </span>
  );
};
