import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { apiPost } from '../lib/api';
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  KeyRound,
  X,
  Mail,
  Building2
} from 'lucide-react';
import { LegalModal } from '../components/legal/LegalModal';
import {
  sanitizeText
} from '../utils/security';
import '../css/login.css';

const configuredItSupportEmail = import.meta.env.VITE_IT_SUPPORT_EMAIL?.trim();
const itSupportEmail = configuredItSupportEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredItSupportEmail)
  ? configuredItSupportEmail
  : 'it@viotrack.edu';

export const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const isLoggedOut = queryParams.get('logged_out') === '1';
  const isExpired = queryParams.get('logged_out') === 'expired';
  const isQrProtected = queryParams.get('reason') === 'qr_protected';
  const redirectParam = queryParams.get('redirect');
  const rawTargetDestination = redirectParam ? decodeURIComponent(redirectParam) : '/';

  const getSafeDestination = (role, target) => {
    const adminOnlyRoutes = ['/admin-users', '/activity-logs'];
    if (role !== 'admin' && adminOnlyRoutes.some(route => target.startsWith(route))) {
      return '/';
    }
    return target || '/';
  };

  const userType = user?.role || 'teacher';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Progressive Brute-Force Rate Limiting State (persisted across reloads)
  const [throttle, setThrottle] = useState(() => {
    try {
      const saved = localStorage.getItem('viotrack_login_throttle');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lockoutUntil && parsed.lockoutUntil > Date.now()) {
          return parsed;
        }
        return { failedAttempts: parsed.failedAttempts || 0, lockoutUntil: 0 };
      }
    } catch {}
    return { failedAttempts: 0, lockoutUntil: 0 };
  });

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Countdown timer for lockout duration
  useEffect(() => {
    const checkLockout = () => {
      const now = Date.now();
      if (throttle.lockoutUntil && throttle.lockoutUntil > now) {
        setRemainingSeconds(Math.ceil((throttle.lockoutUntil - now) / 1000));
      } else {
        setRemainingSeconds(0);
      }
    };
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [throttle.lockoutUntil]);

  // If already authenticated and not explicitly redirected due to logout, go straight to targetDestination or dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoggedOut && !isExpired) {
      navigate(getSafeDestination(userType, rawTargetDestination), { replace: true });
    }
  }, [isAuthenticated, isLoggedOut, isExpired, rawTargetDestination, userType, navigate]);

  // Password Reset Dialog State
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Legal Modal
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('privacy');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (remainingSeconds > 0) {
      showError(`Security lockout is active. Please wait ${remainingSeconds}s before retrying.`);
      return;
    }

    const cleanInput = sanitizeText(email).trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanInput || !cleanPassword) {
      showError('Please enter your institutional email and password.');
      return;
    }

    setLoading(true);
    try {
      const { user: authenticatedUser } = await apiPost('/auth/login', {
        email: cleanInput,
        password: cleanPassword,
        rememberMe
      });

      // Clear failed attempts upon successful authentication
      try {
        localStorage.removeItem('viotrack_login_throttle');
      } catch {}
      setThrottle({ failedAttempts: 0, lockoutUntil: 0 });

      login(authenticatedUser);
      success(`Welcome back! Signed in as ${authenticatedUser.role === 'admin' ? 'Administrator' : 'Faculty'}.`);
      navigate(getSafeDestination(authenticatedUser.role, rawTargetDestination));
    } catch (authIssue) {
      const nextFailed = (throttle.failedAttempts || 0) + 1;
      let nextLockout = 0;
      let alertMsg = authIssue.message || 'Authentication failed. Please verify your credentials.';

      if (nextFailed >= 5) {
        // 5 consecutive failures = 5-minute lockout
        nextLockout = Date.now() + 5 * 60 * 1000;
        alertMsg = 'Security Lockout: 5 consecutive failed attempts. System access locked for 5 minutes.';
      } else if (nextFailed >= 3) {
        // 3 consecutive failures = 30-second lockout
        nextLockout = Date.now() + 30 * 1000;
        alertMsg = 'Security Lockout: 3 failed attempts. Please wait 30 seconds before retrying.';
      } else {
        alertMsg += ` (${nextFailed}/3 attempts before temporary lockout)`;
      }

      const updated = { failedAttempts: nextFailed, lockoutUntil: nextLockout };
      setThrottle(updated);
      try {
        localStorage.setItem('viotrack_login_throttle', JSON.stringify(updated));
      } catch {}

      showError(alertMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" tabIndex="-1" className="login-body-bg">
      {/* Background Graphic Accents */}
      <div className="login-bg-shape-top-left" />
      <div className="login-bg-shape-bottom-right" />

      <div className="login-content-wrapper">
        {/* Brand Header */}
        <div className="login-brand-header">
          <svg
            className="login-brand-logo-svg"
            viewBox="0 0 500 370"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <circle cx="195" cy="96" r="30" fill="#07345F" />
              <path
                d="M 120 105 Q 108 96 110 110 L 122 206 Q 124 214 132 222 L 235 324 Q 243 332 243 320 L 243 202 Q 243 194 235 188 Z"
                fill="#07345F"
              />
            </g>
            <g>
              <circle cx="305" cy="96" r="30" fill="#07345F" />
              <path
                d="M 380 105 Q 392 96 390 110 L 378 206 Q 376 214 368 222 L 265 324 Q 257 332 257 320 L 257 202 Q 257 194 265 188 Z"
                fill="#0EA5A0"
              />
            </g>
          </svg>

          <h1 className="login-brand-title">VIOTRACK</h1>
          <p className="login-brand-tagline">
            A Student Violation Tracking and Monitoring System
            <span className="login-brand-tagline-sub">Using QR Code and Dashboard</span>
          </p>
        </div>

        {/* QR Security & Protected Record Access Banner */}
        {isQrProtected && (
          <div
            className="login-qr-protected-banner"
            style={{
              background: '#eff6ff',
              color: '#1e40af',
              border: '1.5px solid #bfdbfe',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <ShieldAlert size={22} className="login-qr-protected-icon" color="#2563eb" style={{ flexShrink: 0 }} />
            <div>
              <div className="login-qr-protected-title" style={{ fontWeight: 700 }}>🔒 Protected Academic QR Code</div>
              <div className="login-qr-protected-subtitle" style={{ fontSize: '11.5px', fontWeight: 500, marginTop: '2px', color: '#3b82f6' }}>
                You must sign in to an authorized school faculty or administrator account to scan this student record.
              </div>
            </div>
          </div>
        )}

        {/* Logged out & Expiration alerts */}
        {queryParams.get('logged_out') === 'expired' && (
          <div
            style={{
              background: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fde68a',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <CheckCircle2 size={16} color="#d97706" />
            <span>Session Timed Out. Please sign in again.</span>
          </div>
        )}

        {isLoggedOut && (
          <div
            style={{
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <CheckCircle2 size={16} />
            <span>You have been logged out securely. Session invalidated.</span>
          </div>
        )}

        {/* Clean Login Card */}
        <div className="login-card-modern">
          <form onSubmit={handleSubmit} autoComplete="off" data-lpignore="true" data-form-type="other">
            {/* Active Security Lockout Alert Banner */}
            {remainingSeconds > 0 && (
              <div className="login-security-lockout-banner" role="alert">
                <ShieldAlert size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Security Lockout Active</strong>
                  <span>Too many failed login attempts. Retry in {remainingSeconds}s.</span>
                </div>
              </div>
            )}

            {/* Warning Pill for 1 or 2 Failed Attempts */}
            {throttle.failedAttempts > 0 && remainingSeconds === 0 && (
              <div className="login-failed-attempts-pill" role="status">
                <AlertTriangle size={13} />
                <span>Security Notice: {throttle.failedAttempts}/3 attempts before temporary lockout</span>
              </div>
            )}

            {/* Email Identifier Input */}
            <div className="login-input-field-wrap">
              <input
                id="login-email"
                type="text"
                className="login-text-input-clean"
                placeholder="Institutional Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                data-lpignore="true"
                disabled={loading || remainingSeconds > 0}
              />
            </div>

            {/* Password Input */}
            <div className="login-input-field-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login-text-input-clean has-eye"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                data-lpignore="true"
                disabled={loading || remainingSeconds > 0}
              />
              <button
                type="button"
                className="login-eye-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                aria-controls="login-password"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2.2} /> : <Eye size={18} strokeWidth={2.2} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="login-options-row">
              <label className="login-remember-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember session</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsResetOpen(true);
                }}
                className="login-forgot-password-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>

            {/* SIGN IN Action Button */}
            <button
              type="submit"
              className={`login-submit-btn-primary ${remainingSeconds > 0 ? 'is-locked' : ''}`}
              disabled={loading || remainingSeconds > 0}
            >
              <span>{remainingSeconds > 0 ? `LOCKED (${remainingSeconds}s)` : loading ? 'Authenticating...' : 'SIGN IN'}</span>
              {!loading && remainingSeconds === 0 && <ArrowRight size={16} />}
            </button>

            {isQrProtected ? (
              <div
                style={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '11.5px',
                  color: '#64748b',
                  textAlign: 'center',
                  fontWeight: 500
                }}
              >
                Sign in with your authorized staff account to continue.
              </div>
            ) : (
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                Sign in with the credentials provided by your VioTrack administrator.
              </div>
            )}
          </form>
        </div>

        {/* Privacy Policy Footer */}
        <div className="login-privacy-footer">
          <span>By signing in you agree to our </span>
          <button
            type="button"
            onClick={() => { setLegalModalTab('privacy'); setIsLegalModalOpen(true); }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#2563eb',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
          >
            Privacy Policy
          </button>
        </div>
      </div>

      {/* Password assistance dialog */}
      {isResetOpen && (
        <div
          className="login-support-backdrop"
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            willChange: 'opacity'
          }}
        >
          <div
            className="login-reset-password-card login-support-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-support-title"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            <div className="login-support-header">
              <div className="login-support-heading">
                <KeyRound size={20} className="login-reset-password-icon" color="currentColor" />
                <h3 id="login-support-title" className="login-reset-password-title">Need help signing in?</h3>
              </div>
              <button
                type="button"
                className="login-support-icon-button"
                onClick={() => setIsResetOpen(false)}
                aria-label="Close password assistance"
              >
                <X size={20} />
              </button>
            </div>

            <p className="login-reset-password-description login-support-description">
              Password resets are handled by your school’s IT Department. Email them or visit the department for assistance.
            </p>

            <div className="login-support-options">
              <a
                href={`mailto:${itSupportEmail}?subject=${encodeURIComponent('VioTrack password assistance')}`}
                className="login-support-email-link"
              >
                <Mail size={17} />
                <span>
                  <strong>Email IT Department</strong>
                  <span className="login-support-email-address">{itSupportEmail}</span>
                </span>
              </a>
              <div className="login-support-visit">
                <Building2 size={18} />
                <span><strong>Visit in person</strong>Go to your school’s IT Department and ask for password-reset assistance.</span>
              </div>
            </div>

            <div className="login-support-footer">
              <button
                type="button"
                className="login-support-close-button"
                onClick={() => setIsResetOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Privacy Policy & Legal Dialog */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </main>
  );
};

export default LoginPage;
