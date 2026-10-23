import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api';
import { smsService } from './smsService';
import { broadcastRecordChange, startMutation, endMutation, subscribeCrossTabSync } from '../utils/dataIntegrity';
import { validateBackupPayload } from '../utils/backupValidation';
import { getAdminProfilePhoto, getStudentPhoto } from '../utils/studentPhoto';
import { getGeneratedStudentAvatar } from '../../shared/studentAvatar.ts';

// Clean live data fallbacks
import INITIAL_VIOLATIONS from '../data/violations.json';

const INITIAL_STUDENTS = [
  { id: 1, student_id: '109283746101', fname: 'Alexander', mname: 'Cruz', lname: 'Mendoza', grade: 'Grade 10', section: 'Rizal', academicyear: '2025-2026', gender: 'Male', contact: '09151112233', parent_name: 'Carlos Mendoza', parent_contact: '09151112234', address: '124 Rizal St, Sampaloc, Manila', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
  { id: 2, student_id: '109283746102', fname: 'Sophia', mname: 'Grace', lname: 'Villanueva', grade: 'Grade 10', section: 'Rizal', academicyear: '2025-2026', gender: 'Female', contact: '09152223344', parent_name: 'Lorena Villanueva', parent_contact: '09152223345', address: '45 Mabini Ave, Quezon City', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 3, student_id: '109283746103', fname: 'Gabriel', mname: 'Luis', lname: 'Torres', grade: 'Grade 10', section: 'Bonifacio', academicyear: '2025-2026', gender: 'Male', contact: '09153334455', parent_name: 'Ramon Torres', parent_contact: '09153334456', address: '88 Aurora Blvd, San Juan', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 4, student_id: '109283746104', fname: 'Isabella', mname: 'Marie', lname: 'Ramos', grade: 'Grade 11', section: 'STEM A', academicyear: '2025-2026', gender: 'Female', contact: '09154445566', parent_name: 'Patricia Ramos', parent_contact: '09154445567', address: '73 Commonwealth Ave, QC', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 5, student_id: '109283746105', fname: 'Christian', mname: 'Paul', lname: 'Navarro', grade: 'Grade 11', section: 'STEM A', academicyear: '2025-2026', gender: 'Male', contact: '09155556677', parent_name: 'Dennis Navarro', parent_contact: '09155556678', address: '19 Espana Blvd, Manila', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 6, student_id: '109283746106', fname: 'Jasmine', mname: 'Rose', lname: 'Castillo', grade: 'Grade 9', section: 'Diamond', academicyear: '2025-2026', gender: 'Female', contact: '09156667788', parent_name: 'Lita Castillo', parent_contact: '09156667789', address: '210 Taft Avenue, Pasay', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
];
const INITIAL_TEACHERS = [
  {
    id: 1,
    fname: 'Juan',
    lname: 'Dela Cruz',
    email: 'juan.delacruz@viotrack.edu',
    position: 'Master Teacher I',
    department: 'Science Department',
    contact: '09171234567',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    fname: 'Elena',
    lname: 'Reyes',
    email: 'elena.reyes@viotrack.edu',
    position: 'Teacher III',
    department: 'Mathematics Department',
    contact: '09181234568',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    fname: 'Roberto',
    lname: 'Aquino',
    email: 'roberto.aquino@viotrack.edu',
    position: 'Teacher II',
    department: 'English Department',
    contact: '09191234569',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    fname: 'Carmela',
    lname: 'Bautista',
    email: 'carmela.bautista@viotrack.edu',
    position: 'Teacher I',
    department: 'Social Studies Department',
    contact: '09153334411',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 5,
    fname: 'Fernando',
    lname: 'Perez',
    email: 'fernando.perez@viotrack.edu',
    position: 'Senior High Instructor',
    department: 'TVL Track',
    contact: '09154445522',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  }
];
const INITIAL_ADVISERS = [
  { id: 1, teacher_id: 1, grade_level: 'Grade 10', class_section: 'Rizal' },
  { id: 2, teacher_id: 2, grade_level: 'Grade 10', class_section: 'Bonifacio' },
  { id: 3, teacher_id: 3, grade_level: 'Grade 11', class_section: 'STEM A' },
  { id: 4, teacher_id: 4, grade_level: 'Grade 9', class_section: 'Diamond' }
];
const INITIAL_ADMINS = [
  {
    id: 1,
    fname: 'Sheryl',
    mname: 'B.',
    lname: 'Gamboa',
    email: 'admin@phcmanila.edu.ph',
    role: 'Head Admin',
    position: 'Head of Student Affairs',
    image: ''
  },
  {
    id: 2,
    fname: 'System',
    mname: '',
    lname: 'Administrator',
    email: 'system.admin@viotrack.local',
    role: 'System Admin',
    position: 'IT & Security Lead',
    image: ''
  },
  {
    id: 3,
    fname: 'Maria',
    mname: 'L.',
    lname: 'Santos',
    email: 'm.santos@phcmanila.edu.ph',
    role: 'Discipline Officer',
    position: 'Guidance & Conduct Officer',
    image: ''
  }
];
const INITIAL_RECORDS = [
  {
    id: 1,
    student_id: 1,
    violation_id: 1,
    reported_by_type: 'teacher',
    reported_by_name: 'Juan Dela Cruz',
    date_reported: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    status: 'Resolved',
    approval_status: 'Approved',
    approved_by: 'System Admin',
    approved_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    sanction: 'Verbal Warning',
    remarks: 'Forgot school necktie and ID badge.',
    resolution_notes: 'Student complied the following day and signed acknowledgment.',
    sms_notified: true
  },
  {
    id: 2,
    student_id: 1,
    violation_id: 2,
    reported_by_type: 'admin',
    reported_by_name: 'System Admin',
    date_reported: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    status: 'Pending',
    approval_status: 'Approved',
    approved_by: 'System Admin',
    approved_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    sanction: '1 Hour Campus Service',
    remarks: 'Arrived 40 minutes late without authorized excuse slip.',
    sms_notified: true
  },
  {
    id: 3,
    student_id: 3,
    violation_id: 5,
    reported_by_type: 'teacher',
    reported_by_name: 'Elena Reyes',
    date_reported: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'Investigation',
    approval_status: 'Approved',
    approved_by: 'System Admin',
    approved_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    sanction: 'Parent Conference',
    remarks: 'Involved in a verbal altercation in 2nd floor hallway.',
    resolution_notes: 'Scheduled parent discussion on Friday.',
    sms_notified: true
  },
  {
    id: 4,
    student_id: 4,
    violation_id: 3,
    reported_by_type: 'teacher',
    reported_by_name: 'Roberto Aquino',
    date_reported: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    status: 'Resolved',
    approval_status: 'Approved',
    approved_by: 'System Admin',
    approved_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    sanction: 'Device Confiscation',
    remarks: 'Playing mobile games during Chemistry lab instruction.',
    resolution_notes: 'Device returned to parent upon conference.',
    sms_notified: true
  },
  {
    id: 5,
    student_id: 5,
    violation_id: 6,
    reported_by_type: 'admin',
    reported_by_name: 'System Admin',
    date_reported: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    status: 'Pending',
    approval_status: 'Approved',
    approved_by: 'System Admin',
    approved_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    sanction: 'Desk Restitution',
    remarks: 'Graffiti drawing on classroom desk.',
    sms_notified: false
  },
  {
    id: 6,
    student_id: 2,
    violation_id: 2,
    reported_by_type: 'teacher',
    reported_by_name: 'Elena Reyes',
    date_reported: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    status: 'Under Approval',
    approval_status: 'Under Approval',
    sanction: 'Pending Admin Review',
    remarks: 'Repeated tardiness in morning homeroom period.',
    sms_notified: false
  }
];
const INITIAL_LOGS = [];
const INITIAL_SCHOOL_EVENTS = [];

// ============================================================================
// ULTRA-HIGH PERFORMANCE MULTI-TIER CACHING & DATA ACCELERATION ENGINE
// ============================================================================
const CACHE_CONFIG = {
  FRESH_TTL: 60 * 1000,       // 60 seconds fresh (instant 0ms synchronous hits)
  STALE_TTL: 15 * 60 * 1000,   // 15 minutes stale-while-revalidate window
};

const _cache = {
  data: {
    students: null,
    violations: null,
    records: null,
    teachers: null,
    advisers: null,
    admins: null,
    activity_logs: null,
    school_events: null,
    dashboard_stats: null
  },
  timestamps: {
    students: 0,
    violations: 0,
    records: 0,
    teachers: 0,
    advisers: 0,
    admins: 0,
    activity_logs: 0,
    school_events: 0,
    dashboard_stats: 0
  },
  inFlightPromises: new Map()
};

// Request Coalescing / In-Flight Deduplication
const executeWithDeduplication = (key, fetcherFn) => {
  if (_cache.inFlightPromises.has(key)) {
    return _cache.inFlightPromises.get(key);
  }
  const promise = (async () => {
    try {
      return await fetcherFn();
    } finally {
      _cache.inFlightPromises.delete(key);
    }
  })();
  _cache.inFlightPromises.set(key, promise);
  return promise;
};

const invalidateCache = (key) => {
  if (key) {
    _cache.data[key] = null;
    _cache.timestamps[key] = 0;
    _cache.inFlightPromises.delete(key);
    if (key === 'records' || key === 'students' || key === 'violations') {
      _cache.data.dashboard_stats = null;
      _cache.timestamps.dashboard_stats = 0;
      _cache.inFlightPromises.delete('dashboard_stats');
    }
  } else {
    Object.keys(_cache.data).forEach(k => {
      _cache.data[k] = null;
      _cache.timestamps[k] = 0;
    });
    _cache.inFlightPromises.clear();
  }
};

subscribeCrossTabSync((payload) => {
  const entityType = payload?.entityType;
  if (entityType === 'student' || entityType === 'students') {
    invalidateCache('students');
    invalidateCache('records');
  } else if (entityType === 'record') {
    invalidateCache('records');
  } else if (entityType === 'violation') {
    invalidateCache('violations');
    invalidateCache('records');
  } else if (entityType === 'teacher') {
    invalidateCache('teachers');
    invalidateCache('advisers');
  } else if (entityType === 'admin') {
    invalidateCache('admins');
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('viotrack_data_updated', { detail: payload }));
  }
});

// Local Storage Safe Helper (Handles Quota Exceeded for 10k+ rows)
const getStored = (key, fallback) => {
  try {
    const data = localStorage.getItem(`viotrack_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(`viotrack_${key}`, JSON.stringify(val));
  } catch (err) {
    console.warn(`LocalStorage quota exceeded or write failed for ${key}, falling back to memory cache:`, err);
  }
};

const writeStudentsToApi = async (rows, { upsert = false } = {}) => {
  if (upsert) {
    return apiPost('/students/bulk', { students: rows, upsert: true });
  }
  return Promise.all(rows.map(student => apiPost('/students', student)));
};

const updateStudentInApi = async (id, payload) => {
  let lookup = String(id);
  if (!/^\d+$/.test(lookup)) {
    const students = await apiGet('/students');
    const match = students.find(student => String(student.student_id) === lookup);
    if (!match) throw new Error(`Student "${lookup}" was not found.`);
    lookup = String(match.id);
  }
  return apiPatch(`/students/${encodeURIComponent(lookup)}`, payload);
};

export const dataService = {
  // --- USER CONTEXT HELPER ---
  getCurrentUser() {
    try {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem('viotrack_active_user') : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name && parsed?.role) return parsed;
      }
    } catch {}
    return { name: 'Faculty Member', role: 'teacher' };
  },

  invalidateCache,

  // --- STUDENTS ---
  async getStudents(forceRefresh = false) {
    const now = Date.now();
    const cached = _cache.data.students;
    const cacheAge = now - _cache.timestamps.students;

    // 1. Instant Synchronous Cache Hit (Fresh)
    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.FRESH_TTL) {
      return cached;
    }

    // 2. Stale-While-Revalidate Hit: Return immediately & revalidate in background
    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.STALE_TTL) {
      // Trigger background silent revalidation without awaiting
      this.getStudents(true).catch(() => {});
      return cached;
    }

    return executeWithDeduplication('students', async () => {
      const remoteList = await apiGet('/students');

      const stored = getStored('students', []);
      const storedMap = new Map();
      stored.forEach(s => {
        const sid = String(s.student_id || '').trim();
        if (sid) storedMap.set(sid, s);
      });

      let combinedList = [];
      if (remoteList !== null) {
        const remoteIds = new Set();
        combinedList = remoteList.map(remoteItem => {
          const sid = String(remoteItem.student_id || '').trim();
          if (sid) remoteIds.add(sid);
          const localItem = storedMap.get(sid) || {};
          return {
            ...localItem,
            ...remoteItem,
            student_id: sid,
            image: getStudentPhoto(remoteItem.image) || getGeneratedStudentAvatar({ ...localItem, ...remoteItem, student_id: sid })
          };
        });

        // Keep locally cached students visible if a previous database write
        // failed. addRecord verifies the student exists remotely before saving
        // an incident, so these entries cannot create invalid foreign keys.
        stored.forEach(localItem => {
          const sid = String(localItem.student_id || localItem.student_id || '').trim();
          const isLocalMutation = localItem._localOnly
            || (localItem.created_at && Number(localItem.id) > 1000000000);
          if (sid && !remoteIds.has(sid) && isLocalMutation) {
            combinedList.unshift({ ...localItem, _localOnly: true });
          }
        });
      } else {
        combinedList = stored;
      }

      const processed = combinedList.map(s => {
        const sid = String(s.student_id || '').trim();
        return {
          ...s,
            student_id: sid,
          image: getStudentPhoto(s.image) || getGeneratedStudentAvatar(s)
        };
      });

      setStored('students', processed);
      _cache.data.students = processed;
      _cache.timestamps.students = Date.now();
      return processed;
    });
  },

  async getStudentsForReporting() {
    const normalizeStudents = (rows) => (Array.isArray(rows) ? rows : []).map(student => ({
      ...student,
      id: student.id ?? student.studentDbId,
      student_id: String(student.student_id ?? student.studentId ?? '').trim(),
      parent_contact: student.parent_contact ?? student.parentContact ?? '',
      parent_name: student.parent_name ?? student.parentName ?? '',
      academicyear: student.academicyear ?? student.academicYear ?? '',
      image: getStudentPhoto(student.image) || getGeneratedStudentAvatar(student)
    }));

    let reportingError;
    try {
      const reportingList = await apiGet('/students?purpose=report');
      if (Array.isArray(reportingList) && reportingList.length > 0) {
        return normalizeStudents(reportingList);
      }
    } catch (error) {
      reportingError = error;
    }

    // Older API deployments may not support the reporting-roster query.
    // Fall back to the normal roster, which still returns the teacher's
    // assigned students and prevents a blank picker when that endpoint works.
    try {
      const roster = await this.getStudents(true);
      if (roster.length > 0) return normalizeStudents(roster);
    } catch (fallbackError) {
      if (!reportingError) throw fallbackError;
    }

    if (reportingError) throw reportingError;
    return [];
  },

  async addStudent(student) {
    startMutation();
    try {
      let result = null;
      const studentIdVal = String(student.student_id || '').trim();
      if (!studentIdVal) {
        throw new Error('Student ID is required.');
      }

      const cleanStudent = {
            student_id: studentIdVal,
        fname: String(student.fname || '').trim(),
        mname: String(student.mname || '').trim(),
        lname: String(student.lname || '').trim(),
        email: String(student.email || '').trim().toLowerCase(),
        grade: String(student.grade || 'Grade 10').trim(),
        track: String(student.track || 'JHS').trim(),
        strand: String(student.strand || 'JHS').trim(),
        section: String(student.section || 'General').trim(),
        academicyear: String(student.academicyear || student.academic_year || '2025-2026').trim(),
        gender: String(student.gender || 'Male').trim(),
        contact: String(student.contact || '').trim(),
        parent_name: String(student.parent_name || '').trim(),
        parent_contact: String(student.parent_contact || '').trim(),
        address: String(student.address || '').trim(),
        image: getStudentPhoto(student.image) || getGeneratedStudentAvatar({ ...student, student_id: studentIdVal })
      };

      {
        try {
          const apiPayload = {
            student_id: studentIdVal,
            fname: cleanStudent.fname,
            mname: cleanStudent.mname,
            lname: cleanStudent.lname,
            email: cleanStudent.email,
            grade: cleanStudent.grade,
            section: cleanStudent.section,
            track: cleanStudent.track,
            strand: cleanStudent.strand,
            academicyear: cleanStudent.academicyear,
            gender: cleanStudent.gender,
            contact: cleanStudent.contact,
            parent_name: cleanStudent.parent_name,
            parent_contact: cleanStudent.parent_contact,
            address: cleanStudent.address,
            image: cleanStudent.image
          };

          result = await apiPost('/students', apiPayload);
          result = { ...cleanStudent, ...result, student_id: studentIdVal };
        } catch (err) {
          if (err.message?.includes('already exists')) {
            throw new Error(`Student ID "${studentIdVal}" is already registered in the system.`);
          }
          throw new Error(`Unable to save student to the database: ${err.message || String(err)}`);
        }
      }

      if (!result) {
        result = { ...cleanStudent, id: Date.now(), created_at: new Date().toISOString() };
      }

      const current = getStored('students', INITIAL_STUDENTS);
      const filtered = current.filter(s => String(s.student_id || '').trim() !== studentIdVal);
      const updated = [result, ...filtered];
      setStored('students', updated);

      invalidateCache('students');
      invalidateCache('records');
      if (_cache.data.students) {
        _cache.data.students = [result, ..._cache.data.students.filter(s => String(s.student_id || '').trim() !== studentIdVal)];
      }

      await this.addActivityLog('Add Student', `Enrolled student ${cleanStudent.fname} ${cleanStudent.lname} (ID: ${studentIdVal || 'No Student ID'}, ${cleanStudent.grade || ''} ${cleanStudent.section || ''})`);
      broadcastRecordChange('create', 'student', result);
      return result;
    } finally {
      endMutation();
    }
  },

  async bulkAddStudents(studentsList, onProgress) {
    if (!Array.isArray(studentsList) || studentsList.length === 0) return { upsertedCount: 0, errors: [] };
    startMutation();
    try {
      const CHUNK_SIZE = 100;
      const cleanStudents = studentsList.map(student => {
        const studentIdVal = String(student.student_id || '').trim();
        return {
            student_id: studentIdVal,
          fname: String(student.fname || 'Student').trim(),
          mname: String(student.mname || '').trim(),
          lname: String(student.lname || 'Roster').trim(),
          email: String(student.email || '').trim().toLowerCase(),
          grade: String(student.grade || 'Grade 10').trim(),
          track: String(student.track || 'JHS').trim(),
          strand: String(student.strand || 'JHS').trim(),
          section: String(student.section || 'General').trim(),
          academicyear: String(student.academicyear || student.academic_year || '2025-2026').trim(),
          gender: String(student.gender || 'Male').trim(),
          contact: String(student.contact || '').trim(),
          parent_name: String(student.parent_name || '').trim(),
          parent_contact: String(student.parent_contact || '').trim(),
          address: String(student.address || '').trim(),
          image: getStudentPhoto(student.image) || getGeneratedStudentAvatar({ ...student, student_id: studentIdVal })
        };
      });

      const invalidRows = cleanStudents
        .map((student, index) => (!student.student_id || !student.fname || !student.lname ? index + 1 : null))
        .filter(Boolean);
      if (invalidRows.length > 0) {
        throw new Error(`Rows ${invalidRows.slice(0, 20).join(', ')} are missing Student ID, first name, or last name.`);
      }

      const duplicateIds = cleanStudents
        .map(student => student.student_id.toLowerCase())
        .filter((studentId, index, ids) => ids.indexOf(studentId) !== index);
      if (duplicateIds.length > 0) {
        throw new Error(`Duplicate Student ID values found in the import: ${Array.from(new Set(duplicateIds)).slice(0, 20).join(', ')}`);
      }

      let totalInserted = 0;
      const errors = [];
      const total = cleanStudents.length;

      for (let i = 0; i < total; i += CHUNK_SIZE) {
      const chunk = cleanStudents.slice(i, i + CHUNK_SIZE);
      const payload = chunk.map(s => ({
            student_id: s.student_id,
        fname: s.fname,
        mname: s.mname,
        lname: s.lname,
        email: s.email,
        grade: s.grade,
        section: s.section,
        track: s.track,
        strand: s.strand,
        academicyear: s.academicyear,
        gender: s.gender,
        contact: s.contact,
        parent_name: s.parent_name,
        parent_contact: s.parent_contact,
        address: s.address,
        image: s.image
      }));
      try {
        const res = await writeStudentsToApi(payload, { upsert: true });
        totalInserted += res.upsertedCount;
      } catch (err) {
        errors.push(`Rows ${i + 1}-${Math.min(i + chunk.length, total)}: ${err.message || String(err)}`);
      }
      onProgress?.(Math.min(i + chunk.length, total), total);
      }

      if (errors.length > 0) {
        throw new Error(`Import completed with ${errors.length} failed batch(es): ${errors.join(' | ')}`);
      }

      // 2. LocalStorage Sync
      const current = getStored('students', INITIAL_STUDENTS);
      const existingIdMap = new Map(current.map(s => [String(s.student_id || '').toLowerCase(), s]));
      const newItems = [];
      let nextId = Date.now();

      cleanStudents.forEach(cs => {
        const key = String(cs.student_id || cs.student_id || '').toLowerCase();
        if (existingIdMap.has(key)) {
          const old = existingIdMap.get(key);
          Object.assign(old, cs);
        } else {
          const created = { ...cs, id: nextId++, created_at: new Date().toISOString() };
          newItems.push(created);
          existingIdMap.set(key, created);
        }
      });

      const updatedAll = [...newItems, ...current];
      setStored('students', updatedAll);

      invalidateCache('students');
      invalidateCache('records');
      await this.addActivityLog('Bulk Import', `Bulk imported and enrolled ${totalInserted} student records`);
      broadcastRecordChange('create', 'students', { count: total });

      if (onProgress) {
        onProgress(total, total);
      }

      return { upsertedCount: totalInserted, errors };
    } finally {
      endMutation();
    }
  },

  async updateStudent(id, updates) {
    startMutation();
    try {
      let result = null;
      const cleanUpdates = {};
      const allowed = ['student_id', 'fname', 'mname', 'lname', 'email', 'grade', 'track', 'strand', 'section', 'academicyear', 'gender', 'contact', 'parent_name', 'parent_contact', 'address', 'image'];
      for (const key of allowed) {
        if (updates[key] !== undefined) {
          cleanUpdates[key] = updates[key];
        }
      }

      try {
        result = await updateStudentInApi(id, cleanUpdates);
      } catch (err) {
        if (err.message?.includes('already exists')) {
          throw new Error(`Student ID "${cleanUpdates.student_id || id}" is already registered to another student.`);
        }
        throw new Error(`Unable to update student in the database: ${err.message || String(err)}`);
      }

      const current = getStored('students', INITIAL_STUDENTS);
      const updated = current.map(s => {
        const isMatch = String(s.id) === String(id) || String(s.student_id) === String(id);
        return isMatch ? { ...s, ...cleanUpdates, ...(result || {}) } : s;
      });
      setStored('students', updated);

      if (!result) {
        result = updated.find(s => String(s.id) === String(id) || String(s.student_id) === String(id));
      }

      invalidateCache('students');
      invalidateCache('records');
      const name = updates.fname || updates.lname ? `${updates.fname || ''} ${updates.lname || ''}`.trim() : `ID #${id}`;
      await this.addActivityLog('Update Student', `Updated profile information for student ${name}`);
      broadcastRecordChange('update', 'student', result || { id, ...cleanUpdates });
      return result || { id, ...cleanUpdates };
    } finally {
      endMutation();
    }
  },

  async deleteStudent(id) {
    startMutation();
    try {
      let studentId = String(id);
      if (!/^\d+$/.test(studentId)) {
        const students = await apiGet('/students');
        const match = students.find(student => String(student.student_id) === studentId);
        if (!match) throw new Error(`Student "${studentId}" was not found.`);
        studentId = String(match.id);
      }
      await apiDelete(`/students/${encodeURIComponent(studentId)}`);
      const current = getStored('students', INITIAL_STUDENTS);
      const target = current.find(s => String(s.id) === String(id) || String(s.student_id) === String(id) || String(s.student_id) === String(id));
      const name = target ? `${target.fname} ${target.lname}` : `ID #${id}`;
      const updated = current.filter(s => String(s.id) !== String(id) && String(s.student_id) !== String(id) && String(s.student_id) !== String(id));
      setStored('students', updated);
      invalidateCache('students');
      invalidateCache('records');
      await this.addActivityLog('Delete Student', `Removed student record for ${name}`);
      broadcastRecordChange('delete', 'student', { id });
      return true;
    } finally {
      endMutation();
    }
  },

  // --- VIOLATIONS CATEGORIES ---
  async getViolations(forceRefresh = false) {
    const now = Date.now();
    const cached = _cache.data.violations;
    const cacheAge = now - _cache.timestamps.violations;

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.FRESH_TTL) {
      return cached;
    }

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.STALE_TTL) {
      this.getViolations(true).catch(() => {});
      return cached;
    }

    return executeWithDeduplication('violations', async () => {
      let result = await apiGet('/violations');

      // Automatic Deduplication: Remove duplicate violation categories by normalized title
      if (Array.isArray(result)) {
        const seenTitles = new Set();
        const seenIds = new Set();
        result = result.filter(v => {
          if (!v) return false;
          const id = Number(v.id);
          const title = String(v.title || '').trim().toLowerCase();
          if (id && seenIds.has(id)) return false;
          if (title && seenTitles.has(title)) return false;
          if (id) seenIds.add(id);
          if (title) seenTitles.add(title);
          return true;
        });
      }

      _cache.data.violations = result;
      _cache.timestamps.violations = Date.now();
      return result;
    });
  },

  async addViolationType(violation) {
    const cleanViolation = {
      title: String(violation.title || '').trim(),
      description: String(violation.description || '').trim(),
      type: String(violation.type || 'Minor').trim(),
      default_sanction: String(violation.default_sanction || '').trim()
    };

    // Check for existing duplicate title
    const current = await this.getViolations();
    const existing = current.find(v => (v.title || '').trim().toLowerCase() === cleanViolation.title.toLowerCase());
    if (existing) {
      return existing;
    }

    let result = await apiPost('/violations', cleanViolation);
    const currentStored = getStored('violations', INITIAL_VIOLATIONS);
    const updated = [...currentStored.filter(v => (v.title || '').trim().toLowerCase() !== cleanViolation.title.toLowerCase()), result];
    setStored('violations', updated);
    invalidateCache('violations');
    await this.addActivityLog('Add Violation Category', `Created category "${cleanViolation.title}" (${cleanViolation.type})`);
    try {
      window.dispatchEvent(new CustomEvent('viotrack_data_updated', { detail: result }));
    } catch {}
    return result;
  },

  async updateViolationType(id, updates) {
    let result = null;
    const cleanUpdates = {};
    const allowed = ['title', 'description', 'type', 'default_sanction'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    }

    result = await apiPatch(`/violations/${encodeURIComponent(id)}`, cleanUpdates);
    const current = getStored('violations', INITIAL_VIOLATIONS);
    const updated = current.map(v => (v.id === Number(id) ? { ...v, ...updates } : v));
    setStored('violations', updated);
    if (!result) result = updated.find(v => v.id === Number(id));
    invalidateCache('violations');
    await this.addActivityLog('Update Violation Category', `Updated category "${updates.title || result?.title || '#' + id}" (${updates.type || result?.type || ''})`);
    try {
      window.dispatchEvent(new CustomEvent('viotrack_data_updated', { detail: result }));
    } catch {}
    return result;
  },

  async deleteViolationType(id) {
    await apiDelete(`/violations/${encodeURIComponent(id)}`);
    const current = getStored('violations', INITIAL_VIOLATIONS);
    const target = current.find(v => v.id === Number(id));
    const title = target ? target.title : `ID #${id}`;
    const updated = current.filter(v => v.id !== Number(id));
    setStored('violations', updated);
    invalidateCache('violations');
    await this.addActivityLog('Delete Violation Category', `Removed violation category "${title}"`);
    try {
      window.dispatchEvent(new CustomEvent('viotrack_data_updated', { detail: { id } }));
    } catch {}
    return true;
  },

  // --- RECORDS / INCIDENTS ---
  async getRecords(forceRefresh = false) {
    const now = Date.now();
    const cached = _cache.data.records;
    const cacheAge = now - _cache.timestamps.records;

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.FRESH_TTL) {
      return cached;
    }

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.STALE_TTL) {
      this.getRecords(true).catch(() => {});
      return cached;
    }

    return executeWithDeduplication('records', async () => {
      const [students, violations] = await Promise.all([
        this.getStudents(),
        this.getViolations()
      ]);

      const studentMap = new Map();
      INITIAL_STUDENTS.forEach((s) => {
        if (s.id) {
          studentMap.set(Number(s.id), s);
          studentMap.set(String(s.id), s);
        }
        if (s.student_id) studentMap.set(String(s.student_id).trim(), s);
        if (s.student_id) studentMap.set(String(s.student_id).trim(), s);
      });
      students.forEach((s, idx) => {
        if (s.id) {
          studentMap.set(Number(s.id), s);
          studentMap.set(String(s.id), s);
        }
        if (s.student_id) studentMap.set(String(s.student_id).trim(), s);
        if (s.student_id) studentMap.set(String(s.student_id).trim(), s);
        if (!studentMap.has(idx + 1)) {
          studentMap.set(idx + 1, s);
        }
      });
      const violationMap = new Map();
      violations.forEach((v, idx) => {
        if (v.id) {
          violationMap.set(Number(v.id), v);
          violationMap.set(String(v.id), v);
        }
        violationMap.set(idx + 1, v);
      });

      const remoteRecords = await apiGet('/records');

      let allRawRecords = [];
      if (remoteRecords !== null) {
        allRawRecords = [...remoteRecords];
        // MySQL is authoritative; remove stale browser-only records
        // so local and hosted clients resolve the same dataset.
        setStored('records', allRawRecords);
      } else {
        allRawRecords = getStored('records', INITIAL_RECORDS);
      }

      let mappedRecords = allRawRecords.map(r => {
        const isTeacher = r.reported_by_type === 'teacher';
        
        let resolvedApproval = r.approval_status;
        if (resolvedApproval === 'Under Approval' || (!isTeacher && r.status === 'Under Approval' && resolvedApproval === 'Not Required')) {
          resolvedApproval = 'Under Approval';
        } else if (r.status === 'Rejected') {
          resolvedApproval = 'Rejected';
        } else if (resolvedApproval === 'Rejected') {
          resolvedApproval = 'Rejected';
        } else if (resolvedApproval === 'Approved') {
          resolvedApproval = 'Approved';
        } else if (isTeacher && r.status === 'Under Approval') {
          resolvedApproval = 'Under Approval';
        } else if (!resolvedApproval) {
          if (r.approved_by) {
            resolvedApproval = 'Approved';
          } else if (isTeacher) {
            resolvedApproval = 'Under Approval';
          } else {
            resolvedApproval = 'Not Required';
          }
        }

        const rawStudent = r.students || r.student;
        let resolvedStudent = (rawStudent && (rawStudent.fname || rawStudent.lname))
          ? rawStudent
          : (studentMap.get(Number(r.student_id)) || studentMap.get(String(r.student_id)) || rawStudent);

        if (!resolvedStudent || (!resolvedStudent.fname && !resolvedStudent.lname)) {
          resolvedStudent = (students || []).find(s => String(s.student_id) === String(r.student_id) || String(s.id) === String(r.student_id))
            || INITIAL_STUDENTS.find(s => String(s.student_id) === String(r.student_id) || String(s.id) === String(r.student_id))
            || INITIAL_STUDENTS[0];
        }

        const sid = String(resolvedStudent.student_id || r.student_id || '109283746101').trim();
        const sImage = getStudentPhoto(resolvedStudent.image) || getGeneratedStudentAvatar(resolvedStudent);

        resolvedStudent = {
          ...resolvedStudent,
            student_id: sid,
          image: sImage
        };

        const rawViolation = r.violations || r.violation;
        const resolvedViolation = (rawViolation && rawViolation.title)
          ? rawViolation
          : (violationMap.get(Number(r.violation_id)) || violationMap.get(String(r.violation_id)) || rawViolation);

        return {
          ...r,
          approval_status: resolvedApproval,
          student: resolvedStudent,
          violation: resolvedViolation
        };
      });

      // Automatic Deduplication of Incident Records
      if (Array.isArray(mappedRecords)) {
        const seenIds = new Set();
        mappedRecords = mappedRecords.filter(r => {
          if (!r) return false;
          const id = Number(r.id);
          if (id && seenIds.has(id)) return false;
          if (id) seenIds.add(id);
          return true;
        });
      }

      _cache.data.records = mappedRecords;
      _cache.timestamps.records = Date.now();
      return mappedRecords;
    });
  },

  async addRecord(record) {
    startMutation();
    try {
      let result = null;
      let databaseStudentId = Number(record.student_id);

      const studentIdValue = record.student_id_value;
      if (studentIdValue) {
        const students = await apiGet('/students?purpose=report');
        const matchedStudent = students.find(student =>
          String(student.id) === String(databaseStudentId) ||
          String(student.student_id) === String(studentIdValue)
        );
        if (!matchedStudent) {
          throw new Error('The selected student does not exist in the database. Refresh the student list and try again.');
        }
        databaseStudentId = Number(matchedStudent.id);
      }

      let remarksText = record.remarks || '';
      if (record.lat != null && record.lng != null && !remarksText.includes('GPS:')) {
        const gpsNote = ` [GPS: ${Number(record.lat).toFixed(4)}, ${Number(record.lng).toFixed(4)}${record.accuracy ? ` (±${record.accuracy}m)` : ''}]`;
        remarksText = remarksText ? `${remarksText}${gpsNote}` : gpsNote.trim();
      }

      const isTeacherReport = (record.reported_by_type === 'teacher');
      const defaultApprovalStatus = record.approval_status || (isTeacherReport ? 'Under Approval' : 'Approved');

      const cleanRecord = {
        student_id: databaseStudentId,
        violation_id: Number(record.violation_id),
        reported_by_name: record.reported_by_name || 'System Admin',
        reported_by_type: record.reported_by_type || 'admin',
        date_reported: record.date_reported || new Date().toISOString(),
        status: record.status || (isTeacherReport ? 'Under Approval' : 'Pending'),
        approval_status: defaultApprovalStatus,
        approved_by: record.approved_by || (defaultApprovalStatus === 'Approved' ? (record.reported_by_name || 'Admin') : null),
        approved_at: record.approved_at || (defaultApprovalStatus === 'Approved' ? new Date().toISOString() : null),
        rejection_reason: record.rejection_reason || null,
        rejected_by: record.rejected_by || null,
        rejected_at: record.rejected_at || null,
        sanction: record.sanction || '',
        remarks: remarksText,
        resolution_notes: record.resolution_notes || '',
        resolution_date: record.resolution_date || null,
        sms_notified: Boolean(record.sms_notified)
      };

      try {
        result = await apiPost('/records', cleanRecord);
      } catch (err) {
        throw new Error(`Unable to save the violation record to the database: ${err.message || String(err)}`);
      }

      const current = getStored('records', INITIAL_RECORDS);

      const updated = [result, ...current];
      setStored('records', updated);
      invalidateCache('records');

      broadcastRecordChange('create', 'record', result);
      return result;
    } finally {
      endMutation();
    }
  },

  async updateRecordStatus(id, { status, resolution_notes, sanction }) {
    startMutation();
    try {
      const isResolved = status === 'Resolved';
      const payload = {
        status,
        resolution_notes: resolution_notes || '',
        sanction: sanction || '',
        resolution_date: isResolved ? new Date().toISOString() : null
      };

      const result = await apiPatch(`/records/${encodeURIComponent(id)}`, payload);
      const current = getStored('records', INITIAL_RECORDS);
      const updated = current.map(r => (Number(r.id) === Number(id) ? { ...r, ...payload } : r));
      setStored('records', updated);
      invalidateCache('records');

      const sanctionSuffix = sanction ? ` | Sanction: ${sanction}` : '';
      await this.addActivityLog('Status Update', `Marked Incident #${id} as "${status}"${sanctionSuffix}`);
      broadcastRecordChange('update', 'record', result);
      return result;
    } finally {
      endMutation();
    }
  },

  async approveRecord(id, { approved_by = 'Head Admin', status = 'Pending', notes = '' } = {}) {
    startMutation();
    try {
      const payload = {
        approval_status: 'Approved',
        status: status || 'Pending',
        approved_by,
        approved_at: new Date().toISOString(),
        rejection_reason: null,
        resolution_notes: notes ? notes : undefined
      };

      const result = await apiPatch(`/records/${encodeURIComponent(id)}`, payload);

      const current = getStored('records', INITIAL_RECORDS);
      const updated = current.map(r => (Number(r.id) === Number(id) ? { ...r, ...payload } : r));
      setStored('records', updated);
      invalidateCache('records');

      await this.addActivityLog('Approve Violation', `Approved teacher violation report #${id} by ${approved_by}`);
      broadcastRecordChange('update', 'record', result);
      return result;
    } finally {
      endMutation();
    }
  },

  async rejectRecord(id, { rejected_by = 'Head Admin', rejection_reason = 'Disapproved by administration' } = {}) {
    startMutation();
    try {
      const payload = {
        approval_status: 'Rejected',
        status: 'Rejected',
        rejected_by,
        rejected_at: new Date().toISOString(),
        rejection_reason
      };

      const result = await apiPatch(`/records/${encodeURIComponent(id)}`, payload);

      const current = getStored('records', INITIAL_RECORDS);
      const updated = current.map(r => (Number(r.id) === Number(id) ? { ...r, ...payload } : r));
      setStored('records', updated);
      invalidateCache('records');

      await this.addActivityLog('Reject Violation', `Rejected teacher violation report #${id} (Reason: ${rejection_reason})`);
      broadcastRecordChange('update', 'record', result);
      return result;
    } finally {
      endMutation();
    }
  },

  async deleteRecord(id) {
    startMutation();
    try {
      await apiDelete(`/records/${encodeURIComponent(id)}`);
      const current = getStored('records', INITIAL_RECORDS);
      const updated = current.filter(r => Number(r.id) !== Number(id));
      setStored('records', updated);
      invalidateCache('records');
      await this.addActivityLog('Delete Record', `Removed violation record #${id}`);
      broadcastRecordChange('delete', 'record', { id });
      return true;
    } finally {
      endMutation();
    }
  },

  // --- TEACHERS & ADVISERS ---
  async getTeachers(forceRefresh = false) {
    const now = Date.now();
    const cached = _cache.data.teachers;
    const cacheAge = now - _cache.timestamps.teachers;

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.FRESH_TTL) {
      return cached;
    }

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.STALE_TTL) {
      this.getTeachers(true).catch(() => {});
      return cached;
    }

    return executeWithDeduplication('teachers', async () => {
      const remoteList = await apiGet('/teachers');

      const localList = getStored('teachers', INITIAL_TEACHERS);
      const list = remoteList !== null
        ? remoteList.map(r => {
            return {
              ...r,
              image: getAdminProfilePhoto(r.image),
              twoFactorEnabled: Boolean(r.two_factor_enabled ?? r.twoFactorEnabled),
              password: undefined
            };
          })
        : localList.map(admin => ({
            ...admin,
            image: getAdminProfilePhoto(admin.image)
          }));

      _cache.data.teachers = list;
      _cache.timestamps.teachers = Date.now();
      return list;
    });
  },

  // --- LIVE STUDENT LOCATION TRACKING (GPS & TELEMETRY) ---
  async getStudentLatestLocation(studentId) {
    if (!studentId) return null;

    const rows = await apiGet(`/student-locations?studentId=${encodeURIComponent(studentId)}&limit=1`);
    if (rows[0]) {
      return {
        ...rows[0],
        latitude: Number(rows[0].latitude),
        longitude: Number(rows[0].longitude)
      };
    }

    const storedHistory = getStored(`locations_${studentId}`, []);
    if (storedHistory.length > 0) return storedHistory[0];

    return null;
  },

  async getStudentLocationHistory(studentId, limit = 15) {
    if (!studentId) return [];

    const rows = await apiGet(`/student-locations?studentId=${encodeURIComponent(studentId)}&limit=${encodeURIComponent(limit)}`);
    if (Array.isArray(rows)) {
      return rows.map(row => ({
        ...row,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude)
      }));
    }

    const stored = getStored(`locations_${studentId}`, []);
    if (stored.length > 0) return stored.slice(0, limit);

    return [];
  },

  async saveStudentLocation(studentId, { latitude, longitude, accuracy_meters, tracking_status = 'Active' }) {
    if (!studentId) throw new Error('Student ID is required');

    const lat = Number(latitude);
    const lng = Number(longitude);
    const acc = accuracy_meters == null ? 10 : Number(accuracy_meters);

    // Strict Coordinate Validation
    if (isNaN(lat) || lat < -90 || lat > 90) throw new Error('Invalid latitude coordinates');
    if (isNaN(lng) || lng < -180 || lng > 180) throw new Error('Invalid longitude coordinates');
    if (!Number.isFinite(acc) || acc < 0) throw new Error('Invalid accuracy range');

    const currentUser = this.getCurrentUser();
    const payload = {
      student_id: Number(studentId),
      latitude: lat,
      longitude: lng,
      accuracy_meters: acc,
      tracking_status: tracking_status,
      recorded_at: new Date().toISOString(),
      reported_by: currentUser.name || 'System'
    };

    const savedResult = await apiPost('/student-locations', payload);

    // Local storage fallback
    const key = `locations_${studentId}`;
    const history = getStored(key, []);
    const updatedHistory = [{ ...payload, id: Date.now() }, ...history].slice(0, 50);
    setStored(key, updatedHistory);

    try {
      window.dispatchEvent(new CustomEvent('viotrack_location_updated', { detail: payload }));
    } catch {}

    return savedResult;
  },

  async addTeacher(teacher) {
    let result = null;
    const cleanTeacher = {
      fname: String(teacher.fname || '').trim(),
      mname: String(teacher.mname || '').trim(),
      lname: String(teacher.lname || '').trim(),
      email: String(teacher.email || '').trim().toLowerCase(),
      position: String(teacher.position || 'Teacher').trim(),
      department: String(teacher.department || 'General').trim(),
      specialization: String(teacher.specialization || '').trim(),
      contact: String(teacher.contact || '').trim(),
      gender: String(teacher.gender || 'Male').trim(),
      image: getStudentPhoto(teacher.image)
    };

    const password = String(teacher.password || '').trim();
    result = await apiPost('/teachers', { ...cleanTeacher, password });
    const current = getStored('teachers', INITIAL_TEACHERS);
    const updated = [result, ...current.filter(t => t.email !== cleanTeacher.email)];
    setStored('teachers', updated);
    invalidateCache('teachers');
    invalidateCache('advisers');
    return result;
  },

  async updateTeacher(id, updates) {
    let result = null;
    const cleanUpdates = {};
    // Password hashing is handled only by the server.
    const allowed = ['fname', 'mname', 'lname', 'email', 'position', 'department', 'specialization', 'contact', 'gender', 'image'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = String(updates[key]).trim();
      }
    }

    const rawPassword = String(updates.password || '').trim();

    result = await apiPatch(`/teachers/${encodeURIComponent(id)}`, {
      ...cleanUpdates,
      ...(rawPassword ? { password: rawPassword } : {})
    });
    const current = getStored('teachers', INITIAL_TEACHERS);
    const updated = current.map(t => (
      String(t.id) === String(id) ? { ...t, ...cleanUpdates, ...(result || {}) } : t
    ));
    setStored('teachers', updated);
    invalidateCache('teachers');
    invalidateCache('advisers');
    if (!result) result = updated.find(t => t.id === Number(id));
    await this.addActivityLog('Update Teacher', `Updated details for faculty ${updates.fname || ''} ${updates.lname || ''} (#${id})`);
    broadcastRecordChange('update', 'teacher', result || { id, ...cleanUpdates });
    return result;
  },

  async deleteTeacher(id) {
    startMutation();
    try {
      const numericId = Number(id);
      const hasNumeric = !isNaN(numericId) && numericId > 0;

      if (!hasNumeric) {
        throw new Error('A numeric teacher ID is required to delete this account.');
      }
      await apiDelete(`/teachers/${encodeURIComponent(numericId)}`);

      // Also remove any local adviser appointments for this teacher
      const currentAdvisers = getStored('advisers', INITIAL_ADVISERS);
      const updatedAdvisers = currentAdvisers.filter(a => String(a.teacher_id) !== String(id));
      setStored('advisers', updatedAdvisers);

      const current = getStored('teachers', INITIAL_TEACHERS);
      const target = current.find(t => String(t.id) === String(id) || String(t.email) === String(id));
      const name = target ? `${target.fname} ${target.lname}` : `ID #${id}`;
      const updated = current.filter(t => String(t.id) !== String(id) && String(t.email) !== String(id));
      setStored('teachers', updated);
      invalidateCache('teachers');
      invalidateCache('advisers');
      if (_cache.data.teachers) {
        _cache.data.teachers = _cache.data.teachers.filter(t => String(t.id) !== String(id) && String(t.email) !== String(id));
      }
      await this.addActivityLog('Delete Teacher', `Removed faculty member ${name}`);
      broadcastRecordChange('delete', 'teacher', { id });
      return true;
    } finally {
      endMutation();
    }
  },

  async getAdvisers(forceRefresh = false) {
    const now = Date.now();
    const cached = _cache.data.advisers;
    const cacheAge = now - _cache.timestamps.advisers;

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.FRESH_TTL) {
      return cached;
    }

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.STALE_TTL) {
      this.getAdvisers(true).catch(() => {});
      return cached;
    }

    return executeWithDeduplication('advisers', async () => {
      const data = await apiGet('/advisers');
      if (Array.isArray(data)) {
        const mapped = data;
        _cache.data.advisers = mapped;
        _cache.timestamps.advisers = Date.now();
        setStored('advisers', mapped);
        return mapped;
      }
      const advisers = getStored('advisers', INITIAL_ADVISERS);
      const teachers = await this.getTeachers();
      const teacherMap = new Map(teachers.map(t => [Number(t.id), t]));
      const mapped = advisers.map(a => ({
        ...a,
        teacher: teacherMap.get(Number(a.teacher_id))
      }));
      _cache.data.advisers = mapped;
      _cache.timestamps.advisers = Date.now();
      return mapped;
    });
  },

  async saveAdviserAssignment(teacher_id, grade_level, class_section) {
    const cleanPayload = {
      teacher_id: Number(teacher_id),
      grade_level: String(grade_level).trim(),
      class_section: String(class_section).trim()
    };

    await apiPost('/advisers/assign', cleanPayload);
    let current = getStored('advisers', INITIAL_ADVISERS);
    // Enforce 1:1 rule: remove any prior assignment for this teacher OR for this section
    current = current.filter(a =>
      Number(a.teacher_id) !== Number(teacher_id) &&
      !(
        String(a.grade_level).trim().toLowerCase() === cleanPayload.grade_level.toLowerCase() &&
        String(a.class_section).trim().toLowerCase() === cleanPayload.class_section.toLowerCase()
      )
    );
    current.push({ id: Date.now(), ...cleanPayload, created_at: new Date().toISOString() });
    setStored('advisers', current);
    invalidateCache('advisers');

    let teacherName = `Teacher #${teacher_id}`;
    try {
      const teachers = getStored('teachers', INITIAL_TEACHERS);
      const t = teachers.find(item => item.id === Number(teacher_id));
      if (t) teacherName = `${t.fname} ${t.lname}`;
    } catch {}

    await this.addActivityLog('Adviser Assigned', `Appointed ${teacherName} as adviser for ${grade_level} - ${class_section}`);
    return true;
  },

  async removeAdviser(id) {
    await apiDelete(`/advisers/${encodeURIComponent(id)}`);
    const current = getStored('advisers', INITIAL_ADVISERS);
    const updated = current.filter(a => a.id !== Number(id));
    setStored('advisers', updated);
    invalidateCache('advisers');
    await this.addActivityLog('Adviser Removed', `Removed adviser assignment #${id}`);
    return true;
  },

  // --- ADMIN USERS ---
  async getAdmins(forceRefresh = false) {
    const now = Date.now();
    const cached = _cache.data.admins;
    const cacheAge = now - _cache.timestamps.admins;

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.FRESH_TTL) {
      return cached;
    }

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.STALE_TTL) {
      this.getAdmins(true).catch(() => {});
      return cached;
    }

    return executeWithDeduplication('admins', async () => {
      const remoteList = await apiGet('/admins');

      const localList = getStored('admins', INITIAL_ADMINS);
      const list = remoteList !== null
        ? remoteList.map(r => {
            return {
              ...r,
              twoFactorEnabled: Boolean(r.two_factor_enabled ?? r.twoFactorEnabled),
              password: undefined
            };
          })
        : localList;

      _cache.data.admins = list;
      _cache.timestamps.admins = Date.now();
      return list;
    });
  },

  async addAdmin(admin) {
    startMutation();
    try {
      const cleanAdmin = {
        fname: String(admin.fname || '').trim(),
        mname: String(admin.mname || '').trim(),
        lname: String(admin.lname || '').trim(),
        email: String(admin.email || '').trim().toLowerCase(),
        role: String(admin.role || 'Head Admin').trim(),
        position: String(admin.position || 'Discipline Staff').trim(),
        contact: String(admin.contact || '').trim(),
        image: getAdminProfilePhoto(admin.image)
      };
      const result = await apiPost('/admins', {
        ...cleanAdmin,
        password: String(admin.password || '').trim()
      });

      const current = getStored('admins', INITIAL_ADMINS);
      const updated = [result, ...current.filter(a => a.email !== cleanAdmin.email)];
      setStored('admins', updated);
      invalidateCache('admins');
      if (_cache.data.admins) {
        _cache.data.admins = updated;
      }
      broadcastRecordChange('create', 'admin', result);
      return result;
    } finally {
      endMutation();
    }
  },

  async updateAdmin(id, updates) {
    startMutation();
    try {
      const cleanUpdates = {};
      const allowed = ['fname', 'mname', 'lname', 'email', 'role', 'position', 'contact', 'image'];
      for (const key of allowed) {
        if (updates[key] !== undefined) {
          cleanUpdates[key] = updates[key];
        }
      }

      const rawPassword = String(updates.password || '').trim();
      const result = await apiPatch(`/admins/${encodeURIComponent(id)}`, {
        ...cleanUpdates,
        ...(rawPassword ? { password: rawPassword } : {})
      });

      const current = getStored('admins', INITIAL_ADMINS);
      const updated = current.map(a => (String(a.id) === String(id) || String(a.email) === String(id) ? { ...a, ...cleanUpdates, ...(result || {}) } : a));
      setStored('admins', updated);
      invalidateCache('admins');
      if (_cache.data.admins) {
        _cache.data.admins = updated;
      }
      await this.addActivityLog('Update Admin', `Updated admin profile for ${updates.fname || ''} ${updates.lname || ''} (${updates.role || 'Admin'})`);
      broadcastRecordChange('update', 'admin', result);
      return result;
    } finally {
      endMutation();
    }
  },

  async removeAdminTwoFactor(id) {
    startMutation();
    try {
      const result = await apiDelete(`/admins/${encodeURIComponent(id)}/two-factor`);
      invalidateCache('admins');
      broadcastRecordChange('update', 'admin', { id, twoFactorEnabled: false });
      return result;
    } finally {
      endMutation();
    }
  },

  async deleteAdmin(id) {
    startMutation();
    try {
      const numericId = Number(id);
      const hasNumeric = !isNaN(numericId) && numericId > 0;

      await apiDelete(`/admins/${encodeURIComponent(hasNumeric ? numericId : String(id))}`);
      const current = getStored('admins', INITIAL_ADMINS);
      const target = current.find(a => String(a.id) === String(id) || String(a.email) === String(id));
      const name = target ? `${target.fname} ${target.lname}` : `ID #${id}`;
      const updated = current.filter(a => String(a.id) !== String(id) && String(a.email) !== String(id));
      setStored('admins', updated);
      invalidateCache('admins');
      if (_cache.data.admins) {
        _cache.data.admins = _cache.data.admins.filter(a => String(a.id) !== String(id) && String(a.email) !== String(id));
      }
      await this.addActivityLog('Delete Admin', `Removed administrator account for ${name}`);
      broadcastRecordChange('delete', 'admin', { id });
      return true;
    } finally {
      endMutation();
    }
  },

  // --- ACTIVITY LOGS ---
  async getActivityLogs(forceRefresh = false) {
    const now = Date.now();
    const cached = _cache.data.activity_logs;
    const cacheAge = now - _cache.timestamps.activity_logs;

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.FRESH_TTL) {
      return cached;
    }

    return executeWithDeduplication('activity_logs', async () => {
      const pageSize = 500;
      const remoteList = [];
      let offset = 0;
      while (true) {
        const page = await apiGet(`/activity-logs?limit=${pageSize}&offset=${offset}`);
        if (!Array.isArray(page)) {
          throw new Error('The activity log endpoint returned an invalid response.');
        }
        remoteList.push(...page);
        if (page.length < pageSize) break;
        offset += page.length;
      }
      const list = remoteList.sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || 0).getTime();
        const dateB = new Date(b.created_at || b.date || 0).getTime();
        return dateB - dateA;
      });
      setStored('activity_logs', list);
      _cache.data.activity_logs = list;
      _cache.timestamps.activity_logs = Date.now();
      return list;
    });
  },

  async addActivityLog(action, details, userName, userRole, extraMeta = {}) {
    const activeUser = this.getCurrentUser();
    const finalUserName = userName || activeUser.name || 'System Admin';
    const finalUserRole = userRole || activeUser.role || 'admin';
    const timestamp = new Date().toISOString();
    const auditId = `AUD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      audit_id: auditId,
      user_name: finalUserName,
      user_role: finalUserRole,
      action,
      details,
      ip_address: extraMeta.ip || null,
      device_info: extraMeta.device_info || null,
      created_at: timestamp,
      ...extraMeta
    };

    const savedLog = await apiPost('/activity-logs', { action, details });
    Object.assign(newLog, savedLog);
    const current = getStored('activity_logs', INITIAL_LOGS);
    const updated = [newLog, ...current.slice(0, 299)];
    setStored('activity_logs', updated);
    invalidateCache('activity_logs');

    // Notify all active listeners across the app
    try {
      window.dispatchEvent(new CustomEvent('viotrack_activity_logged', { detail: newLog }));
    } catch {}

    return newLog;
  },

  // --- STORAGE & PHOTO UPLOADS ---
  async uploadPhoto(file) {
    if (!file) return null;
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Unable to read the selected image.'));
      reader.readAsDataURL(file);
    });
    const response = await apiPost('/uploads', {
      dataUrl,
      fileName: file.name,
      mimeType: file.type
    });
    return response.url;
  },

  // --- SCHOOL CALENDAR & EVENTS ---
  async getSchoolEvents(forceRefresh = false) {
    const now = Date.now();
    const cached = _cache.data.school_events;
    const cacheAge = now - _cache.timestamps.school_events;

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.FRESH_TTL) {
      return cached;
    }

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.STALE_TTL) {
      this.getSchoolEvents(true).catch(() => {});
      return cached;
    }

    return executeWithDeduplication('school_events', async () => {
      const list = await apiGet('/school-events');
      _cache.data.school_events = list;
      _cache.timestamps.school_events = Date.now();
      return list;
    });
  },

  async addSchoolEvent(event) {
    let result = await apiPost('/school-events', event);
    const current = getStored('school_events', INITIAL_SCHOOL_EVENTS);
    const updated = [...current, result];
    setStored('school_events', updated);
    invalidateCache('school_events');
    await this.addActivityLog('Schedule Event', `Added calendar event "${event.title}" on ${event.date}`);
    try {
      window.dispatchEvent(new CustomEvent('viotrack_events_updated', { detail: result }));
    } catch {}
    return result;
  },

  async deleteSchoolEvent(id) {
    await apiDelete(`/school-events/${encodeURIComponent(id)}`);
    const current = getStored('school_events', INITIAL_SCHOOL_EVENTS);
    const target = current.find(e => e.id === Number(id));
    const title = target ? target.title : `ID #${id}`;
    const updated = current.filter(e => e.id !== Number(id));
    setStored('school_events', updated);
    invalidateCache('school_events');
    await this.addActivityLog('Delete Event', `Removed calendar event "${title}"`);
    try {
      window.dispatchEvent(new CustomEvent('viotrack_events_updated', { detail: { id } }));
    } catch {}
    return true;
  },

  // --- SMS TRIGGER (iProgSMS Gateway) ---
  async sendSMS(studentContact, recipientName, studentName, violationTitle, customMessage = null) {
    const result = await smsService.sendSMS({
      recipientNumber: studentContact,
      recipientName,
      studentName,
      violationTitle,
      customMessage
    });

    const logStatus = result.isLive ? (result.success ? 'Live SMS Sent' : 'SMS Failed') : 'SMS Dispatched (Simulated)';
    await this.addActivityLog(
      'SMS Dispatch',
      `Notification (${logStatus}) to ${studentContact} (${recipientName || 'Parent'}) for student ${studentName}`
    );

    return result;
  },

  // --- HIGH-PERFORMANCE PRECOMPUTED ANALYTICS & PAGINATION (Large DB Optimization) ---
  async getDashboardStats(forceRefresh = false) {
    const now = Date.now();
    const cached = _cache.data.dashboard_stats;
    const cacheAge = now - _cache.timestamps.dashboard_stats;

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.FRESH_TTL) {
      return cached;
    }

    if (!forceRefresh && cached && cacheAge < CACHE_CONFIG.STALE_TTL) {
      this.getDashboardStats(true).catch(() => {});
      return cached;
    }

    return executeWithDeduplication('dashboard_stats', async () => {
      const [students, records, events] = await Promise.all([
        this.getStudents(),
        this.getRecords(),
        this.getSchoolEvents()
      ]);

      const approvedRecords = (records || []).filter(r => ['Approved', 'Not Required'].includes(r.approval_status));
      const underApprovalCount = (records || []).filter(r => r.approval_status === 'Under Approval' || r.status === 'Under Approval').length;
      const pendingCount = approvedRecords.filter(r => r.status === 'Pending').length;
      const resolvedCount = approvedRecords.filter(r => r.status === 'Resolved').length;
      const investigationCount = approvedRecords.filter(r => r.status === 'Investigation').length;

      let minorCount = 0;
      let seriousCount = 0;
      let majorCount = 0;

      const infractionMap = new Map();

      for (const r of approvedRecords) {
        const type = (r.violation?.type || 'Minor').toLowerCase();
        if (type.includes('major')) majorCount++;
        else if (type.includes('serious')) seriousCount++;
        else minorCount++;

        const sId = r.student_id;
        if (sId) {
          const current = infractionMap.get(sId) || { count: 0, student: r.student, records: [] };
          current.count++;
          if (r.student) current.student = r.student;
          current.records.push(r);
          infractionMap.set(sId, current);
        }
      }

      const repeatOffenders = Array.from(infractionMap.values())
        .filter(item => item.count >= 2 && item.student)
        .sort((a, b) => b.count - a.count);

      const stats = {
        totalStudents: (students || []).length,
        totalViolations: approvedRecords.length,
        pendingViolations: pendingCount,
        resolvedViolations: resolvedCount,
        investigationViolations: investigationCount,
        underApprovalViolations: underApprovalCount,
        minorCount,
        seriousCount,
        majorCount,
        repeatOffenders,
        schoolEvents: events || [],
        calculatedAt: new Date().toISOString()
      };

      _cache.data.dashboard_stats = stats;
      _cache.timestamps.dashboard_stats = Date.now();
      return stats;
    });
  },

  async getStudentsPaginated({ page = 1, limit = 10, search = '', grade = 'all', section = 'all', sortField = 'grade', sortOrder = 'asc' } = {}) {
    const allStudents = await this.getStudents();
    const query = String(search || '').toLowerCase().trim();

    let filtered = allStudents;
    if (query) {
      filtered = filtered.filter(s =>
        (s.fname && s.fname.toLowerCase().includes(query)) ||
        (s.lname && s.lname.toLowerCase().includes(query)) ||
        (s.student_id && String(s.student_id).toLowerCase().includes(query)) ||
        (s.email && s.email.toLowerCase().includes(query)) ||
        (s.section && s.section.toLowerCase().includes(query))
      );
    }

    if (grade !== 'all') {
      filtered = filtered.filter(s => s.grade === grade);
    }
    if (section !== 'all') {
      filtered = filtered.filter(s => s.section === section);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();
      if (sortOrder === 'desc') {
        return valB.localeCompare(valA, undefined, { numeric: true });
      }
      return valA.localeCompare(valB, undefined, { numeric: true });
    });

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  },

  async getRecordsPaginated({ page = 1, limit = 10, status = 'all', approvalStatus = 'all', search = '', dateRange = null } = {}) {
    const allRecords = await this.getRecords();
    const query = String(search || '').toLowerCase().trim();

    let filtered = allRecords;

    if (approvalStatus !== 'all') {
      filtered = filtered.filter(r => (r.approval_status || '').toLowerCase() === approvalStatus.toLowerCase());
    }

    if (status !== 'all') {
      filtered = filtered.filter(r => (r.status || '').toLowerCase() === status.toLowerCase());
    }

    if (query) {
      filtered = filtered.filter(r => {
        const s = r.student;
        const v = r.violation;
        return (
          (s?.fname && s.fname.toLowerCase().includes(query)) ||
          (s?.lname && s.lname.toLowerCase().includes(query)) ||
          (s?.student_id && String(s.student_id).toLowerCase().includes(query)) ||
          (v?.title && v.title.toLowerCase().includes(query)) ||
          (r.remarks && r.remarks.toLowerCase().includes(query))
        );
      });
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  },

  // --- AUTOMATED DATABASE BACKUPS & ONE-CLICK RESTORE ---
  async createDatabaseBackup(type = 'manual') {
    const snapshot = validateBackupPayload(await apiGet('/database/backup'));
    if (snapshot.format_version !== 2) {
      throw new Error('The database returned an unsupported backup format.');
    }
    snapshot.type = type;

    // Store in backup snapshots registry
    const existingSnapshots = this.getBackupHistory();
    const updatedSnapshots = [
      {
        id: snapshot.backup_id,
        type,
        created_at: snapshot.created_at,
        created_by: snapshot.created_by,
        counts: snapshot.counts,
        size_kb: Math.round(JSON.stringify(snapshot).length / 1024),
        snapshot
      },
      ...existingSnapshots.slice(0, 19)
    ];

    try {
      localStorage.setItem('viotrack_backup_snapshots', JSON.stringify(updatedSnapshots));
    } catch (e) {
      console.warn('Local storage quota warning on backup snapshot save:', e);
    }

    // Log the backup operation in the audit trail
    try {
      await this.addActivityLog(
        'Database Backup Created',
        `Full system snapshot generated (${snapshot.counts.records} violation records, ${snapshot.counts.students} students) [${type.toUpperCase()}]`
      );
    } catch (err) {
      console.error('Backup was created but its audit log entry could not be saved:', err);
      snapshot.audit_log_warning = 'Backup succeeded, but the audit log entry could not be saved.';
    }

    return snapshot;
  },

  getBackupHistory() {
    try {
      const saved = localStorage.getItem('viotrack_backup_snapshots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  deleteBackupSnapshot(snapshotId) {
    try {
      const current = this.getBackupHistory();
      const filtered = current.filter(b => b.id !== snapshotId);
      localStorage.setItem('viotrack_backup_snapshots', JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  async restoreDatabase(snapshotPayload) {
    validateBackupPayload(snapshotPayload);

    const result = await apiPost('/database/restore', snapshotPayload);
    const { data, backup_id, created_at } = snapshotPayload;

    // Update browser-side fallbacks only after the database transaction succeeds.
    const localCollections = {
      students: data.students,
      violations: data.violations,
      records: data.records,
      teachers: data.teachers,
      advisers: data.advisers,
      admins: data.admins,
      activity_logs: data.activity_logs,
      school_events: data.school_events,
      locations: data.locations,
      meetings: data.meetings,
      sms_logs: data.sms_logs
    };
    Object.entries(localCollections).forEach(([key, rows]) => {
      if (Array.isArray(rows)) setStored(key, rows);
    });

    // Clear memory caches so fresh data is loaded
    invalidateCache();

    // Log the restore event into audit logs
    let auditLogWarning;
    try {
      await this.addActivityLog(
        'Database Restored',
        `Restored database from snapshot ${backup_id || 'manual upload'} created on ${new Date(created_at || Date.now()).toLocaleDateString()}`
      );
    } catch (err) {
      console.error('Database restore succeeded but its audit log entry could not be saved:', err);
      auditLogWarning = 'Database restore succeeded, but the audit log entry could not be saved.';
    }

    // Notify all listeners
    window.dispatchEvent(new CustomEvent('viotrack_data_updated'));
    return auditLogWarning ? { ...result, audit_log_warning: auditLogWarning } : result;
  },

  getBackupScheduleSettings() {
    try {
      const saved = localStorage.getItem('viotrack_backup_schedule');
      return saved ? JSON.parse(saved) : {
        auto_backup_enabled: true,
        frequency: 'daily', // 'daily' | 'weekly'
        time: '00:00',
        last_run: new Date(Date.now() - 86400000).toISOString()
      };
    } catch {
      return { auto_backup_enabled: true, frequency: 'daily', time: '00:00', last_run: null };
    }
  },

  saveBackupScheduleSettings(settings) {
    try {
      localStorage.setItem('viotrack_backup_schedule', JSON.stringify(settings));
      return true;
    } catch {
      return false;
    }
  },

  async checkAndRunScheduledBackup() {
    try {
      if (this.getCurrentUser().role !== 'admin') return false;
      const settings = this.getBackupScheduleSettings();
      if (!settings.auto_backup_enabled) return false;

      const now = Date.now();
      const lastRun = settings.last_run ? new Date(settings.last_run).getTime() : 0;
      const intervalMs = settings.frequency === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

      if (now - lastRun >= intervalMs) {
        console.log('[AutoBackup] Triggering scheduled database snapshot...');
        await this.createDatabaseBackup(`scheduled_${settings.frequency || 'daily'}`);
        settings.last_run = new Date(now).toISOString();
        this.saveBackupScheduleSettings(settings);
        return true;
      }
    } catch (err) {
      console.warn('[AutoBackup] Background check error:', err);
    }
    return false;
  },

  // --- DATA RESET & SYNC UTILITIES ---
  resetRecordsToDefault() {
    try {
      localStorage.removeItem('viotrack_records');
      invalidateCache('records');
      window.dispatchEvent(new CustomEvent('viotrack_data_updated'));
      return true;
    } catch {
      return false;
    }
  },

  resetAllData() {
    try {
      [
        'students',
        'violations',
        'records',
        'teachers',
        'advisers',
        'admins',
        'activity_logs',
        'school_events'
      ].forEach(k => localStorage.removeItem(`viotrack_${k}`));
      invalidateCache();
      window.dispatchEvent(new CustomEvent('viotrack_data_updated'));
      return true;
    } catch {
      return false;
    }
  }
};
