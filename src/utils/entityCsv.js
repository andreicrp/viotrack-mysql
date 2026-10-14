import { parseCsvString } from './csvHelper';

const HEADER_ALIASES = {
  admin: {
    fname: ['first name', 'firstname', 'fname', 'given name', 'givenname', 'name'],
    mname: ['middle name', 'middlename', 'mname', 'middle'],
    lname: ['last name', 'lastname', 'lname', 'surname', 'family name'],
    email: ['email', 'email address', 'e mail'],
    role: ['role', 'admin role', 'access role'],
    position: ['position', 'job title', 'title'],
    contact: ['contact', 'phone', 'phone number', 'mobile', 'mobile number'],
    status: ['status', 'account status']
  },
  teacher: {
    fname: ['first name', 'firstname', 'fname', 'given name', 'givenname', 'name'],
    mname: ['middle name', 'middlename', 'mname', 'middle'],
    lname: ['last name', 'lastname', 'lname', 'surname', 'family name'],
    email: ['email', 'email address', 'e mail'],
    position: ['position', 'job title', 'title', 'rank'],
    department: ['department', 'school', 'unit'],
    specialization: ['specialization', 'specialisation', 'subject', 'specialty'],
    contact: ['contact', 'phone', 'phone number', 'mobile', 'mobile number'],
    gender: ['gender', 'sex']
  },
  violation: {
    title: ['title', 'violation title', 'offense', 'offence', 'violation'],
    type: ['type', 'severity', 'severity type', 'classification'],
    description: ['description', 'details', 'policy scope'],
    default_sanction: ['default sanction', 'sanction', 'default consequence', 'consequence']
  }
};

const normalizeHeader = header => String(header || '')
  .replace(/^\uFEFF/, '')
  .trim()
  .toLowerCase()
  .replace(/[_-]+/g, ' ')
  .replace(/[^\p{L}\p{N}\s]/gu, '')
  .replace(/\s+/g, ' ');

const LEGACY_COLUMNS = {
  admin: ['fname', 'lname', 'email', 'role', 'contact', 'status'],
  teacher: ['fname', 'mname', 'lname', 'email', 'contact', 'department', 'specialization', 'gender'],
  violation: ['title', 'type', 'description', 'default_sanction']
};

const mapHeaders = (headerRow, entity) => {
  const aliases = HEADER_ALIASES[entity];
  const mapping = new Map();
  headerRow.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    const field = Object.entries(aliases).find(([, names]) => names.includes(normalized))?.[0];
    if (field && !mapping.has(field)) mapping.set(field, index);
  });
  return mapping;
};

const hasRecognizedHeader = (headerRow, entity) => {
  const mapping = mapHeaders(headerRow, entity);
  const required = entity === 'violation' ? ['title', 'type'] : ['fname', 'lname', 'email'];
  return required.every(field => mapping.has(field)) || mapping.size >= 2;
};

const getValidationErrors = (row, entity) => {
  if (entity === 'admin' || entity === 'teacher') {
    return ['fname', 'lname', 'email']
      .filter(field => !row[field])
      .map(field => `Missing ${field === 'fname' ? 'first name' : field === 'lname' ? 'last name' : 'email'}`);
  }
  const errors = [];
  if (!row.title) errors.push('Missing title');
  if (!row.type) errors.push('Missing severity');
  else if (!['minor', 'serious', 'major'].includes(row.type.toLowerCase())) {
    errors.push('Severity must be Minor, Serious, or Major');
  }
  return errors;
};

export const parseEntityCsv = (text, entity) => {
  if (!HEADER_ALIASES[entity]) throw new Error(`Unsupported CSV entity: ${entity}`);
  const rows = parseCsvString(text);
  if (!rows.length) return [];

  const headered = hasRecognizedHeader(rows[0], entity);
  const mapping = headered ? mapHeaders(rows[0], entity) : null;
  const columns = LEGACY_COLUMNS[entity];

  return rows.slice(headered ? 1 : 0)
    .filter(parts => parts.some(value => value.trim()))
    .map((parts, index) => {
      const row = {};
      if (mapping) {
        for (const [field, columnIndex] of mapping) row[field] = (parts[columnIndex] || '').trim();
      } else {
        columns.forEach((field, columnIndex) => {
          row[field] = (parts[columnIndex] || '').trim();
        });
      }

      if (entity === 'violation') {
        const severity = (row.type || '').toLowerCase();
        if (['minor', 'serious', 'major'].includes(severity)) {
          row.type = severity[0].toUpperCase() + severity.slice(1);
        }
        row.default_sanction = row.default_sanction || '';
      }
      row.validationErrors = getValidationErrors(row, entity);
      row.isValid = row.validationErrors.length === 0;
      row.sourceRow = index + (headered ? 2 : 1);
      return row;
    });
};
