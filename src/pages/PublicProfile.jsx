import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
            width: '104px', height: '104px', borderRadius: '50%',
            background: profile.avatarUrl ? `url(${profile.avatarUrl}) center/cover no-repeat` : `linear-gradient(135deg, ${accent}55, ${accent}99)`,
            border: `4px solid ${themeData.bg}`, // Use background color to create a cutout effect or use accent
            marginBottom: '16px',
            flexShrink: 0,
            boxShadow: `0 0 0 2px ${accent}44, 0 12px 40px ${accent}33`,
            transition: 'transform 0.3s ease',
          }} 
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />

          {/* Name */}
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 800, 
            margin: '0 0 8px', 
            textAlign: 'center', 
            color: themeData.text,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            {profile.name || username}
          </h1>

          {/* Bio */}
          {profile.bio && (
            <div style={{ 
              fontSize: '15px', 
              color: themeData.text, 
              opacity: 0.85, 
              marginBottom: '20px', 
              maxWidth: '400px', 
              textAlign: 'center',
              lineHeight: 1.5,
              fontWeight: 500
            }}>
              {profile.bio}
            </div>
          )}

          {/* Social Icons Row */}
          {(profile.socials?.instagram || profile.socials?.tiktok || profile.socials?.facebook || profile.socials?.twitter) && (
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '32px' }}>
              {profile.socials.instagram && <a href={profile.socials.instagram} target="_blank" rel="noopener noreferrer" style={{ color: themeData.text, opacity: 0.9, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}><Instagram size={28} /></a>}
              {profile.socials.tiktok && <a href={profile.socials.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: themeData.text, opacity: 0.9, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}><Music2 size={28} /></a>}
              {profile.socials.facebook && <a href={profile.socials.facebook} target="_blank" rel="noopener noreferrer" style={{ color: themeData.text, opacity: 0.9, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}><Facebook size={28} /></a>}
              {profile.socials.twitter && <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" style={{ color: themeData.text, opacity: 0.9, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}><Twitter size={28} /></a>}
            </div>
          )}

          {!profile.bio && !profile.socials && <div style={{ marginBottom: '28px' }} />}

          {/* Links */}
          <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '16px', alignContent: 'flex-start' }}>
            {(profile.links || []).filter(l => l.title).map((link, i) => {
              if (link.type === 'header') {
                return (
                  <h3 key={link.id || i} style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: '32px',
                    marginBottom: '8px',
                    color: themeData.text,
                    width: '100%',
                    letterSpacing: '-0.02em'
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
                      padding: '28px',
                      borderRadius: '24px',
                      background: `linear-gradient(135deg, ${accent}E6, ${accent}B3)`,
                      color: btnTextColor,
                      textDecoration: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: `0 12px 32px ${accent}44`,
                      transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                      animationDelay: `${i * 0.07}s`,
                      marginTop: '8px',
                      marginBottom: '8px',
                      textAlign: 'left',
                      width: '100%',
                      border: `1px solid rgba(255,255,255,0.1)`
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 20px 48px ${accent}66`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = `0 12px 32px ${accent}44`; }}
                    className="animate-fade-up"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <span style={{ fontSize: '36px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>🍽️</span>
                      <span style={{ 
                        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', padding: '6px 14px', 
                        borderRadius: '99px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'
                      }}>
                        Menu Cyfrowe
                      </span>
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>{link.title || 'Odkryj Nasze Menu'}</h3>
                      <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, lineHeight: 1.5, fontWeight: 500 }}>Przeglądaj dania, sprawdzaj alergeny i zamawiaj prosto ze swojego telefonu.</p>
                    </div>
                  </a>
                );
              }

              if (!link.url) return null;

              // Bezpieczne parsowanie URL
              let finalUrl = (link.url || '').trim();
              if (finalUrl && !/^https?:\/\//i.test(finalUrl) && !/^(mailto|tel|sms):/i.test(finalUrl)) {
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
                    justifyContent: 'center',
                    padding: '16px 24px',
                    borderRadius: '999px', // Pill shape - Linktree style!
                    background: accent,
                    color: btnTextColor,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    letterSpacing: '-0.01em',
                    transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                    boxShadow: `0 8px 24px ${accent}33`,
                    animationDelay: `${i * 0.07}s`,
                    width: link.halfWidth ? 'calc(50% - 8px)' : '100%',
                    boxSizing: 'border-box',
                    position: 'relative',
                    overflow: 'hidden',
                    border: `1px solid rgba(255,255,255,0.05)`
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 16px 32px ${accent}55`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}33`; }}
                  className={`link-button ${link.animation ? `anim-${link.animation}` : ''}`}
                >
                  <div style={{ position: 'absolute', left: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {link.icon && link.icon.startsWith('http') ? (
                      <img src={link.icon} alt="" style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '24px' }}>{link.icon || '🌐'}</span>
                    )}
                  </div>
                  <span style={{ 
                    textAlign: 'center', 
                    width: '100%', 
                    padding: '0 40px', // leave room for icon
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {link.title}
                  </span>
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
