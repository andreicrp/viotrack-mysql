import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { dataService } from '../../services/dataService';
import { useNotification } from '../../context/NotificationContext';
import { UserPlus, ShieldCheck, Camera, Trash2 } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';
import { SectionSelect } from '../common/SectionSelect';
import { StudentInitialsAvatar } from './StudentInitialsAvatar';
import { validateUploadedFile } from '../../utils/security';
import { getStudentPhoto } from '../../utils/studentPhoto';
import '../../css/addstudent-modal.css';

const isJHSGrade = (gradeStr) => {
  const num = parseInt((gradeStr || '').replace(/\D/g, ''), 10);
  return num >= 7 && num <= 10;
};

const TRACK_OPTIONS = [
  { value: 'Academic Track', label: 'Academic Track' },
  { value: 'Technical-Vocational-Livelihood (TVL)', label: 'Technical-Vocational-Livelihood (TVL)' },
  { value: 'Sports Track', label: 'Sports Track' },
  { value: 'Arts & Design Track', label: 'Arts & Design Track' }
];

const STRAND_OPTIONS = [
  { value: 'STEM', label: 'STEM - Science, Tech, Engineering & Math' },
  { value: 'ABM', label: 'ABM - Accountancy, Business & Management' },
  { value: 'HUMSS', label: 'HUMSS - Humanities & Social Sciences' },
  { value: 'GAS', label: 'GAS - General Academic Strand' },
  { value: 'TVL - ICT', label: 'TVL - ICT (Computer Systems / Programming)' },
  { value: 'TVL - HE', label: 'TVL - Home Economics (Cookery / Tourism)' },
  { value: 'TVL - IA', label: 'TVL - Industrial Arts (SMAW / Automotive)' },
  { value: 'TVL - AFA', label: 'TVL - Agri-Fishery Arts' },
  { value: 'Sports', label: 'Sports Track' },
  { value: 'Arts & Design', label: 'Arts & Design Track' }
];

export const AddStudentModal = ({ isOpen, onClose, studentToEdit = null, onSaved }) => {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [failedPreviewImage, setFailedPreviewImage] = useState('');

  const [formData, setFormData] = useState({
    student_id: '',
    fname: '',
    mname: '',
    lname: '',
    email: '',
    grade: 'Grade 10',
    track: 'JHS',
    strand: 'JHS',
    section: 'Rizal',
    academicyear: '2025-2026',
    gender: 'Male',
    contact: '',
    parent_name: '',
    parent_contact: '',
    address: '',
    image: '',
  });

  const [existingStudents, setExistingStudents] = useState([]);
  const [existingAdvisers, setExistingAdvisers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      dataService.getStudents().then(res => setExistingStudents(res || [])).catch(() => {});
      dataService.getAdvisers().then(res => setExistingAdvisers(res || [])).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (studentToEdit) {
      const g = studentToEdit.grade || 'Grade 10';
      const isJHS = isJHSGrade(g);
      setFormData({
        student_id: String(studentToEdit.student_id || ''),
        fname: studentToEdit.fname || '',
        mname: studentToEdit.mname || '',
        lname: studentToEdit.lname || '',
        email: studentToEdit.email || '',
        grade: g,
        track: isJHS ? 'JHS' : (studentToEdit.track || 'Academic Track'),
        strand: isJHS ? 'JHS' : (studentToEdit.strand || 'STEM'),
        section: studentToEdit.section || 'Rizal',
        academicyear: studentToEdit.academicyear || studentToEdit.academic_year || '2025-2026',
        gender: studentToEdit.gender || 'Male',
        contact: studentToEdit.contact || '',
        parent_name: studentToEdit.parent_name || '',
        parent_contact: studentToEdit.parent_contact || '',
        address: studentToEdit.address || '',
        image: studentToEdit.image || ''
      });
    } else {
      setFormData({
        student_id: '',
        fname: '',
        mname: '',
        lname: '',
        email: '',
        grade: 'Grade 10',
        track: 'JHS',
        strand: 'JHS',
        section: 'Rizal',
        academicyear: '2025-2026',
        gender: 'Male',
        contact: '',
        parent_name: '',
        parent_contact: '',
        address: '',
        image: ''
      });
    }
    setSelectedImageFile(null);
    setFailedPreviewImage('');
  }, [studentToEdit, isOpen]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validation = validateUploadedFile(file, { isImageOnly: true });
    if (!validation.valid) {
      error(validation.error);
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      error('Student photos must be 4 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        error('Unable to preview the selected image.');
        return;
      }
      setSelectedImageFile(file);
      setFormData(prev => ({ ...prev, image: reader.result }));
      setFailedPreviewImage('');
    };
    reader.onerror = () => error('Unable to read the selected image.');
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setFormData(prev => ({ ...prev, image: '' }));
    setFailedPreviewImage('');
  };

  const handleGradeChange = (newGrade) => {
    const isJHS = isJHSGrade(newGrade);
    setFormData(prev => ({
      ...prev,
      grade: newGrade,
      track: isJHS ? 'JHS' : (prev.track === 'JHS' || !prev.track ? 'Academic Track' : prev.track),
      strand: isJHS ? 'JHS' : (prev.strand === 'JHS' || !prev.strand ? 'STEM' : prev.strand)
    }));
  };

  const handleTrackChange = (newTrack) => {
    let defaultStrand = formData.strand;
    if (newTrack.includes('TVL')) {
      if (!formData.strand || !formData.strand.startsWith('TVL')) defaultStrand = 'TVL - ICT';
    } else if (newTrack.includes('Sports')) {
      defaultStrand = 'Sports';
    } else if (newTrack.includes('Arts')) {
      defaultStrand = 'Arts & Design';
    } else {
      if (formData.strand?.startsWith('TVL') || formData.strand === 'Sports' || formData.strand === 'Arts & Design' || formData.strand === 'JHS') {
        defaultStrand = 'STEM';
      }
    }
    setFormData(prev => ({ ...prev, track: newTrack, strand: defaultStrand }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedStudentId = String(formData.student_id || '').trim();
    const trimmedFname = String(formData.fname || '').trim();
    const trimmedLname = String(formData.lname || '').trim();

    if (!trimmedStudentId || !trimmedFname || !trimmedLname) {
      error('Please complete all required fields (Student ID, First Name, Last Name).');
      return;
    }

    const isDuplicate = existingStudents.some(s => {
      const isCurrentStudent = studentToEdit && (
        (studentToEdit.id !== undefined && studentToEdit.id !== null && String(s.id) === String(studentToEdit.id)) ||
        String(s.student_id || '').trim().toLowerCase() === String(studentToEdit.student_id || '').trim().toLowerCase()
      );
      return !isCurrentStudent && String(s.student_id || '').trim().toLowerCase() === trimmedStudentId.toLowerCase();
    });
    if (isDuplicate) {
      error(`Student ID "${trimmedStudentId}" is already registered in the system. Please use a unique Student ID.`);
      return;
    }

    setLoading(true);
    try {
      if (studentToEdit) {
        const studentId = !studentToEdit._localOnly && studentToEdit.id !== undefined && studentToEdit.id !== null
          ? studentToEdit.id
          : studentToEdit.student_id;

        const studentPayload = {
          ...formData,
          student_id: trimmedStudentId,
          fname: trimmedFname,
          lname: trimmedLname,
          image: selectedImageFile ? await dataService.uploadPhoto(selectedImageFile) : formData.image
        };
        const updated = studentToEdit._localOnly
          ? await dataService.addStudent(studentPayload)
          : await dataService.updateStudent(studentId, studentPayload);
        success(`Student ${trimmedFname} ${trimmedLname} updated successfully!`);
        onSaved?.(updated);
      } else {
        const created = await dataService.addStudent({
          ...formData,
          student_id: trimmedStudentId,
          fname: trimmedFname,
          lname: trimmedLname,
          image: ''
        });
        success(`Student ${trimmedFname} ${trimmedLname} registered successfully!`);
        onSaved?.(created);
      }
      onClose();
    } catch (err) {
      error('Failed to save student: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'Edit Student Details' : 'Register New Student'}
      icon={UserPlus}
      maxWidth="780px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div className="smooth-scroll-container modal-body" style={{ padding: '20px 24px', flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Live Student Preview Card */}
          <div
            style={{
              background: 'var(--bg-surface-elevated, #f8fafc)',
              border: '1.5px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '14px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '220px' }}>
              {getStudentPhoto(formData.image) && failedPreviewImage !== formData.image ? (
                <img
                  src={formData.image}
                  alt={`${formData.fname} ${formData.lname}`}
                  onError={() => setFailedPreviewImage(formData.image)}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--brand-blue, #0f172a)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                    flexShrink: 0
                  }}
                />
              ) : (
                <StudentInitialsAvatar
                  student={formData}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    border: '2px solid var(--brand-blue, #0f172a)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                    fontSize: '18px'
                  }}
                />
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {formData.fname || formData.lname ? `${formData.fname} ${formData.mname ? formData.mname[0] + '. ' : ''}${formData.lname}` : 'Student Name Preview'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Student ID: <strong style={{ color: 'var(--brand-blue, #0f172a)' }}>{formData.student_id || 'Pending'}</strong></span>
                  <span>•</span>
                  <span>{formData.grade} – {formData.section || 'Section'}</span>
                  <span>•</span>
                  <span>{isJHSGrade(formData.grade) ? 'JHS' : (formData.strand || 'SHS')}</span>
                  <span>•</span>
                  <span>SY {formData.academicyear}</span>
                </div>
                {studentToEdit && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    <label
                      htmlFor="student-photo-upload"
                      className="btn btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      <Camera size={14} />
                      {formData.image ? 'Change Photo' : 'Add Photo'}
                      <input
                        id="student-photo-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        disabled={loading}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {formData.image && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleRemoveImage}
                        disabled={loading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px', fontSize: '12px' }}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    )}
                    <span style={{ alignSelf: 'center', fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                      JPG, PNG, or WebP up to 4 MB
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Section 1: Identification & Academic Placement */}
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f172a' }} />
              1. Academic Placement
            </div>
            
            {/* Row 1: Student ID, Grade Level, Class Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  Student ID <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  placeholder="e.g. 109283746101"
                  maxLength={16}
                  required
                  style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  Grade Level <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <CustomSelect
                  value={formData.grade}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  options={[
                    { value: 'Grade 7', label: 'Grade 7' },
                    { value: 'Grade 8', label: 'Grade 8' },
                    { value: 'Grade 9', label: 'Grade 9' },
                    { value: 'Grade 10', label: 'Grade 10' },
                    { value: 'Grade 11', label: 'Grade 11' },
                    { value: 'Grade 12', label: 'Grade 12' },
                  ]}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  Class Section <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <SectionSelect
                  grade={formData.grade}
                  value={formData.section}
                  onChange={(val) => setFormData(prev => ({ ...prev, section: val }))}
                  students={existingStudents}
                  advisers={existingAdvisers}
                  placeholder="Select or type section name..."
                  required
                />
              </div>
            </div>

            {/* Row 2: Academic Track & Academic Strand */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Academic Track <span style={{ color: '#ef4444' }}>*</span></span>
                  {isJHSGrade(formData.grade) && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#0369a1', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                      Auto (JHS)
                    </span>
                  )}
                </label>
                {isJHSGrade(formData.grade) ? (
                  <input
                    type="text"
                    className="form-control"
                    value="JHS"
                    disabled
                    readOnly
                    style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box', background: '#f8fafc', color: '#475569', fontWeight: 700, cursor: 'not-allowed' }}
                  />
                ) : (
                  <CustomSelect
                    value={formData.track}
                    onChange={(e) => handleTrackChange(e.target.value)}
                    options={TRACK_OPTIONS}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Academic Strand <span style={{ color: '#ef4444' }}>*</span></span>
                  {isJHSGrade(formData.grade) && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#0369a1', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                      Auto (JHS)
                    </span>
                  )}
                </label>
                {isJHSGrade(formData.grade) ? (
                  <input
                    type="text"
                    className="form-control"
                    value="JHS"
                    disabled
                    readOnly
                    style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box', background: '#f8fafc', color: '#475569', fontWeight: 700, cursor: 'not-allowed' }}
                  />
                ) : (
                  <CustomSelect
                    value={formData.strand}
                    onChange={(e) => setFormData(prev => ({ ...prev, strand: e.target.value }))}
                    options={STRAND_OPTIONS}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Personal Information */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f172a' }} />
              2. Personal Details
            </div>
            
            {/* Row 1: Name Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  First Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fname}
                  onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                  placeholder="First name"
                  required
                  style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  Middle Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.mname}
                  onChange={(e) => setFormData({ ...formData, mname: e.target.value })}
                  placeholder="Middle name (optional)"
                  style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  Last Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.lname}
                  onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                  placeholder="Last name"
                  required
                  style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Row 2: Demographics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  Student Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@example.com"
                  style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  Gender
                </label>
                <CustomSelect
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  Student Contact Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="e.g. 09151234567"
                  style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  School Year
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.academicyear}
                  onChange={(e) => setFormData({ ...formData, academicyear: e.target.value })}
                  placeholder="2025-2026"
                  style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Guardian Details & Residential Address */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f172a' }} />
                3. Guardian & Contact Info
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '10px' }}>
                SMS Gateway Sync
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  Parent / Guardian Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  placeholder="e.g. Maria Santos"
                  style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                  Guardian Mobile Number (SMS Alerts)
                </label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.parent_contact}
                  onChange={(e) => setFormData({ ...formData, parent_contact: e.target.value })}
                  placeholder="e.g. 09156867789"
                  style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', display: 'block' }}>
                Home Residential Address
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House #, Street, Barangay, City / Municipality"
                style={{ height: '40px', borderRadius: '9px', border: '1.5px solid #cbd5e1', padding: '0 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

          </div>
        </div>

        {/* Data Privacy & DepEd Consent Notice */}
        <div
          className="add-student-privacy-consent"
          style={{
            padding: '10px 24px',
            background: 'var(--bg-surface-elevated, #f8fafc)',
            borderTop: '1px solid var(--border-subtle, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '11.5px',
            color: 'var(--text-muted, #475569)',
            lineHeight: 1.45
          }}
        >
          <div
            className="add-student-privacy-icon"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={14} color="#34d399" strokeWidth={2.5} />
          </div>
          <div className="add-student-privacy-copy" style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>Data Privacy Consent (RA 10173): </span>
            <span>By registering this student record, you certify that personal and contact details are collected strictly for legitimate academic administration, emergency guardian dispatch, and DepEd conduct records.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="add-modal-footer modal-footer" style={{ flexShrink: 0, padding: '14px 24px', borderTop: '1px solid var(--border-subtle, #e2e8f0)', background: 'var(--bg-surface, #f8fafc)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary modal-btn-secondary"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '9px 18px',
              borderRadius: '9px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary modal-btn-primary"
            disabled={loading}
            style={{
              padding: '9px 22px',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <UserPlus size={15} />
            {loading ? 'Saving Student...' : studentToEdit ? 'Save Changes' : 'Register Student'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
