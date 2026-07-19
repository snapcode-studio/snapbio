import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { THEMES } from '../components/ThemeEditor';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) { setNotFound(true); setLoading(false); return; }
    (async () => {
      try {
        // Query by slug
        const q = query(collection(db, 'users'), where('bioProfile.slug', '==', username));
        const snap = await getDocs(q);
        if (snap.empty) { setNotFound(true); setLoading(false); return; }
        const data = snap.docs[0].data();
        const uid = snap.docs[0].id;
        setProfile({ ...data.bioProfile, uid: data.snapMenuUid || uid });
      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#000', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
      Ładowanie...
    </div>
  );

  if (notFound) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#000', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif", gap: '12px' }}>
      <div style={{ fontSize: '48px' }}>404</div>
      <p>Nie znaleziono profilu <strong style={{ color: 'white' }}>/{username}</strong></p>
      <a href="https://bio.getsnap.space" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textDecoration: 'underline', marginTop: '8px' }}>Utwórz swój SnapBio →</a>
    </div>
  );

  const themeId = profile.theme || 'dark';
  const themeData = THEMES.find(t => t.id === themeId) || THEMES[0];
  const accent = profile.accentColor || themeData.accent;
  const fontFamily = profile.font || 'Inter';
  const isLight = themeData.bg > '#888888';
  const linkTextColor = isLight ? '#111' : themeData.btnText || '#000';

  // Determine if accent is light or dark for button text
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return { r, g, b };
  };
  const luminance = (hex) => {
    if (!hex || hex.length < 7) return 0;
    const { r, g, b } = hexToRgb(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };
  const btnTextColor = luminance(accent) > 140 ? '#000' : '#fff';

  const pageStyle = {
    background: themeData.bg,
    minHeight: '100vh',
    fontFamily: `'${fontFamily}', sans-serif`,
    color: themeData.text,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 16px 60px',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
  };

  return (
    <>
      {/* Inject Google Fonts for chosen font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;600;700&display=swap');`}</style>

      <div style={pageStyle}>
        <div style={cardStyle}>
          {/* Avatar */}
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            background: profile.avatarUrl ? `url(${profile.avatarUrl}) center/cover no-repeat` : `linear-gradient(135deg, ${accent}55, ${accent}99)`,
            border: `3px solid ${accent}55`,
            marginBottom: '14px',
            flexShrink: 0,
            boxShadow: `0 8px 32px ${accent}33`,
          }} />

          {/* Name */}
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px', textAlign: 'center', color: themeData.text }}>
            {profile.name || username}
          </h1>

          {/* Bio */}
          {profile.bio && (
            <p style={{ fontSize: '14px', color: themeData.text + 'aa', textAlign: 'center', marginBottom: '28px', maxWidth: '320px', lineHeight: 1.5 }}>
              {profile.bio}
            </p>
          )}
          {!profile.bio && <div style={{ marginBottom: '28px' }} />}

          {/* Links */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(profile.links || []).filter(l => l.title).map((link, i) => {
              if (link.type === 'header') {
                return (
                  <h3 key={link.id || i} style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: '24px',
                    marginBottom: '8px',
                    color: themeData.text,
                    width: '100%'
                  }}>
                    {link.title}
                  </h3>
                );
              }
              
              if (link.type === 'snapmenu') {
                return (
                  <a
                    key={link.id || i}
                    href={`https://menu.getsnap.space/menu.html?id=${profile.uid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '24px',
                      borderRadius: '20px',
                      background: `linear-gradient(145deg, ${accent}dd, ${accent}88), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop') center/cover`,
                      color: btnTextColor,
                      textDecoration: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: `0 8px 32px ${accent}66`,
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      animationDelay: `${i * 0.07}s`,
                      marginTop: '8px',
                      marginBottom: '8px',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${accent}88`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px ${accent}66`; }}
                    className="animate-fade-up"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <span style={{ fontSize: '32px' }}>🍽️</span>
                      <span style={{ 
                        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', padding: '4px 10px', 
                        borderRadius: '99px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff' 
                      }}>
                        Menu Cyfrowe
                      </span>
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800 }}>{link.title || 'Odkryj Nasze Menu'}</h3>
                      <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, lineHeight: 1.4 }}>Przeglądaj dania, sprawdzaj alergeny i zamawiaj prosto ze swojego telefonu.</p>
                    </div>
                  </a>
                );
              }

              if (!link.url) return null;

              let finalUrl = link.url;
              if (finalUrl && !finalUrl.match(/^https?:\/\//)) {
                finalUrl = `https://${finalUrl}`;
              }

              return (
                <a
                  key={link.id || i}
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    background: accent,
                    color: btnTextColor,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: `0 4px 16px ${accent}44`,
                    animationDelay: `${i * 0.07}s`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}66`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${accent}44`; }}
                >
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{link.icon || '🌐'}</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>{link.title}</span>
                </a>
              );
            })}
          </div>

          {/* Empty state */}
          {(!profile.links || profile.links.filter(l => l.title && l.url).length === 0) && (
            <div style={{ textAlign: 'center', color: themeData.text + '44', fontSize: '14px', padding: '32px' }}>
              Ten profil nie ma jeszcze żadnych linków.
            </div>
          )}

          {/* Footer — Ecosystem branding */}
          <div style={{ marginTop: '6rem', paddingTop: '2rem', textAlign: 'center', opacity: 0.6, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>
              Bio napędza <a href="https://bio.getsnap.space" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: 'inherit', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.3)', textUnderlineOffset: '4px' }}>SnapBio</a> 
              {' '}od <a href="https://getsnap.space" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: 'inherit', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.3)', textUnderlineOffset: '4px' }}>Snap Code Studio</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
