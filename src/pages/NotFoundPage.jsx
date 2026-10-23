import React, { useLayoutEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Home, 
  Search, 
  ShieldAlert, 
  GraduationCap, 
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../css/error-pages.css';

export function NotFoundPage({ standalone = false }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const isStandaloneMode = standalone || !isAuthenticated;

  useLayoutEffect(() => {
    if (!isStandaloneMode) return undefined;

    const lockedElements = [document.documentElement, document.body];
    const previousStyles = lockedElements.map((element) => ({
      element,
      overflow: element.style.getPropertyValue('overflow'),
      overflowPriority: element.style.getPropertyPriority('overflow'),
      height: element.style.getPropertyValue('height'),
      heightPriority: element.style.getPropertyPriority('height'),
    }));

    lockedElements.forEach((element) => {
      element.style.setProperty('overflow', 'hidden', 'important');
      element.style.setProperty('height', '100%', 'important');
    });

    return () => {
      previousStyles.forEach(({ element, overflow, overflowPriority, height, heightPriority }) => {
        if (overflow) element.style.setProperty('overflow', overflow, overflowPriority);
        else element.style.removeProperty('overflow');
        if (height) element.style.setProperty('height', height, heightPriority);
        else element.style.removeProperty('height');
      });
    };
  }, [isStandaloneMode]);

  return (
    <div className={`error-page-container ${isStandaloneMode ? 'standalone' : ''}`}>
      <div className="error-card">
        <img className="error-illustration" src="/images/error-404.png" alt="A traveler looking for a missing page" />
        <h1 className="error-title">We couldn’t find that page</h1>
        <p className="error-description">The address may be incorrect, or the page may have moved. Go back or choose a destination below.</p>

        {/* Primary Action Buttons */}
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

        {/* Suggested Section Chips */}
        {isAuthenticated && (
          <div className="error-quick-links">
            <div className="error-quick-title">
              <Search size={12} />
              <span>Suggested Navigation</span>
            </div>
            <div className="error-links-grid">
              <Link to="/violations" className="error-link-chip">
                <ShieldAlert size={14} color="#dc2626" />
                <span>Violations</span>
              </Link>
              <Link to="/students" className="error-link-chip">
                <GraduationCap size={14} color="#07345f" />
                <span>Students</span>
              </Link>
              <Link to="/scan-qr" className="error-link-chip">
                <QrCode size={14} color="#16a34a" />
                <span>QR Scanner</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotFoundPage;
