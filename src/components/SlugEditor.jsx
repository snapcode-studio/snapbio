import { useState, useEffect, useCallback } from 'react';
import { validateSlugFormat, checkSlugAvailable, claimSlug } from '../utils/slugUtils';

const COOLDOWN_HOURS = 24;

export default function SlugEditor({ uid, currentSlug, lastSlugChange, onSaved }) {
  const [input, setInput] = useState(currentSlug || '');
  const [status, setStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'own' | 'invalid' | 'saving' | 'saved' | 'error'
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(null);

  // Cooldown check
  const cooldownRemaining = () => {
    if (!lastSlugChange) return 0;
    const diffH = (Date.now() - new Date(lastSlugChange).getTime()) / 3600000;
    return Math.max(0, Math.ceil(COOLDOWN_HOURS - diffH));
  };
  const inCooldown = cooldownRemaining() > 0;

  // Debounced check
  const checkSlug = useCallback((slug) => {
    if (timer) clearTimeout(timer);
    const { valid, error } = validateSlugFormat(slug);
    if (!valid) { setStatus('invalid'); setMessage(error); return; }
    if (slug === currentSlug) { setStatus('own'); setMessage('To jest Twój aktualny slug.'); return; }
    setStatus('checking');
    setMessage('Sprawdzam dostępność...');
    const t = setTimeout(async () => {
      try {
        const res = await checkSlugAvailable(slug, uid);
        if (res.available) { setStatus('available'); setMessage('✓ Dostępny! Możesz go zarezerwować.'); }
        else if (res.isOwn) { setStatus('own'); setMessage('To jest Twój aktualny slug.'); }
        else { setStatus('taken'); setMessage('✗ Zajęty. Wybierz inny.'); }
      } catch { setStatus('invalid'); setMessage('Błąd sprawdzania.'); }
    }, 600);
    setTimer(t);
  }, [currentSlug, uid, timer]);

  useEffect(() => {
    if (input) checkSlug(input);
    else { setStatus(null); setMessage(''); }
    return () => { if (timer) clearTimeout(timer); };
  }, [input]);

  const handleClaim = async () => {
    if (status !== 'available') return;
    setStatus('saving');
    try {
      await claimSlug(uid, input, currentSlug, lastSlugChange);
      setStatus('saved');
      setMessage('✓ Slug zapisany!');
      onSaved(input);
    } catch (e) {
      setStatus('error');
      setMessage(e.message);
    }
  };

  const borderColor = { available: '#4ade80', taken: '#ff453a', invalid: '#ff453a', error: '#ff453a', saved: '#4ade80', own: 'rgba(255,255,255,0.2)' }[status] || 'var(--border-light)';
  const msgColor = { available: '#4ade80', taken: '#ff453a', invalid: '#ff453a', error: '#ff453a', saved: '#4ade80' }[status] || 'var(--text-muted)';

  return (
    <div>
      <span className="input-label">Twój publiczny link</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', whiteSpace: 'nowrap', fontFamily: "'Geist Mono', monospace" }}>bio.getsnap.space/</span>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="twojlink"
            disabled={inCooldown}
            style={{ marginBottom: 0, borderColor, transition: 'border-color 0.3s', fontFamily: "'Geist Mono', monospace", fontSize: '14px', paddingRight: status === 'available' ? '48px' : '14px' }}
          />
          {status === 'available' && (
            <button onClick={handleClaim} type="button"
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: '#4ade80', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#000', fontWeight: 700, fontSize: '16px' }}>
              ✓
            </button>
          )}
          {status === 'saving' && (
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '12px' }}>...</span>
          )}
        </div>
      </div>
      {message && <p style={{ fontSize: '12px', color: msgColor, marginTop: '6px', fontFamily: "'Geist Mono', monospace" }}>{message}</p>}
      {inCooldown && (
        <p style={{ fontSize: '12px', color: '#ff453a', marginTop: '6px' }}>
          ⏱ Możesz zmienić slug ponownie za {cooldownRemaining()}h.
        </p>
      )}
    </div>
  );
}
