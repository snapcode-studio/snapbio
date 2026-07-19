export default function EcosystemWidget({ hasSnapMenu, snapMenuSlug }) {
  if (hasSnapMenu) {
    return (
      <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '20px' }}>🔗</span>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Ekosystem Snap Code</span>
          <span style={{ marginLeft: 'auto', background: '#4ade80', color: '#000', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', fontFamily: "'Geist Mono', monospace" }}>POŁĄCZONE</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
          Masz konto <strong style={{ color: 'white' }}>SnapMenu</strong>! Widget menu jest dostępny w Twoim SnapBio — klienci widzą link do cyfrowego menu bezpośrednio z Twojego profilu.
        </p>
        {snapMenuSlug && (
          <a
            href={`https://menu.getsnap.space/menu.html?id=${snapMenuSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '10px', textDecoration: 'none', width: 'auto', display: 'inline-flex' }}
          >
            Otwórz moje menu ↗
          </a>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)', border: '1px dashed var(--border-light)', borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ fontSize: '20px' }}>🍽️</span>
        <span style={{ fontWeight: 600, fontSize: '15px' }}>Odkryj SnapMenu</span>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
        Prowadzisz restaurację, kawiarnię lub salon? <strong style={{ color: 'white' }}>SnapMenu</strong> to darmowe cyfrowe menu z kodem QR, które idealnie integruje się ze SnapBio. Twoi klienci będą mogli przeglądać menu prosto z Twojego profilu.
      </p>
      <a
        href="https://menu.getsnap.space"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary"
        style={{ fontSize: '13px', padding: '10px', textDecoration: 'none', width: 'auto', display: 'inline-flex' }}
      >
        Utwórz darmowe SnapMenu ↗
      </a>
    </div>
  );
}
