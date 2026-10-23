import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../css/error-pages.css';

export function ForbiddenPage({ standalone = false }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const isStandaloneMode = standalone || !isAuthenticated;

  return (
    <div className={`error-page-container ${isStandaloneMode ? 'standalone' : ''}`}>
      <div className="error-card">
        <img className="error-illustration" src="/images/error-403.png" alt="An access restriction illustration" />
        <h1 className="error-title">You don’t have access to this page</h1>
        <p className="error-description">
          This area requires a different account role. You’re signed in as <strong>{user?.role ? user.role.toUpperCase() : 'STANDARD USER'}</strong>. Contact your school administrator if you need access.
        </p>

        {/* Primary Actions */}
        <div className="error-actions">
          <button 
            type="button"
            className="error-btn-secondary" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={15} />
            <span>Go Back</span>
          </button>
          
          <Link 
            to={isAuthenticated ? "/" : "/login"} 
            className="error-btn-primary"
          >
            <Home size={15} />
            <span>{isAuthenticated ? "Back to Dashboard" : "Return to Login"}</span>
          </Link>
        </div>

        {/* Support Help Contact */}
        <div className="error-quick-links">
          <div className="error-quick-title">
            <UserX size={12} />
            <span>Need Higher Privileges?</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Please coordinate with your school administrator or head of discipline to update your account role permissions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForbiddenPage;
