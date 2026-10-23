import React from 'react';
import { RefreshCw, Home } from 'lucide-react';
import '../css/error-pages.css';

export function ServerErrorPage({ error, errorInfo, resetError, standalone = false }) {
  // Safe navigation fallback whether inside or outside React Router
  const handleGoHome = (e) => {
    e?.preventDefault();
    if (resetError) {
      resetError();
    }
    window.location.href = '/';
  };

  const handleReload = () => {
    if (resetError) {
      resetError();
    }
    window.location.reload();
  };

  return (
    <div className={`error-page-container ${standalone ? 'standalone' : ''}`}>
      <div className="error-card">
        <img className="error-illustration" src="/images/error-500.png" alt="A system error illustration" />
        <h1 className="error-title">We hit an unexpected error</h1>
        <p className="error-description">The page couldn’t finish loading. Try again, or return to the dashboard.</p>

        {/* Primary Action Buttons */}
        <div className="error-actions" style={{ marginBottom: 0 }}>
          <button 
            type="button"
            className="error-btn-primary" 
            onClick={handleReload}
          >
            <RefreshCw size={14} />
            <span>Reload Page</span>
          </button>
          
          <button 
            type="button"
            onClick={handleGoHome}
            className="error-btn-secondary"
          >
            <Home size={14} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServerErrorPage;
