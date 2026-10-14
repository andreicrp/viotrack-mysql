import { parseCsvString } from './csvHelper';

const ALIASES = {
  student_id: ['student id', 'studentid', 'student number', 'id number', 'id', 'student no'],
  fname: ['first name', 'firstname', 'fname', 'given name', 'givenname', 'name'],
  mname: ['middle name', 'middlename', 'mname', 'middle'],
  lname: ['last name', 'lastname', 'lname', 'surname', 'family name'],
  email: ['email', 'email address', 'e mail'],
  grade: ['grade', 'grade level', 'level', 'year level'],
  section: ['section', 'class section', 'class', 'homeroom'],
  course: ['course', 'course strand', 'course/strand', 'strand', 'program'],
  track: ['track', 'academic track', 'strand track'],
  academicyear: ['academic year', 'academicyear', 'school year', 'sy', 's y'],
  gender: ['gender', 'sex'],
  contact: ['contact', 'student contact', 'phone', 'phone number'],
  parent_name: ['parent name', 'guardian name', 'parent guardian'],
  parent_contact: ['parent contact', 'guardian contact', 'parent phone', 'guardian phone'],
  address: ['address', 'home address', 'residential address']
};

const LEGACY_COLUMNS = [
  'student_id', 'fname', 'mname', 'lname', 'grade', 'section', 'gender',
  'contact', 'parent_name', 'parent_contact', 'course'
];

const normalizeHeader = header => String(header || '')
  .replace(/^\uFEFF/, '')
  .trim()
  .toLowerCase()
  .replace(/[_-]+/g, ' ')
  .replace(/[^\p{L}\p{N}\s/]/gu, '')
  .replace(/\s+/g, ' ');

const getHeaderMap = headers => {
  const map = new Map();
  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    const field = Object.entries(ALIASES).find(([, names]) => names.includes(normalized))?.[0];
    if (field && !map.has(field)) map.set(field, index);
  });
  return map;
};

export const parseStudentRoster = text => {
  const rows = parseCsvString(text);
  if (!rows.length) return [];
  const headerMap = getHeaderMap(rows[0]);
  const hasAllRequiredHeaders = ['student_id', 'fname', 'lname']
    .every(field => headerMap.has(field));
  const hasHeader = hasAllRequiredHeaders || headerMap.size >= 2;

  return rows.slice(hasHeader ? 1 : 0)
    .filter(parts => parts.some(value => value.trim()))
    .map((parts, index) => {
      const student = {};
      if (hasHeader) {
        for (const [field, columnIndex] of headerMap) student[field] = (parts[columnIndex] || '').trim();
      } else {
        LEGACY_COLUMNS.forEach((field, columnIndex) => {
          student[field] = (parts[columnIndex] || '').trim();
        });
      }
      student.strand = student.course || '';
      student.academicyear = student.academicyear || '';
      student.validationErrors = ['student_id', 'fname', 'lname']
        .filter(field => !student[field])
        .map(field => `Missing ${field === 'student_id' ? 'student ID' : field === 'fname' ? 'first name' : 'last name'}`);
      student.isValid = student.validationErrors.length === 0;
      student.sourceRow = index + (hasHeader ? 2 : 1);
      return student;
    });
};
