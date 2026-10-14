import { describe, expect, it } from 'vitest';
import { validateBackupPayload } from './backupValidation';

const collections = [
  'students', 'violations', 'records', 'teachers', 'advisers', 'admins',
  'activity_logs', 'school_events', 'locations', 'meetings', 'sms_logs'
];

const createV2Backup = () => ({
  format_version: 2,
  counts: Object.fromEntries(collections.map(collection => [collection, 1])),
  data: Object.fromEntries(collections.map(collection => [collection, [{ id: '1' }]]))
});

describe('database backup validation', () => {
  it('accepts a complete version 2 backup with consistent counts', () => {
    expect(validateBackupPayload(createV2Backup()).format_version).toBe(2);
  });

  it('rejects unknown versions, missing collections, and mismatched counts', () => {
    expect(() => validateBackupPayload({ ...createV2Backup(), format_version: 3 }))
      .toThrow('Unsupported database backup format version');

    const missingCollection = createV2Backup();
    delete missingCollection.data.meetings;
    expect(() => validateBackupPayload(missingCollection)).toThrow('meetings');

    const mismatchedCount = createV2Backup();
    mismatchedCount.counts.students = 0;
    expect(() => validateBackupPayload(mismatchedCount)).toThrow('does not match its data');
  });

  it('rejects malformed and duplicate row IDs', () => {
    const malformed = createV2Backup();
    malformed.data.students = [{ id: 'student-1' }];
    malformed.counts.students = 1;
    expect(() => validateBackupPayload(malformed)).toThrow('numeric ID');

    const duplicate = createV2Backup();
    duplicate.data.students = [{ id: 1 }, { id: 1 }];
    duplicate.counts.students = 2;
    expect(() => validateBackupPayload(duplicate)).toThrow('duplicate ID');
  });

  it('continues to accept complete legacy snapshots without optional collections', () => {
    const data = Object.fromEntries(
      collections.slice(0, 8).map(collection => [collection, []])
    );
    expect(validateBackupPayload({ data })).toMatchObject({ data });
  });
});
