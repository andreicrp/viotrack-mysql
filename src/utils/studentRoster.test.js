import { describe, expect, it } from 'vitest';
import { parseStudentRoster } from './studentRoster';

describe('student roster CSV parser', () => {
  it('round-trips all exported student details by header', () => {
    const csv = [
      'Student ID,First Name,Middle Name,Last Name,Email,Grade,Section,Course/Strand,Track,Academic Year,Gender,Contact,Parent Name,Parent Contact,Address',
      '001234,Jane,Q,Doe,jane@example.edu,Grade 9,Rizal,Science,JHS,2025-2026,Female,09120000000,Alex Doe,09121111111,"12 Main St, Manila"'
    ].join('\r\n');
    const [student] = parseStudentRoster(csv);

    expect(student).toMatchObject({
      student_id: '001234',
      fname: 'Jane',
      email: 'jane@example.edu',
      grade: 'Grade 9',
      strand: 'Science',
      track: 'JHS',
      academicyear: '2025-2026',
      parent_contact: '09121111111',
      address: '12 Main St, Manila',
      isValid: true
    });
  });

  it('maps partial headers and reports missing required columns', () => {
    const rows = parseStudentRoster('First Name,Grade\nJane,Grade 9');
    expect(rows).toHaveLength(1);
    expect(rows[0].fname).toBe('Jane');
    expect(rows[0].validationErrors).toContain('Missing student ID');
    expect(rows[0].validationErrors).toContain('Missing last name');
  });
});
