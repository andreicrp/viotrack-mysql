import { describe, expect, it } from 'vitest';
import { getStudentPhoto } from './studentPhoto';

describe('student photo selection', () => {
  it('ignores generic placeholder and demo portrait URLs', () => {
    expect(getStudentPhoto('https://ui-avatars.com/api/?name=Ber+Carpio')).toBe('');
    expect(getStudentPhoto('https://images.unsplash.com/photo-123?w=150')).toBe('');
  });

  it('preserves actual stored image data and non-placeholder image URLs', () => {
    expect(getStudentPhoto('data:image/jpeg;base64,abc')).toBe('data:image/jpeg;base64,abc');
    expect(getStudentPhoto('/uploads/students/ber.jpg')).toBe('/uploads/students/ber.jpg');
    expect(getStudentPhoto('https://school.example.edu/students/ber.jpg'))
      .toBe('https://school.example.edu/students/ber.jpg');
  });

  it('returns an empty value when no usable photo is set', () => {
    expect(getStudentPhoto('')).toBe('');
    expect(getStudentPhoto(null)).toBe('');
    expect(getStudentPhoto('javascript:alert(1)')).toBe('');
  });
});
