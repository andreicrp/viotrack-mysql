const REQUIRED_COLLECTIONS = [
  'students',
  'violations',
  'records',
  'teachers',
  'advisers',
  'admins',
  'activity_logs',
  'school_events'
];

const VERSION_2_COLLECTIONS = [
  ...REQUIRED_COLLECTIONS,
  'locations',
  'meetings',
  'sms_logs'
];

const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export const validateBackupPayload = payload => {
  if (!isPlainObject(payload) || !isPlainObject(payload.data)) {
    throw new Error('Invalid snapshot structure: Missing data payload.');
  }

  const formatVersion = payload.format_version === undefined ? 1 : payload.format_version;
  if (![1, 2].includes(formatVersion)) {
    throw new Error(`Unsupported database backup format version: ${formatVersion}.`);
  }

  const collections = formatVersion === 2 ? VERSION_2_COLLECTIONS : REQUIRED_COLLECTIONS;
  for (const collection of collections) {
    const rows = payload.data[collection];
    if (!Array.isArray(rows)) {
      throw new Error(`Backup collection "${collection}" must be an array.`);
    }
    if (rows.length > 100_000) {
      throw new Error(`Backup collection "${collection}" exceeds the 100,000 row limit.`);
    }

    const ids = new Set();
    rows.forEach((row, index) => {
      if (!isPlainObject(row) || !/^\d+$/.test(String(row.id ?? ''))) {
        throw new Error(`Row ${index + 1} in "${collection}" must have a numeric ID.`);
      }
      const id = BigInt(row.id).toString();
      if (ids.has(id)) {
        throw new Error(`Backup collection "${collection}" contains duplicate ID ${id}.`);
      }
      ids.add(id);
    });
  }

  if (formatVersion === 2) {
    if (!isPlainObject(payload.counts)) {
      throw new Error('Version 2 backups must include collection counts.');
    }
    for (const collection of collections) {
      if (!Number.isSafeInteger(payload.counts[collection]) || payload.counts[collection] < 0) {
        throw new Error(`Backup count for "${collection}" is invalid.`);
      }
      if (payload.counts[collection] !== payload.data[collection].length) {
        throw new Error(`Backup count for "${collection}" does not match its data.`);
      }
    }
  }

  return payload;
};
