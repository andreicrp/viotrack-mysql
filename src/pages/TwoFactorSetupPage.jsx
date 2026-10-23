import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../lib/api';
import { ArrowRight, Check, Copy, KeyRound, ShieldCheck, Smartphone } from 'lucide-react';
import '../css/profile.css';

export const TwoFactorSetupPage = () => {
  const navigate = useNavigate();
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [recoveryCopied, setRecoveryCopied] = useState(false);
  const [setupStep, setSetupStep] = useState(1);

  useEffect(() => {
    apiPost('/auth/2fa/setup', {})
      .then(setSetup)
      .catch((error) => setMessage(error.message || 'Unable to start 2FA setup.'))
      .finally(() => setLoading(false));
  }, []);

  const enable = async (event) => {
    event.preventDefault();
    if (!setup?.secret || code.length !== 6 || saving) return;
    setSaving(true);
    setMessage('');
    try {
      const result = await apiPost('/auth/2fa/enable', { secret: setup.secret, code });
      setMessage('Two-factor authentication is enabled. You will be asked for a code at your next login.');
      setCode('');
      setRecoveryCodes(result.recoveryCodes || []);
      setSetupStep(3);
    } catch (error) {
      setMessage(error.message || 'The authenticator code is incorrect.');
    } finally {
      setSaving(false);
    }
  };

  const copyRecoveryCodes = async () => {
    if (!recoveryCodes?.length) return;
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setRecoveryCopied(true);
      window.setTimeout(() => setRecoveryCopied(false), 1800);
    } catch {
      setMessage('Copy is unavailable. Save the recovery codes manually.');
    }
  };

  const copySecret = async () => {
    if (!setup?.secret) return;
    try {
      await navigator.clipboard.writeText(setup.secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage('Copy is unavailable. Use the manual key shown below the QR code.');
    }
  };

  return (
    <main id="main-content" className="two-factor-setup-page">
      <section className="two-factor-setup-shell">
        <div className="two-factor-page-heading">
          <div className="two-factor-page-heading-copy">
            <div className="two-factor-heading-icon"><ShieldCheck size={26} /></div>
            <div>
              <h1>Two-factor authentication</h1>
              <p>Protect your VioTrack account with a secure authenticator app sign-in.</p>
            </div>
          </div>
        </div>

        <div className="two-factor-steps" aria-label="Two-factor setup progress">
          <div className={`two-factor-step ${setupStep >= 1 ? 'is-active' : ''} ${setupStep > 1 ? 'is-complete' : ''}`}><span>{setupStep > 1 ? <Check size={13} /> : '1'}</span><strong>Scan QR code</strong></div>
          <div className={`two-factor-step-line ${setupStep > 1 ? 'is-complete' : ''}`} />
          <div className={`two-factor-step ${setupStep >= 2 ? 'is-active' : ''} ${setupStep > 2 ? 'is-complete' : ''}`}><span>{setupStep > 2 ? <Check size={13} /> : '2'}</span><strong>Enter code</strong></div>
          <div className={`two-factor-step-line ${setupStep > 2 ? 'is-complete' : ''}`} />
          <div className={`two-factor-step ${setupStep >= 3 ? 'is-active' : ''}`}><span>{setupStep >= 3 ? <Check size={13} /> : '3'}</span><strong>Finish setup</strong></div>
        </div>

        {loading && <div className="two-factor-loading">Preparing your secure setup code…</div>}
        {setup && !recoveryCodes && setupStep === 1 && <div className="two-factor-single-step">
          <section className="two-factor-qr-panel">
            <div className="two-factor-panel-heading">
              <div className="two-factor-panel-icon"><Smartphone size={18} /></div>
              <div><span className="two-factor-panel-step-label">Step 1</span><h2>Scan with an authenticator app</h2><p>Use Google Authenticator, Microsoft Authenticator, or Authy.</p></div>
            </div>
            <div className="two-factor-qr-frame"><img src={setup.qrCode} alt="QR code for authenticator app setup" width="224" height="224" /></div>
            <div className="two-factor-manual-wrap">
              <span>Can’t scan the code?</span>
              <div className="two-factor-manual-key"><code>{setup.secret}</code><button type="button" onClick={copySecret} aria-label="Copy manual setup key">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy key'}</button></div>
            </div>
            <button type="button" className="two-factor-next-step-button" onClick={() => setSetupStep(2)}>I’ve scanned the code <ArrowRight size={16} /></button>
          </section>
        </div>}

        {setup && !recoveryCodes && setupStep === 2 && <div className="two-factor-single-step two-factor-step-two-layout">
          <section className="two-factor-verify-panel">
            <div className="two-factor-panel-heading">
              <div className="two-factor-panel-icon"><KeyRound size={18} /></div>
              <div><span className="two-factor-panel-step-label">Step 2</span><h2>Confirm your setup</h2><p>Enter the 6-digit code currently shown in your app.</p></div>
            </div>
            <form onSubmit={enable} className="two-factor-setup-form">
              <label htmlFor="setup-2fa-code">Authenticator code</label>
              <input className="two-factor-code-input" id="setup-2fa-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000 000" value={code} onChange={(event) => { const nextCode = event.target.value.replace(/\D/g, ''); setCode(nextCode); if (nextCode.length > 0) setSetupStep(2); }} autoFocus />
              <button className="two-factor-enable-button" type="submit" disabled={saving}>{saving ? 'Verifying…' : 'Verify and enable 2FA'}</button>
            </form>
            <div className="two-factor-security-note"><ShieldCheck size={16} /><span>Your secret is encrypted and never displayed after setup.</span></div>
            {message && <p className="two-factor-setup-message" role="status">{message}</p>}
          </section>
        </div>}
        {recoveryCodes && <section className="two-factor-recovery-panel" role="status">
          <div className="two-factor-recovery-heading"><div className="two-factor-recovery-icon"><ShieldCheck size={20} /></div><div><span className="two-factor-panel-step-label">Step 3</span><h2>Save your recovery codes</h2><p>Use one of these codes if you lose access to your authenticator app. Each code works once.</p></div></div>
          <div className="two-factor-recovery-codes">{recoveryCodes.map((recoveryCode) => <code key={recoveryCode}>{recoveryCode}</code>)}</div>
          <div className="two-factor-recovery-actions"><button type="button" className="two-factor-copy-recovery" onClick={copyRecoveryCodes}>{recoveryCopied ? <Check size={15} /> : <Copy size={15} />}{recoveryCopied ? 'Copied' : 'Copy all codes'}</button><button type="button" className="two-factor-enable-button" onClick={() => navigate('/profile')}>I saved my codes</button></div>
          <p className="two-factor-recovery-warning">These codes are shown only once. Store them somewhere safe.</p>
        </section>}
      </section>
    </main>
  );
};

export default TwoFactorSetupPage;
