import { describe, expect, it } from 'vitest';
import { getStudentInitials } from './studentInitials';

describe('getStudentInitials', () => {
  it('uses the first and last name initials', () => {
    expect(getStudentInitials({ fname: 'Ber', lname: 'Andrei' })).toBe('BA');
  });

  it('uses a generic initial when the student has no name', () => {
    expect(getStudentInitials({})).toBe('S');
  });
});
