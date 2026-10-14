import React, { useState, useEffect } from 'react';
import { GraduationCap, X, Save, Eye, EyeOff, Camera, Trash2 } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';
import { StudentInitialsAvatar } from '../students/StudentInitialsAvatar';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/scrollLock';
import { dataService } from '../../services/dataService';
import { useNotification } from '../../context/NotificationContext';
import { validateUploadedFile } from '../../utils/security';
import { getStudentPhoto } from '../../utils/studentPhoto';

export const EditTeacherModal = ({ isOpen, onClose, teacher, onSaved }) => {
  const { error } = useNotification();
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [failedPreviewImage, setFailedPreviewImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fname: '',
    mname: '',
    lname: '',
    email: '',
    position: 'Teacher',
    department: 'Junior High Faculty',
    specialization: '',
    contact: '',
    gender: 'Male',
    image: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      return () => unlockBodyScroll();
    }
  }, [isOpen]);

  useEffect(() => {
    if (teacher) {
      setFormData({
        fname: teacher.fname || '',
        mname: teacher.mname || '',
        lname: teacher.lname || '',
        email: teacher.email || '',
        position: teacher.position || 'Teacher I',
        department: teacher.department || 'Junior High Faculty',
        specialization: teacher.specialization || '',
        contact: teacher.contact || '',
        gender: teacher.gender || 'Male',
        image: teacher.image || '',
        password: ''
      });
    } else {
      setFormData({
        fname: '',
        mname: '',
        lname: '',
        email: '',
        position: 'Teacher I',
        department: 'Junior High Faculty',
        specialization: '',
        contact: '',
        gender: 'Male',
        image: '',
        password: ''
      });
    }
    setSelectedImageFile(null);
    setFailedPreviewImage('');
  }, [teacher, isOpen]);

  if (!isOpen) return null;

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
      error('Profile photos must be 4 MB or smaller.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fname.trim() || !formData.lname.trim() || !formData.email.trim()) {
      return;
    }
    setSaving(true);
    try {
      const image = selectedImageFile
        ? await dataService.uploadPhoto(selectedImageFile)
        : formData.image;
      await onSaved?.({ ...teacher, ...formData, image });
    } catch (uploadError) {
      error(`Failed to save profile photo: ${uploadError.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: '20px',
        willChange: 'opacity'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--bg-surface, #ffffff)',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInUp 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
            background: 'var(--bg-surface, #ffffff)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--brand-blue, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.3px' }}>
                {teacher ? 'Edit Faculty Teacher' : 'Add New Faculty Teacher'}
              </h3>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted, #64748b)' }}>
                Teacher credentials, department & advisory profile
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, transparent)',
              background: 'var(--bg-surface-elevated, #f1f5f9)',
              color: 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div 
            className="smooth-scroll-container"
            style={{ 
              padding: '22px 24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              maxHeight: '70vh', 
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            
            {/* Initials Preview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-surface-elevated, #f8fafc)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {getStudentPhoto(formData.image) && failedPreviewImage !== formData.image ? (
                  <img
                    src={formData.image}
                    alt={`${formData.fname} ${formData.lname}`}
                    onError={() => setFailedPreviewImage(formData.image)}
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0', flexShrink: 0 }}
                  />
                ) : (
                  <StudentInitialsAvatar
                    student={formData}
                    style={{
                      width: 48,
                      height: 48,
                      border: '2px solid #e2e8f0',
                      flexShrink: 0
                    }}
                  />
                )}
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                    {formData.fname ? `${formData.fname} ${formData.lname}` : 'Faculty initials'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)' }}>
                    {formData.image ? 'Profile photo preview' : 'Initials are shown without a photo'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <label
                      htmlFor="teacher-photo-upload"
                      className="btn btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '12px' }}
                    >
                      <Camera size={14} />
                      {formData.image ? 'Change Photo' : 'Add Photo'}
                      <input
                        id="teacher-photo-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        disabled={saving}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {formData.image && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleRemoveImage}
                        disabled={saving}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px', fontSize: '12px' }}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>JPG, PNG, or WebP up to 4 MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* First & Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #334155)', display: 'block', marginBottom: '6px' }}>
                  First Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan"
                  value={formData.fname}
                  onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1.5px solid var(--border-subtle, #cbd5e1)',
                    fontSize: '13.5px',
                    outline: 'none',
                    background: 'var(--bg-input, #ffffff)',
                    color: 'var(--text-primary, #0f172a)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #334155)', display: 'block', marginBottom: '6px' }}>
                  Middle Name
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={formData.mname}
                  onChange={(e) => setFormData({ ...formData, mname: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1.5px solid var(--border-subtle, #cbd5e1)',
                    fontSize: '13.5px',
                    outline: 'none',
                    background: 'var(--bg-input, #ffffff)',
                    color: 'var(--text-primary, #0f172a)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #334155)', display: 'block', marginBottom: '6px' }}>
                  Last Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dela Cruz"
                  value={formData.lname}
                  onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1.5px solid var(--border-subtle, #cbd5e1)',
                    fontSize: '13.5px',
                    outline: 'none',
                    background: 'var(--bg-input, #ffffff)',
                    color: 'var(--text-primary, #0f172a)'
                  }}
                />
              </div>
            </div>

            {/* Email & Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #334155)', display: 'block', marginBottom: '6px' }}>
                  Institutional Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="juan.delacruz@phcmanila.edu.ph"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1.5px solid var(--border-subtle, #cbd5e1)',
                    fontSize: '13.5px',
                    outline: 'none',
                    background: 'var(--bg-input, #ffffff)',
                    color: 'var(--text-primary, #0f172a)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #334155)', display: 'block', marginBottom: '6px' }}>
                  Contact Number
                </label>
                <input
                  type="text"
                  placeholder="09171234567"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1.5px solid var(--border-subtle, #cbd5e1)',
                    fontSize: '13.5px',
                    outline: 'none',
                    background: 'var(--bg-input, #ffffff)',
                    color: 'var(--text-primary, #0f172a)'
                  }}
                />
              </div>
            </div>

            {/* Academic Position & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #334155)', display: 'block', marginBottom: '6px' }}>
                  Academic Position
                </label>
                <CustomSelect
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  options={[
                    { value: 'Teacher I', label: 'Teacher I' },
                    { value: 'Teacher II', label: 'Teacher II' },
                    { value: 'Teacher III', label: 'Teacher III' },
                    { value: 'Master Teacher I', label: 'Master Teacher I' },
                    { value: 'Master Teacher II', label: 'Master Teacher II' },
                    { value: 'Department Head', label: 'Department Head' },
                  ]}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #334155)', display: 'block', marginBottom: '6px' }}>
                  Department
                </label>
                <CustomSelect
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  options={[
                    { value: 'Junior High Faculty', label: 'Junior High Faculty' },
                    { value: 'Senior High Faculty', label: 'Senior High Faculty' },
                    { value: 'Science Department', label: 'Science Department' },
                    { value: 'Mathematics Department', label: 'Mathematics Department' },
                    { value: 'English Department', label: 'English Department' },
                    { value: 'Filipino Department', label: 'Filipino Department' },
                    { value: 'MAPEH Department', label: 'MAPEH Department' },
                  ]}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #334155)', display: 'block', marginBottom: '6px' }}>
                  Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Biology"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1.5px solid var(--border-subtle, #cbd5e1)',
                    fontSize: '13.5px',
                    outline: 'none',
                    background: 'var(--bg-input, #ffffff)',
                    color: 'var(--text-primary, #0f172a)'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #334155)', display: 'block', marginBottom: '6px' }}>
                  Gender
                </label>
                <CustomSelect
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' }
                  ]}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #334155)', display: 'block', marginBottom: '6px' }}>
                {teacher ? 'New Password (leave empty to keep current)' : 'Teacher Portal Password *'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!teacher}
                  placeholder={teacher ? '••••••••' : 'Enter portal access password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 38px 9px 12px',
                    borderRadius: '9px',
                    border: '1.5px solid var(--border-subtle, #cbd5e1)',
                    fontSize: '13.5px',
                    outline: 'none',
                    background: 'var(--bg-input, #ffffff)',
                    color: 'var(--text-primary, #0f172a)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle, #f1f5f9)',
              background: 'var(--bg-surface-elevated, #f8fafc)'
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>
              <span style={{ color: '#ef4444' }}>*</span> Mandatory fields
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                style={{
                  padding: '9px 18px',
                  borderRadius: '9px',
                  background: 'var(--bg-surface, #ffffff)',
                  border: '1.5px solid var(--border-subtle, #cbd5e1)',
                  color: 'var(--text-secondary, #475569)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="teacher-modal-submit-btn"
                style={{
                  padding: '9px 22px',
                  borderRadius: '9px',
                  background: 'var(--brand-blue, #0f172a)',
                  color: 'var(--brand-btn-text, #ffffff)',
                  border: '1px solid var(--brand-blue, #0f172a)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)'
                }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : teacher ? 'Save Changes' : 'Add Teacher'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
