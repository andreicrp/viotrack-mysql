import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  BookOpen,
  Presentation,
  GraduationCap,
  Briefcase,
  Settings,
  UserCircle2,
  Bell,
  MessageSquare,
  LogOut,
  ChevronDown,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { preloadRoute } from '../../utils/routePreloader';

export const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userImage = user?.avatar || user?.image || '';
  const userInitials = String(user?.name || 'User')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  const [managementOpen, setManagementOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  useEffect(() => setAvatarLoadFailed(false), [userImage]);

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const caseDiscussionLabel = isTeacher ? 'Active Cases' : 'Case Discussion';

  const isManagementActive = location.pathname.includes('/violations') || location.pathname.includes('/violation-types');
  const isAdminActive = location.pathname.includes('/admin-dashboard') || location.pathname.includes('/admin-users') || location.pathname.includes('/for-approval') || location.pathname.includes('/activity-logs') || location.pathname.includes('/closed-case-chats');

  useEffect(() => {
    const updateCount = async () => {
      try {
        const records = await dataService.getRecords();
        const pending = (records || []).filter((r) => {
          const approvalStatus = String(r.approval_status || '').trim();
          if (approvalStatus === 'Approved' || approvalStatus === 'Rejected' || approvalStatus === 'Not Required') return false;
          if (approvalStatus === 'Under Approval') return true;
          return r.status === 'Under Approval' && r.reported_by_type === 'teacher';
        }).length;
        setPendingApprovalsCount(pending);
      } catch {}
    };
    updateCount();
    window.addEventListener('viotrack_data_updated', updateCount);
    return () => {
      window.removeEventListener('viotrack_data_updated', updateCount);
    };
  }, []);

  useEffect(() => {
    if (isManagementActive) {
      setManagementOpen(true);
    }
    if (isAdminActive) {
      setAdminOpen(true);
    }
  }, [location.pathname, isManagementActive, isAdminActive]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleSignOut = (e) => {
    e.preventDefault();
    logout();
    navigate('/login?logged_out=1');
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onCloseMobile?.();
    }
  };

  return (
    <>
      {/* Mobile Dark Overlay */}
      <div
        className={`sidebar-overlay ${isMobileOpen ? 'show' : ''}`}
        id="sidebarOverlay"
        onClick={onCloseMobile}
      />

      {/* Main Sidebar Drawer */}
      <aside
        className={`sidebar ${isCollapsed && !isMobileOpen ? 'collapsed' : ''} ${isMobileOpen ? 'active' : ''}`}
        id="sidebar"
      >
        {/* Mobile Header Inside Drawer */}
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-user-info">
            <div className="mobile-drawer-avatar-wrap">
              {userImage && !avatarLoadFailed ? (
                <img
                  src={userImage}
                  alt={user?.name || 'User'}
                  className="mobile-drawer-avatar"
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <span className="mobile-drawer-avatar mobile-drawer-avatar-fallback" aria-hidden="true">{userInitials}</span>
              )}
              <span className="mobile-online-indicator" />
            </div>
            <div className="mobile-drawer-user-meta">
              <div className="mobile-drawer-username">{user?.name || 'Sheryl Gamboa'}</div>
              <div className="mobile-drawer-role-row">
                <span className="role-chip">{isAdmin ? 'Administrator' : 'Teacher'}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={onCloseMobile}
            aria-label="Close Navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} data-title="Dashboard">
              <NavLink to="/" className="nav-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/dashboard')} end>
                <span className="sidebar-icon">
                  <LayoutDashboard size={20} strokeWidth={2.2} />
                </span>
                <span className="nav-text">Dashboard</span>
              </NavLink>
            </li>
          </ul>

          <div className="nav-section">
            <span className="nav-section-title">MANAGEMENT</span>
            <ul className="nav-list">
              {/* Management Collapsible Submenu */}
              <li
                className={`nav-item has-submenu ${isManagementActive ? 'active' : ''} ${managementOpen ? 'open' : ''}`}
                data-title="Management"
              >
                <button
                  type="button"
                  className="nav-link submenu-toggle"
                  aria-expanded={managementOpen}
                  aria-controls="management-submenu"
                  onMouseEnter={() => {
                    preloadRoute('/violations');
                    preloadRoute('/violation-types');
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isCollapsed) {
                      navigate('/violations');
                      handleLinkClick();
                    } else {
                      setManagementOpen(!managementOpen);
                    }
                  }}
                >
                  <span className="sidebar-icon">
                    <ShieldAlert size={20} strokeWidth={2} />
                  </span>
                  <span className="nav-text">Management</span>
                  <span className={`nav-arrow ${managementOpen ? 'rotated' : ''}`}>
                    <ChevronDown size={15} strokeWidth={2.2} />
                  </span>
                </button>
                <ul id="management-submenu" className={`submenu ${managementOpen ? 'show' : ''}`}>
                  <li className={`submenu-item ${location.pathname === '/violations' ? 'active' : ''}`}>
                    <NavLink to="/violations" className="submenu-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/violations')}>
                      <span className="submenu-bullet"></span>
                      <span className="submenu-text">Violation Record</span>
                    </NavLink>
                  </li>
                  {isAdmin && (
                    <li className={`submenu-item ${location.pathname === '/violation-types' ? 'active' : ''}`}>
                      <NavLink to="/violation-types" className="submenu-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/violation-types')}>
                        <span className="submenu-bullet"></span>
                        <span className="submenu-text">Violation</span>
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>

              <li className={`nav-item ${location.pathname === '/case-discussion' ? 'active' : ''}`} data-title={caseDiscussionLabel}>
                <NavLink to="/case-discussion" className="nav-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/case-discussion')}>
                  <span className="sidebar-icon">
                    <MessageSquare size={20} strokeWidth={2} />
                  </span>
                  <span className="nav-text">{caseDiscussionLabel}</span>
                </NavLink>
              </li>

              {isTeacher && (
                <li className={`nav-item ${location.pathname === '/my-class' ? 'active' : ''}`} data-title="My Class">
                  <NavLink to="/my-class" className="nav-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/my-class')}>
                    <span className="sidebar-icon">
                      <BookOpen size={20} strokeWidth={2} />
                    </span>
                    <span className="nav-text">My Class</span>
                  </NavLink>
                </li>
              )}

              {isAdmin && (
                <li className={`nav-item ${location.pathname === '/teachers' ? 'active' : ''}`} data-title="Teacher">
                  <NavLink to="/teachers" className="nav-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/teachers')}>
                    <span className="sidebar-icon">
                      <Presentation size={20} strokeWidth={2} />
                    </span>
                    <span className="nav-text">Teacher</span>
                  </NavLink>
                </li>
              )}

              <li className={`nav-item ${location.pathname === '/students' ? 'active' : ''}`} data-title="Students">
                <NavLink to="/students" className="nav-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/students')}>
                  <span className="sidebar-icon">
                    <GraduationCap size={20} strokeWidth={2} />
                  </span>
                  <span className="nav-text">Students</span>
                </NavLink>
              </li>

              <li className={`nav-item ${location.pathname === '/advisers' ? 'active' : ''}`} data-title="Advisers">
                <NavLink to="/advisers" className="nav-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/advisers')}>
                  <span className="sidebar-icon">
                    <Briefcase size={20} strokeWidth={2} />
                  </span>
                  <span className="nav-text">Advisers</span>
                </NavLink>
              </li>

              {/* Admin Collapsible Submenu */}
              {isAdmin && (
                <li
                  className={`nav-item has-submenu ${isAdminActive ? 'active' : ''} ${adminOpen ? 'open' : ''}`}
                  data-title="Admin"
                >
                  <a
                    href="#admin"
                    className="nav-link submenu-toggle"
                    onMouseEnter={() => {
                      preloadRoute('/admin-dashboard');
                      preloadRoute('/admin-users');
                      preloadRoute('/for-approval');
                      preloadRoute('/activity-logs');
                      preloadRoute('/closed-case-chats');
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      if (isCollapsed) {
                        navigate('/admin-dashboard');
                        handleLinkClick();
                      } else {
                        setAdminOpen(!adminOpen);
                      }
                    }}
                  >
                    <span className="sidebar-icon">
                      <Settings size={20} strokeWidth={2} />
                    </span>
                    <span className="nav-text">Admin</span>
                    <span className={`nav-arrow ${adminOpen ? 'rotated' : ''}`}>
                      <ChevronDown size={15} strokeWidth={2.2} />
                    </span>
                  </a>
                  <ul className={`submenu ${adminOpen ? 'show' : ''}`}>
                    <li className={`submenu-item ${location.pathname === '/admin-dashboard' ? 'active' : ''}`}>
                      <NavLink to="/admin-dashboard" className="submenu-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/admin-dashboard')}>
                        <span className="submenu-bullet"></span>
                        <span className="submenu-text">Overview</span>
                      </NavLink>
                    </li>
                    <li className={`submenu-item ${location.pathname === '/admin-users' ? 'active' : ''}`}>
                      <NavLink to="/admin-users" className="submenu-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/admin-users')}>
                        <span className="submenu-bullet"></span>
                        <span className="submenu-text">Admin Users</span>
                      </NavLink>
                    </li>
                    <li className={`submenu-item ${location.pathname === '/for-approval' ? 'active' : ''}`}>
                      <NavLink to="/for-approval" className="submenu-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/for-approval')}>
                        <span className="submenu-bullet"></span>
                        <span className="submenu-text">For Approval</span>
                        {pendingApprovalsCount > 0 && (
                          <span className="sidebar-count-badge">
                            {pendingApprovalsCount}
                          </span>
                        )}
                      </NavLink>
                    </li>
                    <li className={`submenu-item ${location.pathname === '/activity-logs' ? 'active' : ''}`}>
                      <NavLink to="/activity-logs" className="submenu-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/activity-logs')}>
                        <span className="submenu-bullet"></span>
                        <span className="submenu-text">Activity</span>
                      </NavLink>
                    </li>
                    <li className={`submenu-item ${location.pathname === '/closed-case-chats' ? 'active' : ''}`}>
                      <NavLink to="/closed-case-chats" className="submenu-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/closed-case-chats')}>
                        <span className="submenu-bullet"></span>
                        <span className="submenu-text">Closed Chats</span>
                      </NavLink>
                    </li>
                  </ul>
                </li>
              )}
            </ul>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">SETTINGS</span>
            <ul className="nav-list">
              <li className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`} data-title="Profile">
                <NavLink to="/profile" className="nav-link" onClick={handleLinkClick} onMouseEnter={() => preloadRoute('/profile')}>
                  <span className="sidebar-icon">
                    <UserCircle2 size={20} strokeWidth={2} />
                  </span>
                  <span className="nav-text">Profile</span>
                </NavLink>
              </li>
              <li className="nav-item" data-title="Sign Out">
                <a href="#logout" className="nav-link mobile-signout-link" onClick={handleSignOut}>
                  <span className="sidebar-icon">
                    <LogOut size={20} strokeWidth={2} />
                  </span>
                  <span className="nav-text">Sign Out</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

      </aside>
    </>
  );
};
