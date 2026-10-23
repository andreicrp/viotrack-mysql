import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { AddStudentModal } from '../components/students/AddStudentModal';
import { StudentQrModal } from '../components/students/StudentQrModal';
import { BulkImportModal } from '../components/students/BulkImportModal';
import { ViewStudentModal } from '../components/students/ViewStudentModal';
import { CustomSelect } from '../components/common/CustomSelect';
import { CompactPagination } from '../components/common/CompactPagination';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Users,
  Search,
  UserPlus,
  FileText,
  Download,
  Plus,
  Trash2,
  Edit3,
  Eye,
  QrCode,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  School,
  Layers,
  BookOpen,
  Filter,
  CheckCircle2,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { getJsPDF } from '../utils/pdfHelper';
import { exportToCsv } from '../utils/csvHelper';
import { SaveAsModal } from '../components/common/SaveAsModal';
import { ImportFormatDropdown } from '../components/common/ImportFormatDropdown';
import { StudentInitialsAvatar } from '../components/students/StudentInitialsAvatar';

import { ViewModeToggle } from '../components/common/ViewModeToggle';
import { SkeletonTable, SkeletonCardGrid } from '../components/common/SkeletonLoader';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

// Helper to detect Strand / Academic Track
export const getStudentStrand = (student) => {
  if (student.strand) return student.strand;
  const sec = (student.section || '').toUpperCase();
  if (sec.includes('STEM')) return 'STEM';
  if (sec.includes('HUMSS')) return 'HUMSS';
  if (sec.includes('ABM')) return 'ABM';
  if (sec.includes('GAS')) return 'GAS';
  if (sec.includes('TVL')) return 'TVL';
  if (sec.includes('ICT')) return 'ICT';
  if (sec.includes('HE')) return 'HE';

  const gNum = parseInt((student.grade || '').replace(/\D/g, ''), 10);
  if (gNum >= 11) return 'Academic Track';
  return 'JHS Core';
};

export const getGradeNumber = (gradeStr) => {
  const num = parseInt((gradeStr || '').replace(/\D/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

export const StudentsPage = () => {
  const { user } = useAuth();
  const { success, error, undo } = useNotification();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [saveAsModalOpen, setSaveAsModalOpen] = useState(false);
  const [saveAsConfig, setSaveAsConfig] = useState({
    defaultFilename: 'Viotrack_Students',
    defaultFormat: 'csv',
    availableFormats: ['csv', 'xlsx', 'pdf'],
    headers: [],
    rows: [],
    generatePdfBlob: null,
    title: 'Save Student Roster As'
  });

  // Keyboard navigation shortcuts
  useKeyboardShortcuts({
    onEscape: () => {
      setIsAddModalOpen(false);
      setIsBulkImportOpen(false);
      setStudentForId(null);
      setViewStudentData(null);
      setEditStudentData(null);
    }
  });

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [yearFilter, setYearFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'jhs' | 'shs'
  const [gradeFilter, setGradeFilter] = useState('all');
  const [strandFilter, setStrandFilter] = useState('all');

  // Sorting: 'grade' | 'strand' | 'name' | 'student_id' | 'section'
  const [sortField, setSortField] = useState('grade');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Pagination & Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentForQr, setStudentForQr] = useState(null);
  const [studentForViewModal, setStudentForViewModal] = useState(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportFormat, setBulkImportFormat] = useState('all'); // 'all' | 'pdf' | 'csv'

  const isAdmin = user?.role === 'admin';

  const loadStudents = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await dataService.getStudents(forceRefresh);
      setStudents(data || []);
    } catch (err) {
      error('Failed to load students: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadStudents();
    const handleDataUpdate = () => {
      loadStudents(true);
    };
    window.addEventListener('viotrack_data_updated', handleDataUpdate);
    return () => {
      window.removeEventListener('viotrack_data_updated', handleDataUpdate);
    };
  }, [loadStudents]);

  // Helper sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Statistics calculation - optimized single pass for 10,000+ students
  const stats = useMemo(() => {
    const total = students.length;
    let jhsCount = 0;
    let shsCount = 0;
    const strandSet = new Set();

    for (let i = 0; i < total; i++) {
      const s = students[i];
      const gNum = getGradeNumber(s.grade);
      if (gNum >= 7 && gNum <= 10) jhsCount++;
      else if (gNum >= 11 && gNum <= 12) shsCount++;
      strandSet.add(getStudentStrand(s));
    }

    return { total, jhsCount, shsCount, uniqueStrands: strandSet.size };
  }, [students]);

  // Dynamic School Year Options
  const schoolYearOptions = useMemo(() => {
    const yearsSet = new Set(['2026-2027', '2025-2026', '2024-2025']);
    (students || []).forEach(s => {
      const y = (s.academicyear || s.academic_year || s.school_year || '').trim();
      if (y) {
        const cleaned = y.replace(/^s\.?y\.?\s*/i, '').trim();
        if (cleaned) yearsSet.add(cleaned);
      }
    });
    const sorted = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
    return [
      { value: 'all', label: 'All School Years' },
      ...sorted.map(yr => ({ value: yr, label: `S.Y. ${yr}` }))
    ];
  }, [students]);

  // Filtered & Sorted Student List with deferred non-blocking search
  const filteredAndSortedStudents = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();
    const isAllLevel = levelFilter === 'all';
    const isAllGrade = gradeFilter === 'all';
    const isAllStrand = strandFilter === 'all';
    const isAllYear = yearFilter === 'all';
    const targetGrade = gradeFilter.toLowerCase();
    const targetStrand = strandFilter.toLowerCase();
    const targetYear = yearFilter.toLowerCase().replace(/[^0-9-]/g, '');

    // 1. Filter
    const result = students.filter(s => {
      const gNum = getGradeNumber(s.grade);
      const isJhs = gNum >= 7 && gNum <= 10;
      const isShs = gNum >= 11 && gNum <= 12;

      const matchesLevel =
        isAllLevel ||
        (levelFilter === 'jhs' && isJhs) ||
        (levelFilter === 'shs' && isShs);

      if (!matchesLevel) return false;

      const sGrade = (s.grade || '').toLowerCase();
      const matchesGrade = isAllGrade || sGrade === targetGrade;
      if (!matchesGrade) return false;

      const sYear = String(s.academicyear || s.academic_year || s.school_year || '2025-2026').trim();
      const sYearClean = sYear.toLowerCase().replace(/[^0-9-]/g, '');
      const matchesYear = isAllYear || sYearClean === targetYear || sYear.toLowerCase().includes(yearFilter.toLowerCase());
      if (!matchesYear) return false;

      const studentStrand = getStudentStrand(s);
      const matchesStrand = isAllStrand || studentStrand.toLowerCase() === targetStrand;
      if (!matchesStrand) return false;

      if (!query) return true;

      const fullName = `${s.fname || ''} ${s.mname || ''} ${s.lname || ''}`.toLowerCase();
      const studentId = (s.student_id || '').toLowerCase();
      const section = (s.section || '').toLowerCase();
      const guardian = (s.parent_name || '').toLowerCase();
      const strand = studentStrand.toLowerCase();

      return (
        fullName.includes(query) ||
        studentId.includes(query) ||
        sGrade.includes(query) ||
        section.includes(query) ||
        guardian.includes(query) ||
        strand.includes(query)
      );
    });

    // 2. Sort
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'grade') {
        const gA = getGradeNumber(a.grade);
        const gB = getGradeNumber(b.grade);
        comparison = gA - gB;
        if (comparison === 0) {
          comparison = (a.section || '').localeCompare(b.section || '');
        }
      } else if (sortField === 'strand') {
        const strandA = getStudentStrand(a);
        const strandB = getStudentStrand(b);
        comparison = strandA.localeCompare(strandB);
        if (comparison === 0) {
          comparison = getGradeNumber(a.grade) - getGradeNumber(b.grade);
        }
      } else if (sortField === 'name') {
        const nameA = `${a.lname || ''}, ${a.fname || ''}`.toLowerCase();
        const nameB = `${b.lname || ''}, ${b.fname || ''}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortField === 'student_id') {
        comparison = (a.student_id || '').localeCompare(b.student_id || '');
      } else if (sortField === 'section') {
        comparison = (a.section || '').localeCompare(b.section || '');
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, deferredSearch, levelFilter, gradeFilter, strandFilter, yearFilter, sortField, sortOrder]);

  // Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredAndSortedStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Delete Handlers
  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected student(s)?`)) {
      try {
        for (const id of selectedIds) {
          await dataService.deleteStudent(id);
        }
        success(`Successfully removed ${selectedIds.length} students.`);
        setSelectedIds([]);
        loadStudents();
      } catch (err) {
        error('Bulk delete failed: ' + err.message);
      }
    }
  };

  const handleDeleteSingle = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove student: ${name}?`)) {
      try {
        await dataService.deleteStudent(id);
        success('Student removed from system.');
        loadStudents();
      } catch (err) {
        error('Delete failed: ' + err.message);
      }
    }
  };

  // Save As Export Handler
  const handleOpenExportSaveAs = (defaultFormat = 'csv') => {
    const headers = ['Student ID', 'First Name', 'Middle Name', 'Last Name', 'Email', 'Grade', 'Section', 'Course/Strand', 'Track', 'Academic Year', 'Gender', 'Contact', 'Parent Name', 'Parent Contact', 'Address'];
    const rows = filteredAndSortedStudents.map(s => [
      s.student_id,
      s.fname,
      s.mname || '',
      s.lname,
      s.email || '',
      s.grade,
      s.section,
      s.strand || s.course || '',
      s.track || '',
      s.academicyear || s.academic_year || '',
      s.gender || '',
      s.contact || '',
      s.parent_name || '',
      s.parent_contact || '',
      s.address || ''
    ]);

    const generatePdfBlob = async () => {
      const doc = await getJsPDF();
      doc.setFontSize(16);
      doc.setTextColor(39, 54, 127);
      doc.text('VIOTRACK - OFFICIAL STUDENT ROSTER', 14, 16);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Sorted by: ${sortField.toUpperCase()} (${sortOrder.toUpperCase()}) | Total Students: ${filteredAndSortedStudents.length} | Generated: ${new Date().toLocaleDateString()}`, 14, 23);

      const tableData = filteredAndSortedStudents.map((s, idx) => [
        idx + 1,
        s.student_id,
        `${s.lname}, ${s.fname}`,
        s.grade,
        s.section,
        s.strand || s.course || '',
        s.track || '',
        s.academicyear || s.academic_year || '',
        s.gender || 'N/A',
        s.parent_name || 'N/A'
      ]);

      doc.autoTable({
        head: [['#', 'Student ID', 'Student Name', 'Grade', 'Section', 'Course / Strand', 'Track', 'Academic Year', 'Gender', 'Guardian']],
        body: tableData,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [39, 54, 127], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 7 }
      });

      return doc.output('blob');
    };

    setSaveAsConfig({
      defaultFilename: `Viotrack_Students_${new Date().toISOString().slice(0, 10)}`,
      defaultFormat,
      availableFormats: ['csv', 'xlsx', 'pdf'],
      headers,
      rows,
      generatePdfBlob,
      title: 'Save Student Roster As'
    });
    setSaveAsModalOpen(true);
  };

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedStudents.length / entriesPerPage) || 1;
  const paginatedStudents = filteredAndSortedStudents.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} className="table-sort-icon is-inactive" color="currentColor" style={{ marginLeft: 4, color: 'var(--text-muted, #94a3b8)' }} />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={13} className="table-sort-icon is-active" color="currentColor" style={{ marginLeft: 4, color: 'var(--brand-blue, #07345f)' }} />
    ) : (
      <ArrowDown size={13} className="table-sort-icon is-active" color="currentColor" style={{ marginLeft: 4, color: 'var(--brand-blue, #07345f)' }} />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Banner & Primary Actions */}
      <div className="page-banner-header">
        <div className="page-banner-info">
          <Users size={26} strokeWidth={2.4} style={{ flexShrink: 0, color: 'var(--brand-blue, #07345f)' }} />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.02em' }}>
              Student Directory
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: 'var(--text-muted, #64748b)' }}>
              View and manage student records, grades, levels, and academic strand information.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="page-banner-actions">
          {isAdmin && (
            <button
              onClick={() => {
                setStudentToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="page-banner-primary-btn"
            >
              <Plus size={16} strokeWidth={2.5} /> Add Student
            </button>
          )}

          <div className="page-banner-secondary-group">
            <button
              onClick={() => handleOpenExportSaveAs('csv')}
              className="page-banner-btn-secondary"
              title="Export student roster as CSV, Excel, or PDF"
            >
              <Download size={14} strokeWidth={2.2} /> Export
            </button>

            {isAdmin && (
              <ImportFormatDropdown
                title="Choose a format to import students"
                onSelect={(format) => {
                  setBulkImportFormat(format);
                  setIsBulkImportOpen(true);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && isAdmin && (
        <div className="bulk-selection-bar">
          <div className="bulk-selection-count">{selectedIds.length} student(s) selected</div>
          <div className="bulk-selection-actions">
            <button type="button" onClick={handleDeleteSelected} className="bulk-selection-danger">
              <Trash2 size={14} /> Delete Selected
            </button>
            <button type="button" onClick={() => setSelectedIds([])} className="bulk-selection-neutral">
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Grade & Level Analytics Metric Cards */}
      <div
        className="metric-cards-grid student-analytics-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}
      >
        {/* Total Students */}
        <div
          className="student-analytics-card"
          onClick={() => { setLevelFilter('all'); setGradeFilter('all'); setStrandFilter('all'); }}
          style={{
            background: 'var(--bg-surface, #ffffff)',
            borderRadius: '12px',
            padding: '14px 16px',
            border: levelFilter === 'all' && gradeFilter === 'all' && strandFilter === 'all' ? '2px solid var(--brand-blue, #07345f)' : '1.5px solid var(--border-subtle, #cbd5e1)',
            boxShadow: levelFilter === 'all' && gradeFilter === 'all' && strandFilter === 'all' ? '0 4px 14px rgba(7, 52, 95, 0.10)' : '0 1px 3px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="student-analytics-copy">
              <div className="student-analytics-label" style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--brand-blue, #07345f)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                TOTAL STUDENTS
              </div>
              <div className="student-analytics-value" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: '4px 0 2px 0', lineHeight: 1.1 }}>
                {stats.total}
              </div>
              <div className="student-analytics-description" style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>
                Across all levels & strands
              </div>
            </div>
            <Users size={20} color="var(--brand-blue, #07345f)" strokeWidth={2} />
          </div>
        </div>

        {/* Junior High (G7-10) */}
        <div
          className="student-analytics-card"
          onClick={() => { setLevelFilter('jhs'); setGradeFilter('all'); setStrandFilter('all'); }}
          style={{
            background: 'var(--bg-surface, #ffffff)',
            borderRadius: '12px',
            padding: '14px 16px',
            border: levelFilter === 'jhs' ? '2px solid var(--brand-blue, #07345f)' : '1.5px solid var(--border-subtle, #cbd5e1)',
            boxShadow: levelFilter === 'jhs' ? '0 4px 14px rgba(7, 52, 95, 0.10)' : '0 1px 3px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="student-analytics-copy">
              <div className="student-analytics-label" style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--brand-blue, #07345f)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                JUNIOR HIGH (G7-10)
              </div>
              <div className="student-analytics-value" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: '4px 0 2px 0', lineHeight: 1.1 }}>
                {stats.jhsCount}
              </div>
              <div className="student-analytics-description" style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>
                Basic education students
              </div>
            </div>
            <BookOpen size={20} color="var(--brand-blue, #07345f)" strokeWidth={2} />
          </div>
        </div>

        {/* Senior High (G11-12) */}
        <div
          className="student-analytics-card"
          onClick={() => { setLevelFilter('shs'); setGradeFilter('all'); }}
          style={{
            background: 'var(--bg-surface, #ffffff)',
            borderRadius: '12px',
            padding: '14px 16px',
            border: levelFilter === 'shs' ? '2px solid var(--brand-blue, #07345f)' : '1.5px solid var(--border-subtle, #cbd5e1)',
            boxShadow: levelFilter === 'shs' ? '0 4px 14px rgba(7, 52, 95, 0.10)' : '0 1px 3px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="student-analytics-copy">
              <div className="student-analytics-label" style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--brand-blue, #07345f)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                SENIOR HIGH (G11-12)
              </div>
              <div className="student-analytics-value" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: '4px 0 2px 0', lineHeight: 1.1 }}>
                {stats.shsCount}
              </div>
              <div className="student-analytics-description" style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>
                Specialized strands & tracks
              </div>
            </div>
            <GraduationCap size={20} color="var(--brand-blue, #07345f)" strokeWidth={2} />
          </div>
        </div>

        {/* Active Academic Strands */}
        <div
          className="student-analytics-card"
          style={{
            background: 'var(--bg-surface, #ffffff)',
            borderRadius: '12px',
            padding: '14px 16px',
            border: '1.5px solid var(--border-subtle, #cbd5e1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="student-analytics-copy">
              <div className="student-analytics-label" style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--brand-blue, #07345f)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ACADEMIC STRANDS
              </div>
              <div className="student-analytics-value" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: '4px 0 2px 0', lineHeight: 1.1 }}>
                {stats.uniqueStrands}
              </div>
              <div className="student-analytics-description" style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>
                STEM, ABM, HUMSS, GAS, JHS
              </div>
            </div>
            <Layers size={20} color="var(--brand-blue, #07345f)" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Main Table Card with Integrated Search, Sort & Filters */}
      <div
        style={{
          background: 'var(--bg-surface, #ffffff)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        {/* Toolbar Controls */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '420px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted, #94a3b8)'
                }}
              />
              <input
                type="text"
                placeholder="Search by student name, Student ID, grade, strand, or section..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '9px 34px 9px 38px',
                  border: '1px solid var(--border-subtle, #cbd5e1)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'var(--text-primary, #0f172a)',
                  background: 'var(--bg-input, #f8fafc)',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand-blue, #07345f)'; e.currentTarget.style.background = 'var(--bg-surface, #ffffff)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle, #cbd5e1)'; e.currentTarget.style.background = 'var(--bg-input, #f8fafc)'; }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Sorting & Filter Selectors */}
            <div className="mobile-filter-grid students-mobile-filter-grid">
              {/* Sort By Selector */}
              <div className="mobile-filter-item">
                <CustomSelect
                  icon={ArrowUpDown}
                  value={`${sortField}-${sortOrder}`}
                  onChange={(e) => {
                    const [f, o] = e.target.value.split('-');
                    setSortField(f);
                    setSortOrder(o);
                  }}
                  options={[
                    { value: 'grade-asc', label: 'Grade: 7–12' },
                    { value: 'grade-desc', label: 'Grade: 12–7' },
                    { value: 'strand-asc', label: 'Strand (A → Z)' },
                    { value: 'strand-desc', label: 'Strand (Z → A)' },
                    { value: 'name-asc', label: 'Name (A → Z)' },
                    { value: 'name-desc', label: 'Name (Z → A)' },
                    { value: 'student_id-asc', label: 'Student ID' },
                    { value: 'section-asc', label: 'Section' }
                  ]}
                />
              </div>

              {/* School Year / Academic Batch Filter */}
              <div className="mobile-filter-item">
                <CustomSelect
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={schoolYearOptions}
                />
              </div>

              {/* Grade / Year Level Filter */}
              <div className="mobile-filter-item">
                <CustomSelect
                  value={gradeFilter}
                  onChange={(e) => {
                    setGradeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Year Levels' },
                    { value: 'Grade 7', label: 'Grade 7 (1st Year)' },
                    { value: 'Grade 8', label: 'Grade 8 (2nd Year)' },
                    { value: 'Grade 9', label: 'Grade 9 (3rd Year)' },
                    { value: 'Grade 10', label: 'Grade 10 (4th Year)' },
                    { value: 'Grade 11', label: 'Grade 11 (SHS Yr 1)' },
                    { value: 'Grade 12', label: 'Grade 12 (SHS Yr 2)' }
                  ]}
                />
              </div>

              {/* Strand Filter */}
              <div className="mobile-filter-item">
                <CustomSelect
                  value={strandFilter}
                  onChange={(e) => {
                    setStrandFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Strands' },
                    { value: 'STEM', label: 'STEM' },
                    { value: 'ABM', label: 'ABM' },
                    { value: 'HUMSS', label: 'HUMSS' },
                    { value: 'GAS', label: 'GAS' },
                    { value: 'TVL', label: 'TVL' },
                    { value: 'JHS Core', label: 'JHS Core' }
                  ]}
                />
              </div>

              {/* Entries per page & List / Grid View Toggle combined */}
              <div className="mobile-filter-item mobile-filter-item-utility">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <CustomSelect
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: 10, label: '10 / page' },
                      { value: 25, label: '25 / page' },
                      { value: 50, label: '50 / page' },
                      { value: 100, label: '100 / page' }
                    ]}
                  />
                </div>
                <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
              </div>
            </div>
          </div>

          {/* Quick Active Filters Feedback */}
          {(searchTerm || levelFilter !== 'all' || gradeFilter !== 'all' || strandFilter !== 'all' || yearFilter !== 'all') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Active Filters:</span>
              {yearFilter !== 'all' && (
                <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  S.Y.: {yearFilter}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setYearFilter('all')} />
                </span>
              )}
              {levelFilter !== 'all' && (
                <span style={{ background: '#f0f4f8', color: '#07345f', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Level: {levelFilter.toUpperCase()}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setLevelFilter('all')} />
                </span>
              )}
              {gradeFilter !== 'all' && (
                <span style={{ background: '#f0f4f8', color: '#07345f', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Grade: {gradeFilter}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setGradeFilter('all')} />
                </span>
              )}
              {strandFilter !== 'all' && (
                <span style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Strand: {strandFilter}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setStrandFilter('all')} />
                </span>
              )}
              {searchTerm && (
                <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Query: "{searchTerm}"
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setYearFilter('all');
                  setLevelFilter('all');
                  setGradeFilter('all');
                  setStrandFilter('all');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Student Table (Desktop View) */}
        <div className="responsive-table-desktop student-directory-table force-hidden">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ width: '48px', padding: '14px 18px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedStudents.length > 0 &&
                      paginatedStudents.every(s => selectedIds.includes(s.id))
                    }
                    style={{ cursor: 'pointer' }}
                  />
                </th>

                {/* Student Name */}
                <th
                  onClick={() => handleSort('name')}
                  style={{
                    padding: '14px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Student {renderSortIcon('name')}
                  </div>
                </th>

                {/* Grade Level */}
                <th
                  onClick={() => handleSort('grade')}
                  style={{
                    padding: '14px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Grade Level {renderSortIcon('grade')}
                  </div>
                </th>

                {/* Academic Strand / Track */}
                <th
                  onClick={() => handleSort('strand')}
                  style={{
                    padding: '14px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Strand / Track {renderSortIcon('strand')}
                  </div>
                </th>

                {/* Section */}
                <th
                  onClick={() => handleSort('section')}
                  style={{
                    padding: '14px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Section {renderSortIcon('section')}
                  </div>
                </th>

                {/* Guardian / Contact */}
                <th
                  style={{
                    padding: '14px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Guardian Info
                </th>

                {/* Action */}
                <th
                  style={{
                    padding: '14px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    textAlign: 'right'
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: entriesPerPage > 10 ? 8 : entriesPerPage }).map((_, rIdx) => (
                  <tr key={`skel-student-${rIdx}`}>
                    <td style={{ padding: '14px 18px' }}><div className="skeleton-pulse" style={{ width: '18px', height: '18px', borderRadius: '4px' }} /></td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="skeleton-pulse" style={{ width: '34px', height: '34px', borderRadius: '50%' }} />
                        <div style={{ flex: 1 }}>
                          <div className="skeleton-pulse" style={{ width: '140px', height: '14px', borderRadius: '4px', marginBottom: '4px' }} />
                          <div className="skeleton-pulse" style={{ width: '90px', height: '11px', borderRadius: '4px' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}><div className="skeleton-pulse" style={{ width: '100px', height: '13px', borderRadius: '4px' }} /></td>
                    <td style={{ padding: '14px 18px' }}><div className="skeleton-pulse" style={{ width: '80px', height: '22px', borderRadius: '12px' }} /></td>
                    <td style={{ padding: '14px 18px' }}><div className="skeleton-pulse" style={{ width: '90px', height: '13px', borderRadius: '4px' }} /></td>
                    <td style={{ padding: '14px 18px' }}><div className="skeleton-pulse" style={{ width: '85px', height: '22px', borderRadius: '12px' }} /></td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <div className="skeleton-pulse" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                        <div className="skeleton-pulse" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Users size={32} color="#94a3b8" />
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>No students found</span>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        No records match your selected grade, strand, or search criteria.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => {
                  const isChecked = selectedIds.includes(s.id);
                  const strand = getStudentStrand(s);
                  const isSHS = getGradeNumber(s.grade) >= 11;

                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isChecked ? '#f8fafc' : '#ffffff',
                        transition: 'background 0.15s'
                      }}
                      onMouseOver={(e) => { if (!isChecked) e.currentTarget.style.background = '#fafafa'; }}
                      onMouseOut={(e) => { if (!isChecked) e.currentTarget.style.background = '#ffffff'; }}
                    >
                      {/* Checkbox */}
                      <td style={{ textAlign: 'center', padding: '14px 18px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(s.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Student Profile */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <StudentInitialsAvatar
                            student={s}
                            style={{
                              width: 40,
                              height: 40,
                              border: '1px solid #e2e8f0',
                              fontSize: '13px'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary, #0f172a)' }}>
                              {s.fname} {s.mname ? s.mname[0] + '. ' : ''}{s.lname}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', marginTop: '1px' }}>
                              Student ID: <strong style={{ color: 'var(--text-secondary, #334155)' }}>{s.student_id}</strong> • {s.gender || 'Male'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Grade Level Badge */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          className={`student-grade-pill ${isSHS ? 'badge-purple' : 'badge-blue'}`}
                          style={{
                            background: isSHS ? '#f5f3ff' : '#eff6ff',
                            color: isSHS ? '#6d28d9' : '#1d4ed8',
                            border: `1px solid ${isSHS ? '#c4b5fd' : '#bfdbfe'}`,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            display: 'inline-block'
                          }}
                        >
                          {s.grade}
                        </span>
                      </td>

                      {/* Strand / Track Badge */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          className={isSHS ? 'badge-minor' : 'badge-neutral'}
                          style={{
                            background: isSHS ? '#f0fdf4' : 'var(--bg-surface-elevated, #f8fafc)',
                            color: isSHS ? '#15803d' : 'var(--text-secondary, #334155)',
                            border: `1px solid ${isSHS ? '#86efac' : 'var(--border-subtle, #cbd5e1)'}`,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Layers size={11} /> {strand}
                        </span>
                      </td>

                      {/* Section */}
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--text-secondary, #334155)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>{s.section}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>{s.academicyear || '2025-2026'}</div>
                      </td>

                      {/* Guardian Info */}
                      <td style={{ padding: '14px 18px', fontSize: '13px' }}>
                        <div style={{ color: 'var(--text-primary, #0f172a)', fontWeight: 600 }}>{s.parent_name || 'N/A'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', marginTop: '1px' }}>
                          {s.parent_contact || 'No contact number'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div className="student-table-actions" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setStudentForViewModal(s)}
                            className="student-row-action-btn"
                            style={{
                              background: 'var(--bg-surface-elevated, #ffffff)',
                              border: '1px solid var(--border-subtle, #cbd5e1)',
                              color: 'var(--brand-blue, #07345f)',
                              padding: '7px 13px',
                              borderRadius: '8px',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.15s',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                            }}
                            title="View Student Full Profile"
                          >
                            <Eye size={14} color="var(--brand-blue, #07345f)" strokeWidth={2.2} /> View
                          </button>

                          {/* Student QR */}
                          <button
                            type="button"
                            onClick={() => setStudentForQr(s)}
                            className="student-row-action-btn"
                            style={{
                              background: 'var(--bg-surface-elevated, #ffffff)',
                              border: '1px solid var(--border-subtle, #cbd5e1)',
                              color: 'var(--text-secondary, #334155)',
                              padding: '7px 13px',
                              borderRadius: '8px',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.15s',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                            }}
                            title="Show Student QR Code"
                          >
                            <QrCode size={14} color="var(--text-muted, #475569)" strokeWidth={2.2} /> QR
                          </button>

                          {/* Edit */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setStudentToEdit(s);
                                setIsAddModalOpen(true);
                              }}
                              className="student-row-action-btn"
                              style={{
                                background: 'var(--bg-surface-elevated, #ffffff)',
                                border: '1px solid var(--border-subtle, #cbd5e1)',
                                color: 'var(--text-secondary, #334155)',
                                padding: '7px 13px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                              }}
                              title="Edit Student Info"
                            >
                              <Edit3 size={14} color="var(--text-muted, #475569)" strokeWidth={2.2} /> Edit
                            </button>
                          )}

                          {/* Delete */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(s.id, `${s.fname} ${s.lname}`)}
                              className="student-row-action-btn"
                              style={{
                                background: 'var(--bg-surface-elevated, #ffffff)',
                                border: '1px solid var(--border-subtle, #cbd5e1)',
                                color: 'var(--text-muted, #64748b)',
                                padding: '7px 11px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                              }}
                              title="Delete Student"
                            >
                              <Trash2 size={14} strokeWidth={2.2} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && paginatedStudents.length === 0 && (
          <div className="responsive-empty-state" role="status">
            <Users size={32} aria-hidden="true" />
            <strong>No students found</strong>
            <span>No records match your selected grade, strand, or search criteria.</span>
          </div>
        )}

        {/* Student Cards (Mobile View) */}
        <div className={`responsive-cards-mobile student-directory-cards ${viewMode === 'grid' ? 'grid-view' : 'list-view'} ${!loading && paginatedStudents.length === 0 ? 'force-hidden' : ''}`}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', width: '100%' }}>
              <SkeletonCardGrid cards={6} />
            </div>
          ) : paginatedStudents.length === 0 ? (
            null
          ) : viewMode === 'grid' ? (
            paginatedStudents.map((s) => {
              const isChecked = selectedIds.includes(s.id);
              const strand = getStudentStrand(s);
              const isSHS = getGradeNumber(s.grade) >= 11;

              return (
                <div
                  key={s.id}
                  className={`entity-grid-card ${isChecked ? 'is-selected' : ''}`}
                >
                  {/* Top Badges Row */}
                  <div className="entity-grid-top-badges">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(s.id)}
                      style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#07345f' }}
                    />
                    <span
                      className={`student-grade-pill ${isSHS ? 'badge-purple' : 'badge-blue'}`}
                      style={{
                        background: isSHS ? '#f5f3ff' : '#eff6ff',
                        color: isSHS ? '#7c3aed' : '#2563eb',
                        border: `1px solid ${isSHS ? '#ddd6fe' : '#bfdbfe'}`,
                        padding: '2px 9px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: 700
                      }}
                    >
                      {s.grade}
                    </span>
                  </div>

                  {/* Center Avatar & Info */}
                  <StudentInitialsAvatar
                    student={s}
                    className="entity-grid-avatar"
                    style={{ color: '#ffffff', background: '#07345f', fontSize: '17px' }}
                  />

                  <div className="entity-grid-name" title={`${s.fname} ${s.lname}`}>
                    {s.fname} {s.lname}
                  </div>

                  <div className="entity-grid-meta">
                    <div className="entity-grid-meta-primary" style={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.section}
                    </div>
                    <div className={`entity-grid-meta-secondary${isSHS ? ' student-mobile-grid-strand' : ''}`} style={{ color: isSHS ? '#047857' : '#64748b', fontSize: '9.5px', marginTop: '1px', fontWeight: 600 }}>
                      {strand}
                    </div>
                    <div className="entity-grid-meta-tertiary" style={{ fontSize: '9.5px', color: '#94a3b8', marginTop: '2px' }}>
                      Student ID: {s.student_id}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="entity-grid-actions">
                    <button
                      type="button"
                      onClick={() => setStudentForViewModal(s)}
                      className="entity-grid-btn"
                      title="View Student Profile"
                    >
                      <Eye size={12} strokeWidth={2.4} /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentForQr(s)}
                      className="entity-grid-btn"
                      title="Show Student QR Code"
                    >
                      <QrCode size={12} strokeWidth={2.4} /> QR
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setStudentToEdit(s);
                          setIsAddModalOpen(true);
                        }}
                        className="entity-grid-btn"
                        title="Edit Student"
                        style={{ padding: '6px 4px', flex: '0 0 28px' }}
                      >
                        <Edit3 size={12} strokeWidth={2.4} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            paginatedStudents.map((s) => {
              const isChecked = selectedIds.includes(s.id);
              const strand = getStudentStrand(s);
              const isSHS = getGradeNumber(s.grade) >= 11;
              const gradeLabel = String(s.grade || '').toLowerCase().startsWith('grade') ? s.grade : `Grade ${s.grade || 'N/A'}`;

              return (
                <div
                  key={s.id}
                  className={`student-mobile-list-card${isChecked ? ' is-selected' : ''}`}
                  style={{
                    background: isChecked ? '#f0f4f8' : '#ffffff',
                    border: isChecked ? '1.5px solid #07345f' : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Top Header: Checkbox + Avatar + Name + Grade Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(s.id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#07345f', flexShrink: 0 }}
                      />
                      <StudentInitialsAvatar student={s} className="student-directory-list-avatar" />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="student-mobile-list-name" style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.fname} {s.mname ? s.mname[0] + '. ' : ''}{s.lname}
                        </div>
                        <div className="student-mobile-list-id" style={{ fontSize: '12px', color: '#64748b' }}>
                          Student ID: <strong style={{ color: '#334155' }}>{s.student_id}</strong> <span aria-hidden="true">•</span> {s.gender || 'Male'}
                        </div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <span
                        className={`student-grade-pill ${isSHS ? 'badge-purple' : 'badge-blue'}`}
                        style={{
                          background: isSHS ? '#f5f3ff' : '#eff6ff',
                          color: isSHS ? '#7c3aed' : '#2563eb',
                          border: `1px solid ${isSHS ? '#ddd6fe' : '#bfdbfe'}`,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        {gradeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Academic details box */}
                  <div className="student-mobile-list-details student-directory-list-details">
                    <div className="student-directory-list-detail">
                      <GraduationCap size={18} aria-hidden="true" />
                      <div>
                        <span className="student-directory-list-label">Section &amp; SY</span>
                        <strong>{s.section || 'Section not set'} ({s.academicyear || '2025-2026'})</strong>
                      </div>
                    </div>
                    <div className="student-directory-list-detail">
                      <Layers size={18} aria-hidden="true" />
                      <div>
                        <span className="student-directory-list-label">Strand</span>
                        <strong className="student-mobile-list-strand">{strand}</strong>
                      </div>
                    </div>
                    <div className="student-directory-list-detail">
                      <Users size={18} aria-hidden="true" />
                      <div>
                        <span className="student-directory-list-label">Guardian</span>
                        <strong>{s.parent_name || 'Guardian not listed'}</strong>
                        {s.parent_contact && <span className="student-directory-list-contact">{s.parent_contact}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="student-mobile-list-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '6px', borderTop: '1px dashed #e2e8f0', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setStudentForViewModal(s)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#07345f',
                        padding: '7px 13px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                    >
                      <Eye size={14} color="#07345f" strokeWidth={2.2} /> View
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentForQr(s)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        padding: '7px 13px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                    >
                      <QrCode size={14} color="#475569" strokeWidth={2.2} /> QR
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setStudentToEdit(s);
                          setIsAddModalOpen(true);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          padding: '7px 13px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      >
                        <Edit3 size={14} color="#475569" strokeWidth={2.2} /> Edit
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSingle(s.id, `${s.fname} ${s.lname}`)}
                        className="is-delete"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#64748b',
                          padding: '7px 11px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      >
                        <Trash2 size={14} strokeWidth={2.2} />
                        <span className="mobile-delete-label">Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination & Status Footer */}
        <div
          className="pagination-footer-responsive table-footer"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '13px',
            color: '#64748b'
          }}
        >
          {loading ? (
            <div className="student-loading-status" role="status" aria-live="polite">Loading students…</div>
          ) : (
            <>
              <div className="student-pagination-summary">
                Showing{' '}
                <strong>
                  {filteredAndSortedStudents.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0}
                </strong>{' '}
                to{' '}
                <strong>
                  {Math.min(currentPage * entriesPerPage, filteredAndSortedStudents.length)}
                </strong>{' '}
                of <strong>{filteredAndSortedStudents.length}</strong> students
              </div>

              <CompactPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} ariaLabel="Students pagination" />
            </>
          )}
        </div>
      </div>

      {/* View Student Modal */}
      <ViewStudentModal
        isOpen={!!studentForViewModal}
        onClose={() => setStudentForViewModal(null)}
        student={studentForViewModal}
      />

      {/* Add / Edit Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        studentToEdit={studentToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setStudentToEdit(null);
        }}
        onSaved={(savedStudent) => {
          if (savedStudent) {
            setStudents(prev => {
              if (studentToEdit) {
                const matchesEditedStudent = s => (
                  (savedStudent.id != null && String(s.id) === String(savedStudent.id)) ||
                  (studentToEdit.id != null && String(s.id) === String(studentToEdit.id)) ||
                  String(s.student_id || '').trim() === String(studentToEdit.student_id || '').trim()
                );
                if (prev.some(matchesEditedStudent)) {
                  return prev.map(s => matchesEditedStudent(s) ? { ...s, ...savedStudent } : s);
                }
                return [savedStudent, ...prev];
              }

              const sid = String(savedStudent.student_id || '').trim();
              return [savedStudent, ...prev.filter(s => String(s.student_id || '').trim() !== sid)];
            });
            setSearchTerm('');
            setCurrentPage(1);
          }
          loadStudents(true);
          setStudentToEdit(null);
        }}
      />

      {/* Student QR Code Modal */}
      {studentForQr && (
        <StudentQrModal
          isOpen={!!studentForQr}
          onClose={() => setStudentForQr(null)}
          student={studentForQr}
        />
      )}

      {/* Bulk CSV / PDF Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImported={loadStudents}
        initialFormat={bulkImportFormat}
      />

      {/* Save As / Export Modal */}
      <SaveAsModal
        isOpen={saveAsModalOpen}
        onClose={() => setSaveAsModalOpen(false)}
        defaultFilename={saveAsConfig.defaultFilename}
        defaultFormat={saveAsConfig.defaultFormat}
        availableFormats={saveAsConfig.availableFormats}
        headers={saveAsConfig.headers}
        rows={saveAsConfig.rows}
        generatePdfBlob={saveAsConfig.generatePdfBlob}
        userEmail={user?.email || 'viotrack.cloud@gmail.com'}
        title={saveAsConfig.title}
      />
    </div>
  );
};
