import React, { useState, useEffect, useRef } from 'react';
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
  KeyRound,
  X,
  Mail,
  Building2
  ,Info, ArrowLeft
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
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorDigits, setTwoFactorDigits] = useState(['', '', '', '', '', '']);
  const [twoFactorSeconds, setTwoFactorSeconds] = useState(30);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const twoFactorInputRefs = useRef([]);

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

    const cleanInput = sanitizeText(email).trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanInput || !cleanPassword) {
      showError('Please enter your institutional email and password.');
      return;
    }

    setLoading(true);
    try {
      const loginResult = await apiPost('/auth/login', {
        email: cleanInput,
        password: cleanPassword,
        rememberMe
      });

      if (loginResult.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setTwoFactorSuccess(false);
        setUseRecoveryCode(false);
        setTwoFactorDigits(['', '', '', '', '', '']);
        setTwoFactorCode('');
        return;
      }
      const { user: authenticatedUser } = loginResult;
      login(authenticatedUser);
      success(`Welcome back! Signed in as ${authenticatedUser.role === 'admin' ? 'Administrator' : 'Faculty'}.`);
      navigate(getSafeDestination(authenticatedUser.role, rawTargetDestination));
    } catch (authIssue) {
      if (authIssue.status !== 401) {
        if (!authIssue.status) {
          showError('Cannot reach the login service. Make sure npm run dev is running and the database is available.');
        } else if (authIssue.status >= 500) {
          showError('The login service could not complete the request. Check the API and database output, then retry.');
        } else {
          showError(authIssue.message || 'Unable to sign in. Please retry.');
        }
        return;
      }

      // The server owns sign-in throttling; browser storage can be cleared and
      // must not impose a misleading lockout on a legitimate user.
      showError(authIssue.message || 'Unable to sign in. Please verify your credentials and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(twoFactorCode)) {
      showError('Enter the 6-digit code from Google Authenticator.');
      return;
    }
    setLoading(true);
    try {
      const { user: authenticatedUser } = await apiPost('/auth/verify-2fa', { code: twoFactorCode });
      login(authenticatedUser);
      success('Two-factor verification complete.');
      setTwoFactorSuccess(true);
      window.setTimeout(() => navigate(getSafeDestination(authenticatedUser.role, rawTargetDestination), { replace: true }), 1100);
    } catch (authIssue) {
      showError(authIssue.message || 'The verification code is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (event) => {
    event.preventDefault();
    const recoveryCode = twoFactorCode.trim();
    if (!recoveryCode) {
      showError('Enter one of your recovery codes.');
      return;
    }
    setLoading(true);
    try {
      const { user: authenticatedUser } = await apiPost('/auth/verify-2fa', { code: recoveryCode });
      login(authenticatedUser);
      success('Recovery code accepted.');
      setTwoFactorSuccess(true);
      window.setTimeout(() => navigate(getSafeDestination(authenticatedUser.role, rawTargetDestination), { replace: true }), 1100);
    } catch (authIssue) {
      showError(authIssue.message || 'The recovery code is invalid or has already been used.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!requiresTwoFactor || twoFactorSuccess) return undefined;
    setTwoFactorSeconds(30);
    const timer = window.setInterval(() => {
      setTwoFactorSeconds((seconds) => seconds <= 1 ? 30 : seconds - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [requiresTwoFactor, twoFactorSuccess]);

  const updateTwoFactorDigits = (digits) => {
    const nextDigits = digits.replace(/\D/g, '').slice(0, 6).split('');
    while (nextDigits.length < 6) nextDigits.push('');
    setTwoFactorDigits(nextDigits);
    setTwoFactorCode(nextDigits.join(''));
  };

  const handleTwoFactorDigitChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...twoFactorDigits];
    nextDigits[index] = value;
    setTwoFactorDigits(nextDigits);
    setTwoFactorCode(nextDigits.join(''));
    if (value && index < 5) twoFactorInputRefs.current[index + 1]?.focus();
  };

  const handleTwoFactorKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !twoFactorDigits[index] && index > 0) {
      twoFactorInputRefs.current[index - 1]?.focus();
    }
  };

  const handleTwoFactorPaste = (event) => {
    event.preventDefault();
    updateTwoFactorDigits(event.clipboardData.getData('text'));
  };

  if (requiresTwoFactor) {
    return (
      <main className="login-body-bg" id="main-content">
        <div className="login-bg-shape-top-left" />
        <div className="login-bg-shape-bottom-right" />
        <div className="login-content-wrapper">
          <div className="login-brand-header">
            <svg className="login-brand-logo-svg" viewBox="0 0 500 370" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="195" cy="96" r="30" fill="#07345F" />
              <path d="M 120 105 Q 108 96 110 110 L 122 206 Q 124 214 132 222 L 235 324 Q 243 332 243 320 L 243 202 Q 243 194 235 188 Z" fill="#07345F" />
              <circle cx="305" cy="96" r="30" fill="#07345F" />
              <path d="M 380 105 Q 392 96 390 110 L 378 206 Q 376 214 368 222 L 265 324 Q 257 332 257 320 L 257 202 Q 257 194 265 188 Z" fill="#0EA5A0" />
            </svg>
            <h1 className="login-brand-title">VIOTRACK</h1>
            <p className="login-brand-tagline">
              A Student Violation Tracking and Monitoring System
              <span className="login-brand-tagline-sub">Using QR Code and Dashboard</span>
            </p>
          </div>
          <div className="login-card-modern login-2fa-card">
            {twoFactorSuccess ? (
              <div className="login-2fa-success-state">
                <div className="login-2fa-success-icon"><CheckCircle2 size={30} /></div>
                <h1>Verification successful</h1>
                <p>Your identity has been verified.</p>
                <div className="login-2fa-success-bar" />
                <span>Continuing to your dashboard…</span>
              </div>
            ) : <>
              <div className="login-2fa-topbar">
                <button type="button" className="login-2fa-icon-button" aria-label="Back to login" onClick={() => { setRequiresTwoFactor(false); setTwoFactorCode(''); setTwoFactorDigits(['', '', '', '', '', '']); }}><ArrowLeft size={16} /></button>
                <Info size={15} className="login-2fa-info-icon" />
              </div>
              {useRecoveryCode ? <>
                <div className="login-2fa-header">
                  <h1>Use a recovery code</h1>
                  <p>Enter one of the backup codes you saved when you enabled two-factor authentication.</p>
                </div>
                <form onSubmit={handleRecoverySubmit} className="login-2fa-form login-recovery-form">
                  <label htmlFor="recovery-code">Recovery code</label>
                  <input id="recovery-code" className="login-text-input-clean login-recovery-input" autoComplete="one-time-code" placeholder="XXXXXXXXXX" value={twoFactorCode} onChange={(event) => setTwoFactorCode(event.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10))} autoFocus />
                  <p className="login-2fa-help"><Info size={12} /> Each recovery code can be used only once.</p>
                  <button className="login-submit-btn-primary login-2fa-submit" type="submit" disabled={loading}>{loading ? 'Verifying…' : 'Use recovery code'} <ArrowRight size={15} /></button>
                </form>
                <button className="login-2fa-alternative" type="button" onClick={() => { setUseRecoveryCode(false); setTwoFactorCode(''); setTwoFactorDigits(['', '', '', '', '', '']); }}>Use authenticator app instead</button>
              </> : <>
                <div className="login-2fa-header">
                  <h1>Two-factor authentication</h1>
                  <p>Enter the 6-digit code from your authenticator app.</p>
                </div>
                <form onSubmit={handleTwoFactorSubmit} className="login-2fa-form">
                  <label>Authenticator code</label>
                  <div className="login-2fa-code-grid" onPaste={handleTwoFactorPaste}>
                    {twoFactorDigits.map((digit, index) => <input key={index} ref={(element) => { twoFactorInputRefs.current[index] = element; }} className="login-text-input-clean login-2fa-code-box" inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={1} aria-label={`Authenticator digit ${index + 1}`} value={digit} onChange={(event) => handleTwoFactorDigitChange(index, event)} onKeyDown={(event) => handleTwoFactorKeyDown(index, event)} autoFocus={index === 0} />)}
                  </div>
                  <p id="two-factor-help" className="login-2fa-help"><Info size={12} /> Code refreshes in <strong>00:{String(twoFactorSeconds).padStart(2, '0')}</strong></p>
                  <button className="login-submit-btn-primary login-2fa-submit" type="submit" disabled={loading}>{loading ? 'Verifying…' : 'Verify & continue'} <ArrowRight size={15} /></button>
                </form>
                <button className="login-2fa-alternative" type="button" onClick={() => { setUseRecoveryCode(true); setTwoFactorCode(''); setTwoFactorDigits(['', '', '', '', '', '']); }}>Use another method</button>
              </>}
            </>}
          </div>
        </div>
      </main>
    );
  }

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
          <div className="login-session-expired" role="status" aria-live="polite">
            <CheckCircle2 size={16} aria-hidden="true" />
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
            {/* Email Identifier Input */}
            <div className="login-input-field-wrap">
              <input
                id="login-email"
                type="text"
                className="login-text-input-clean"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                data-lpignore="true"
                disabled={loading}
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
                disabled={loading}
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
              className="login-submit-btn-primary"
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : 'SIGN IN'}</span>
              {!loading && <ArrowRight size={16} />}
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
