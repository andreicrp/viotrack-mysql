import { useEffect, useState } from 'react';
import { Check, LoaderCircle, SpellCheck, X } from 'lucide-react';

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const API_URL = `${API_BASE_URL}/api/languagetool/check`;

export const LanguageToolTextarea = ({ value, onChange, style, rows, placeholder, className, ...textareaProps }) => {
  const text = typeof value === 'string' ? value : '';
  const [matches, setMatches] = useState([]);
  const [status, setStatus] = useState('idle');
  const [requestText, setRequestText] = useState(null);
  const [checkedText, setCheckedText] = useState(null);
  const [matchesText, setMatchesText] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!API_URL || !text.trim()) return undefined;

    let isCurrent = true;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setStatus('checking');
      setRequestText(text);
      try {
        const body = new URLSearchParams({ text, language: 'en-US' });
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
          signal: controller.signal,
          credentials: 'omit'
        });
        if (!response.ok) throw new Error(`LanguageTool returned HTTP ${response.status}.`);
        const result = await response.json();
        if (!Array.isArray(result.matches)) throw new Error('LanguageTool returned an invalid response.');
        if (!isCurrent) return;
        setMatches(result.matches);
        setMatchesText(text);
        setCheckedText(text);
        setRequestText(null);
        setStatus('complete');
      } catch (requestError) {
        if (!isCurrent || requestError.name === 'AbortError') return;
        setErrorMessage(requestError.message || 'Unable to check text with LanguageTool.');
        setCheckedText(text);
        setRequestText(null);
        setStatus('error');
      }
    }, 700);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  const handleChange = (nextValue) => {
    setMatches([]);
    setMatchesText(null);
    setCheckedText(null);
    setRequestText(null);
    setErrorMessage('');
    setStatus(!API_URL ? 'unconfigured' : (nextValue.trim() ? 'waiting' : 'idle'));
    onChange(nextValue);
  };

  const visibleStatus = !API_URL
    ? 'unconfigured'
    : !text.trim()
      ? 'idle'
      : checkedText === text
        ? status
        : requestText === text
          ? 'checking'
          : 'waiting';
  const visibleMatches = matchesText === text ? matches : [];

  const applySuggestion = (match, replacement) => {
    const start = match.offset;
    const end = start + match.length;
    if (!Number.isInteger(start) || !Number.isInteger(match.length) || start < 0 || end > text.length) return;
    handleChange(`${text.slice(0, start)}${replacement}${text.slice(end)}`);
  };

  return (
    <div>
      <textarea
        {...textareaProps}
        rows={rows}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        className={className}
        style={style}
      />
      <div
        aria-live="polite"
        style={{
          marginTop: '5px',
          color: visibleStatus === 'error' ? '#b91c1c' : 'var(--text-secondary, #64748b)',
          fontSize: '10px'
        }}
      >
        {!API_URL && 'Grammar checking is disabled. Configure a trusted, self-hosted LanguageTool server.'}
        {API_URL && (visibleStatus === 'waiting' || visibleStatus === 'checking') && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <LoaderCircle size={12} className="lt-spinner" />
              Checking grammar...
            </span>
        )}
        {API_URL && visibleStatus === 'complete' && visibleMatches.length === 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#15803d' }}>
              <Check size={12} />
              No grammar or spelling suggestions.
            </span>
        )}
        {API_URL && visibleStatus === 'error' && `Grammar check failed: ${errorMessage}`}
      </div>
      {visibleMatches.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '6px' }}>
          {visibleMatches.map((match, index) => {
            const replacement = match.replacements?.[0]?.value;
            const start = match.offset;
            const validRange = Number.isInteger(start) && Number.isInteger(match.length)
              && start >= 0 && match.length >= 0 && start + match.length <= text.length;
            return (
              <div
                key={`${match.offset}-${match.length}-${match.rule?.id || index}`}
                style={{
                  padding: '7px 8px',
                  border: '1px solid var(--border-medium, #e2e8f0)',
                  borderRadius: '6px',
                  background: 'var(--bg-surface-elevated, #f8fafc)',
                  color: 'var(--text-primary, #0f172a)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontSize: '10px', lineHeight: 1.4 }}>
                    <SpellCheck size={12} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                    {match.message}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMatches((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    aria-label="Dismiss suggestion"
                    style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                  >
                    <X size={12} />
                  </button>
                </div>
                {replacement && validRange && (
                  <button
                    type="button"
                    onClick={() => applySuggestion(match, replacement)}
                    style={{
                      marginTop: '4px',
                      border: 0,
                      padding: 0,
                      background: 'transparent',
                      color: 'var(--brand-blue, #1d4ed8)',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Replace with "{replacement}"
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`
        @keyframes lt-spin { to { transform: rotate(360deg); } }
        .lt-spinner { animation: lt-spin 0.8s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .lt-spinner { animation: none; }
        }
      `}</style>
    </div>
  );
};
