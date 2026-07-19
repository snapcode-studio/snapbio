const THEMES = [
  { id: 'dark',   label: 'Dark',   bg: '#000000', surface: '#0a0a0a', text: '#fff', accent: '#ffffff', btnBg: '#ffffff', btnText: '#000' },
  { id: 'light',  label: 'Light',  bg: '#f0f0ee', surface: '#ffffff', text: '#111', accent: '#111111', btnBg: '#111111', btnText: '#fff' },
  { id: 'rose',   label: 'Rose',   bg: '#0f0608', surface: '#1a0a10', text: '#ffd6e0', accent: '#ff6b8a', btnBg: '#ff6b8a', btnText: '#fff' },
  { id: 'ocean',  label: 'Ocean',  bg: '#000d18', surface: '#001525', text: '#c8e6ff', accent: '#38bdf8', btnBg: '#38bdf8', btnText: '#000' },
  { id: 'forest', label: 'Forest', bg: '#040e04', surface: '#081408', text: '#d1f5c9', accent: '#4ade80', btnBg: '#4ade80', btnText: '#000' },
  { id: 'neon',   label: 'Neon',   bg: '#020208', surface: '#08080f', text: '#e0e0ff', accent: '#a855f7', btnBg: '#a855f7', btnText: '#fff' },
];

const FONTS = [
  { id: 'Inter',           label: 'Inter',           sample: 'Aa' },
  { id: 'Geist',           label: 'Geist',           sample: 'Aa' },
  { id: 'Outfit',          label: 'Outfit',          sample: 'Aa' },
  { id: 'Playfair Display',label: 'Playfair',        sample: 'Aa' },
];

export default function ThemeEditor({ theme, setTheme, accentColor, setAccentColor, font, setFont }) {
  const selected = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Theme Presets */}
      <div>
        <span className="input-label">Motyw</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
          {THEMES.map(t => (
            <button key={t.id} type="button"
              onClick={() => { setTheme(t.id); setAccentColor(t.accent); }}
              style={{
                background: t.bg,
                border: theme === t.id ? `2px solid #fff` : '2px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px 8px',
                cursor: 'pointer',
                color: t.text,
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s',
                boxShadow: theme === t.id ? '0 0 0 4px rgba(255,255,255,0.1)' : 'none',
              }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: t.accent, margin: '0 auto 6px' }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <span className="input-label">Kolor akcentu</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <input type="color" value={accentColor}
            onChange={e => setAccentColor(e.target.value)}
            style={{ width: '48px', height: '48px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'none', cursor: 'pointer', padding: '2px' }}
          />
          <input type="text" value={accentColor}
            onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setAccentColor(e.target.value); }}
            style={{ marginBottom: 0, maxWidth: '120px', fontFamily: "'Geist Mono', monospace", fontSize: '14px' }}
          />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>przyciski, ikony</span>
        </div>
      </div>

      {/* Font */}
      <div>
        <span className="input-label">Czcionka</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
          {FONTS.map(f => (
            <button key={f.id} type="button"
              onClick={() => setFont(f.id)}
              style={{
                background: font === f.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                border: font === f.id ? '2px solid #fff' : '2px solid var(--border-light)',
                borderRadius: '12px',
                padding: '14px 10px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}>
              <div style={{ fontFamily: `'${f.id}', sans-serif`, fontSize: '22px', marginBottom: '4px' }}>{f.sample}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{f.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { THEMES };
