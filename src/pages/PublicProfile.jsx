import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { THEMES } from '../components/ThemeEditor';
import { Share2 } from 'lucide-react';

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
    
    // Set canonical link for SEO
    let link = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `https://bio.getsnap.space/${username}`;
    
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
  const buttonStyle = profile.buttonStyle || 'pill';
  const buttonVariant = profile.buttonVariant || 'filled';
  
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.name || username} on SnapBio`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Skopiowano link do schowka!');
    }
  };

  return (
    <>
      {/* Inject Google Fonts for chosen font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;600;700;800&display=swap');`}</style>

      <main style={pageStyle}>
        <div style={{ ...cardStyle, position: 'relative' }}>
          {/* Share Button */}
          <button 
            onClick={handleShare}
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.05)',
              color: themeData.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
              zIndex: 10
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
            title="Udostępnij profil"
          >
            <Share2 size={18} />
          </button>

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
            {username === 'snapofficiall' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Oficjalny profil Snap Code Studio" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M10.5213 2.62368C11.3147 1.75231 12.6853 1.75231 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2477 11.3147 22.2477 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2477 11.3147 22.2477 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41554 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75231 12.6853 1.75231 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41554C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z" fill="#0095F6"/>
                <path d="M10.5 14.5L7.5 11.5L8.9 10.1L10.5 11.7L15.1 7.1L16.5 8.5L10.5 14.5Z" fill="white"/>
              </svg>
            )}
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
              {profile.socials.instagram && (() => {
                let url = profile.socials.instagram.trim();
                if (url && !/^https?:\/\//i.test(url) && !/^(mailto|tel|sms):/i.test(url)) url = `https://${url}`;
                return <a href={url} target="_blank" rel="noopener noreferrer" style={{ opacity: 0.9, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}><img src="https://www.google.com/s2/favicons?domain=instagram.com&sz=128" style={{ width: 28, height: 28, borderRadius: 6, filter: themeData.id === 'light' ? 'invert(1)' : 'none' }} alt="Instagram" /></a>;
              })()}
              {profile.socials.tiktok && (() => {
                let url = profile.socials.tiktok.trim();
                if (url && !/^https?:\/\//i.test(url) && !/^(mailto|tel|sms):/i.test(url)) url = `https://${url}`;
                return <a href={url} target="_blank" rel="noopener noreferrer" style={{ opacity: 0.9, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}><img src="https://www.google.com/s2/favicons?domain=tiktok.com&sz=128" style={{ width: 28, height: 28, borderRadius: 6, filter: themeData.id === 'light' ? 'invert(1)' : 'none' }} alt="TikTok" /></a>;
              })()}
              {profile.socials.facebook && (() => {
                let url = profile.socials.facebook.trim();
                if (url && !/^https?:\/\//i.test(url) && !/^(mailto|tel|sms):/i.test(url)) url = `https://${url}`;
                return <a href={url} target="_blank" rel="noopener noreferrer" style={{ opacity: 0.9, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}><img src="https://www.google.com/s2/favicons?domain=facebook.com&sz=128" style={{ width: 28, height: 28, borderRadius: 6, filter: themeData.id === 'light' ? 'invert(1)' : 'none' }} alt="Facebook" /></a>;
              })()}
              {profile.socials.twitter && (() => {
                let url = profile.socials.twitter.trim();
                if (url && !/^https?:\/\//i.test(url) && !/^(mailto|tel|sms):/i.test(url)) url = `https://${url}`;
                return <a href={url} target="_blank" rel="noopener noreferrer" style={{ opacity: 0.9, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}><img src="https://www.google.com/s2/favicons?domain=twitter.com&sz=128" style={{ width: 28, height: 28, borderRadius: 6, filter: themeData.id === 'light' ? 'invert(1)' : 'none' }} alt="Twitter" /></a>;
              })()}
            </div>
          )}

          {!profile.bio && !profile.socials && <div style={{ marginBottom: '28px' }} />}

          {/* Links */}
          <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '16px', alignContent: 'flex-start' }}>
            {(profile.links || []).filter(l => l.title).map((link, i) => {
              if (link.type === 'header') {
                return (
                  <h2 key={link.id || i} style={{
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
                  </h2>
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
                      <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>{link.title || 'Odkryj Nasze Menu'}</h2>
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

              // Styling logic
              const bRadius = buttonStyle === 'sharp' ? '0px' : (buttonStyle === 'rounded' ? '14px' : (buttonStyle === 'pill' ? '999px' : `${buttonStyle}px`));
              const bBg = buttonVariant === 'outline' ? 'transparent' : accent;
              const bBorder = buttonVariant === 'outline' ? `2px solid ${accent}` : `1px solid rgba(255,255,255,0.05)`;
              const bColor = buttonVariant === 'outline' ? themeData.text : btnTextColor;

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
                    borderRadius: bRadius,
                    background: bBg,
                    color: bColor,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    letterSpacing: '-0.01em',
                    transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                    boxShadow: buttonVariant === 'outline' ? 'none' : `0 8px 24px ${accent}33`,
                    animationDelay: `${i * 0.07}s`,
                    width: link.halfWidth ? 'calc(50% - 8px)' : '100%',
                    boxSizing: 'border-box',
                    position: 'relative',
                    overflow: 'hidden',
                    border: bBorder
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; 
                    e.currentTarget.style.boxShadow = buttonVariant === 'outline' ? `0 8px 24px ${accent}22` : `0 16px 32px ${accent}55`; 
                    if (buttonVariant === 'outline') {
                      e.currentTarget.style.background = `${accent}11`;
                    }
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'; 
                    e.currentTarget.style.boxShadow = buttonVariant === 'outline' ? 'none' : `0 8px 24px ${accent}33`; 
                    if (buttonVariant === 'outline') {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
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
      </main>
    </>
  );
}
