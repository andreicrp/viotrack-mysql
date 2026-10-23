import { describe, expect, it } from 'vitest';
import { getAdminProfilePhoto, getStudentPhoto } from './studentPhoto';
import { ensureStudentAvatar, getGeneratedStudentAvatar, STUDENT_PFP_TEMPLATE } from '../../shared/studentAvatar.ts';

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

  it('allows intentional Unsplash portraits for admin profiles only', () => {
    const preset = 'https://images.unsplash.com/photo-1534528741775?w=300';
    expect(getAdminProfilePhoto(preset)).toBe(preset);
    expect(getStudentPhoto(preset)).toBe('');
  });

  it('does not treat institutional logos as administrator profile photos', () => {
    expect(getAdminProfilePhoto('/images/phcm-logo2.png')).toBe('');
    expect(getAdminProfilePhoto('/images/viotrack-logo-nobg.png')).toBe('');
  });

  it('returns an empty value when no usable photo is set', () => {
    expect(getStudentPhoto('')).toBe('');
    expect(getStudentPhoto(null)).toBe('');
    expect(getStudentPhoto('javascript:alert(1)')).toBe('');
  });

  it('assigns the dedicated student template when a student has no photo', () => {
    const student = { student_id: '23-0912-456', fname: 'Jasmine', lname: 'Castillo' };
    expect(getGeneratedStudentAvatar(student)).toBe(STUDENT_PFP_TEMPLATE);
    expect(ensureStudentAvatar(student).image).toBe(STUDENT_PFP_TEMPLATE);
  });

  it('preserves a student photo that was uploaded or already assigned', () => {
    const student = { student_id: '22-0962-208', image: '/uploads/students/ber.webp' };
    expect(ensureStudentAvatar(student).image).toBe(student.image);
  });
});
