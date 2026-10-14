import { describe, expect, it } from 'vitest';
import { parseEntityCsv } from './entityCsv';

describe('entity CSV parser', () => {
  it('maps reordered and tab-delimited teacher headers', () => {
    const [teacher] = parseEntityCsv(
      'Specialization\tLast Name\tEmail\tFirst Name\tPosition\nPhysics\tLovelace\tada@example.com\tAda\tProfessor',
      'teacher'
    );

    expect(teacher).toMatchObject({
      fname: 'Ada',
      lname: 'Lovelace',
      email: 'ada@example.com',
      position: 'Professor',
      specialization: 'Physics',
      isValid: true
    });
  });

  it('preserves missing admin data for validation', () => {
    const [admin] = parseEntityCsv('Last Name,Email,First Name\nLovelace,,', 'admin');
    expect(admin.fname).toBe('');
    expect(admin.email).toBe('');
    expect(admin.validationErrors).toContain('Missing first name');
    expect(admin.validationErrors).toContain('Missing email');
    expect(admin.isValid).toBe(false);
  });

  it('preserves supported severity values when parsing headerless violation rows', () => {
    const [violation] = parseEntityCsv('Late to class,critical,Arriving late,Parent summon', 'violation');
    expect(violation.isValid).toBe(false);
    expect(violation.type).toBe('critical');
  });

  it('accepts the documented headerless violation column order and preserves serious severity', () => {
    const [violation] = parseEntityCsv('Late to class,serious,Arriving late,Parent summon', 'violation');
    expect(violation).toMatchObject({
      title: 'Late to class',
      type: 'Serious',
      description: 'Arriving late',
      default_sanction: 'Parent summon',
      isValid: true
    });
  });

  it('flags absent and unsupported violation severities and recognizes complete headers', () => {
    const rows = parseEntityCsv(
      'Title,Severity\nMissing severity,\nUnsupported,Critical',
      'violation'
    );
    expect(rows[0].validationErrors).toContain('Missing severity');
    expect(rows[1].validationErrors).toContain('Severity must be Minor, Serious, or Major');
  });

  it('does not treat a partial header as a complete header', () => {
    const rows = parseEntityCsv('First Name,Department\nAda,Science', 'teacher');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ fname: 'Ada', department: 'Science', isValid: false });
    expect(rows[0].validationErrors).toContain('Missing email');
    expect(rows[0].validationErrors).toContain('Missing last name');
  });
});
