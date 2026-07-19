import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import LinkEditor from '../components/LinkEditor';
import ThemeEditor, { THEMES } from '../components/ThemeEditor';
import SlugEditor from '../components/SlugEditor';
import QrWidget from '../components/QrWidget';
import EcosystemWidget from '../components/EcosystemWidget';

const TABS = [
  { id: 'links',    label: 'Linki',    icon: '🔗' },
  { id: 'theme',    label: 'Wygląd',   icon: '🎨' },
  { id: 'settings', label: 'Ustawienia', icon: '⚙️' },
];

const DEFAULT_PROFILE = {
  slug: '',
  name: '',
  bio: '',
  avatarUrl: '',
  theme: 'dark',
  accentColor: '#ffffff',
  font: 'Inter',
  links: [],
  lastSlugChange: null,
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hasSnapMenu, setHasSnapMenu] = useState(false);
  const [snapMenuSlug, setSnapMenuSlug] = useState('');
  const [activeTab, setActiveTab] = useState('links');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  // Local editable state
  const [links, setLinks] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('#ffffff');
  const [font, setFont] = useState('Inter');
  const [buttonStyle, setButtonStyle] = useState('pill');
  const [buttonVariant, setButtonVariant] = useState('filled');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [socials, setSocials] = useState({ instagram: '', tiktok: '', facebook: '', twitter: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { navigate('/'); return; }
      setUser(currentUser);

      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);

      let p = DEFAULT_PROFILE;
      if (snap.exists()) {
        const data = snap.data();
        const bioProfile = data.bioProfile || {};
        p = { ...DEFAULT_PROFILE, ...bioProfile };

        // Check SnapMenu connection - query menuItems subcollection
        try {
          const menuQ = query(collection(db, 'users', currentUser.uid, 'menuItems'), limit(1));
          const menuSnap = await getDocs(menuQ);
          if (!menuSnap.empty) {
            setHasSnapMenu(true);
            setSnapMenuSlug(currentUser.uid);
          }
        } catch {}
      } else {
        // Create initial user doc
        await setDoc(userRef, {
          email: currentUser.email,
          createdAt: new Date().toISOString(),
          bioProfile: { ...DEFAULT_PROFILE, slug: currentUser.uid.substring(0, 12) }
        });
        p = { ...DEFAULT_PROFILE, slug: currentUser.uid.substring(0, 12) };
      }

      setProfile(p);
      setLinks(p.links || []);
      setTheme(p.theme || 'dark');
      setAccentColor(p.accentColor || '#ffffff');
      setFont(p.font || 'Inter');
      setButtonStyle(p.buttonStyle || 'pill');
      setButtonVariant(p.buttonVariant || 'filled');
      setName(p.name || '');
      setBio(p.bio || '');
      setAvatarUrl(p.avatarUrl || '');
      setSocials(p.socials || { instagram: '', tiktok: '', facebook: '', twitter: '' });
    });
    return () => unsubscribe();
  }, [navigate]);

  const save = useCallback(async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const updated = {
        ...profile,
        links,
        theme,
        accentColor,
        font,
        buttonStyle,
        buttonVariant,
        name,
        bio,
        avatarUrl,
        socials,
      };
      await updateDoc(doc(db, 'users', user.uid), { bioProfile: updated });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      alert('Błąd zapisu: ' + e.message);
    } finally {
      setSaving(false);
    }
  }, [user, profile, links, theme, accentColor, font, buttonStyle, buttonVariant, name, bio, avatarUrl, socials]);

  const handleSlugSaved = (newSlug) => {
    setProfile(prev => ({ ...prev, slug: newSlug, lastSlugChange: new Date().toISOString() }));
  };

  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Ładowanie panelu...</div>
    </div>
  );

  const publicUrl = profile.slug ? `https://bio.getsnap.space/${profile.slug}` : null;
  const themeData = THEMES.find(t => t.id === theme) || THEMES[0];

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    try {
      setSaving(true);
      
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
      const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Compute signature: sha1 of timestamp=... + apiSecret
      const str = `timestamp=${timestamp}${apiSecret}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      const result = await res.json();
      if (result.secure_url) {
        setAvatarUrl(result.secure_url);
      } else {
        throw new Error(result.error?.message || 'Błąd uploadu Cloudinary');
      }
    } catch (err) {
      console.error(err);
      alert('Błąd podczas przesyłania zdjęcia: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav>
        <div className="navbar__bar glass animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="logo-wrap">
            <img src="/logo.webp" alt="Logo" className="logo-img" onError={e => e.target.style.display = 'none'} />
            SnapBio
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {publicUrl && (
              <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '6px 14px', fontSize: '13px', textDecoration: 'none' }}>
                Podgląd ↗
              </a>
            )}
            <button onClick={() => signOut(auth)} className="btn btn-secondary"
              style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}>
              Wyloguj
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
        {/* Dashboard Grid */}
        <div className="dashboard-grid animate-fade-up" style={{ animationDelay: '0.2s', alignItems: 'start' }}>

          {/* ========== LEFT: Preview ========== */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span className="input-label">Podgląd na żywo</span>
            </div>
            <div style={{
              background: themeData.bg,
              borderRadius: '40px', // More modern phone frame
              padding: '24px 20px',
              minHeight: '600px',
              border: '8px solid var(--bg-deep)', // Thicker border for phone look
              outline: '1px solid var(--border-light)',
              fontFamily: `'${font}', sans-serif`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'background 0.4s ease',
              position: 'relative'
            }}>
              
              {/* Fake Share Button in Preview */}
              <div style={{
                position: 'absolute', top: '24px', right: '20px',
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeData.text
              }}>
                <span style={{ fontSize: '14px' }}>↗</span>
              </div>

              {/* Avatar */}
              <div style={{
                width: '88px', height: '88px', borderRadius: '50%', // slightly smaller than real for preview
                background: avatarUrl ? `url(${avatarUrl}) center/cover` : `linear-gradient(135deg, ${accentColor}44, ${accentColor}88)`,
                border: `3px solid ${themeData.bg}`,
                boxShadow: `0 0 0 2px ${accentColor}44, 0 8px 24px ${accentColor}33`,
                marginBottom: '14px', flexShrink: 0,
              }} />
              <div style={{ fontWeight: 800, fontSize: '20px', color: themeData.text, marginBottom: '6px', textAlign: 'center', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {name || user?.email?.split('@')[0]}
              </div>
              <div style={{ fontSize: '13px', color: themeData.text, opacity: 0.85, marginBottom: '16px', textAlign: 'center', maxWidth: '200px', lineHeight: 1.4 }}>
                {bio || 'Twój krótki opis...'}
              </div>

              {/* Social Icons Row */}
              {(socials.instagram || socials.tiktok || socials.facebook || socials.twitter) && (
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
                  {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer"><img src="https://www.google.com/s2/favicons?domain=instagram.com&sz=128" alt="" style={{ width: 20, height: 20, borderRadius: 4, filter: themeData.id === 'light' ? 'invert(1)' : 'none' }} /></a>}
                  {socials.tiktok && <a href={socials.tiktok} target="_blank" rel="noopener noreferrer"><img src="https://www.google.com/s2/favicons?domain=tiktok.com&sz=128" alt="" style={{ width: 20, height: 20, borderRadius: 4, filter: themeData.id === 'light' ? 'invert(1)' : 'none' }} /></a>}
                  {socials.facebook && <a href={socials.facebook} target="_blank" rel="noopener noreferrer"><img src="https://www.google.com/s2/favicons?domain=facebook.com&sz=128" alt="" style={{ width: 20, height: 20, borderRadius: 4, filter: themeData.id === 'light' ? 'invert(1)' : 'none' }} /></a>}
                  {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer"><img src="https://www.google.com/s2/favicons?domain=twitter.com&sz=128" alt="" style={{ width: 20, height: 20, borderRadius: 4, filter: themeData.id === 'light' ? 'invert(1)' : 'none' }} /></a>}
                </div>
              )}

              {/* Preview Links */}
              <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '12px', alignContent: 'flex-start' }}>
                {links.slice(0, 5).map((link, i) => {
                  if (link.type === 'header') {
                    return (
                      <div key={link.id} style={{
                        color: themeData.text,
                        fontSize: '16px',
                        fontWeight: 700,
                        textAlign: 'center',
                        marginTop: '16px',
                        marginBottom: '4px',
                        opacity: link.title ? 1 : 0.3,
                        width: '100%',
                        letterSpacing: '-0.02em'
                      }}>
                        {link.title || 'Nagłówek'}
                      </div>
                    );
                  }
                  if (link.type === 'snapmenu') {
                    return (
                      <div key={link.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '16px',
                        borderRadius: '20px',
                        background: `linear-gradient(135deg, ${accentColor}E6, ${accentColor}B3)`,
                        color: themeData.btnText || '#000',
                        position: 'relative',
                        overflow: 'hidden',
                        textAlign: 'left',
                        width: '100%',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <span style={{ fontSize: '24px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>🍽️</span>
                          <span style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', padding: '4px 8px', borderRadius: '99px', fontSize: '9px', fontWeight: 700, color: '#fff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}>MENU CYFROWE</span>
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>{link.title || 'Nasze Menu'}</h3>
                          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9, lineHeight: 1.4, fontWeight: 500 }}>Przeglądaj dania ze smartfona.</p>
                        </div>
                      </div>
                    );
                  }
                  const bRadius = buttonStyle === 'sharp' ? '0px' : (buttonStyle === 'rounded' ? '12px' : '999px');
                  const bBg = buttonVariant === 'outline' ? 'transparent' : accentColor;
                  const bBorder = buttonVariant === 'outline' ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.05)';
                  const bColor = buttonVariant === 'outline' ? themeData.text : (themeData.btnText || '#000');

                  return (
                    <div key={link.id} style={{
                      background: bBg,
                      color: bColor,
                      borderRadius: bRadius,
                      padding: '14px 20px',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      width: link.halfWidth ? 'calc(50% - 6px)' : '100%',
                      boxShadow: buttonVariant === 'outline' ? 'none' : `0 4px 16px ${accentColor}33`,
                      border: bBorder,
                      letterSpacing: '-0.01em'
                    }} className={link.animation ? `anim-${link.animation}` : ''}>
                      <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center' }}>
                        {link.icon && link.icon.startsWith('http') ? (
                          <img src={link.icon} alt="" style={{ width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0 }} />
                        ) : (
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>{link.icon || '🌐'}</span>
                        )}
                      </div>
                      <span style={{ textAlign: 'center', width: '100%', padding: '0 24px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {link.title || 'Mój link'}
                      </span>
                    </div>
                  );
                })}
                {links.length === 0 && (
                  <div style={{ textAlign: 'center', color: themeData.text + '44', fontSize: '12px', padding: '20px', width: '100%' }}>
                    Dodaj linki →
                  </div>
                )}
              </div>

              {/* Preview Footer */}
              <div style={{ marginTop: 'auto', paddingTop: '32px', textAlign: 'center', fontSize: '11px', color: themeData.text + '40', fontWeight: 500 }}>
                SnapBio • Snap Code Studio
              </div>
            </div>

            {/* Profile info below preview */}
            <div className="card" style={{ marginTop: '1rem', padding: '16px' }}>
              <span className="input-label">Profil</span>
              <input type="text" placeholder="Twoja nazwa" value={name} onChange={e => setName(e.target.value)} style={{ marginTop: '8px', marginBottom: '8px' }} />
              <input type="text" placeholder="Krótki opis (bio)" value={bio} onChange={e => setBio(e.target.value)} style={{ marginBottom: '8px' }} />
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Zdjęcie profilowe</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                    background: avatarUrl ? `url(${avatarUrl}) center/cover no-repeat` : 'rgba(255,255,255,0.1)',
                    border: '1px solid var(--border-light)'
                  }} />
                  <label style={{
                    cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)',
                    padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, transition: 'background 0.2s'
                  }}>
                    {saving ? 'Przesyłanie...' : 'Wgraj zdjęcie'}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={saving} />
                  </label>
                  {avatarUrl && (
                    <button type="button" onClick={() => setAvatarUrl('')} style={{ background: 'transparent', border: 'none', color: '#ff453a', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: '8px' }}>
                      Usuń
                    </button>
                  )}
                </div>
              </div>

              {/* Social Icons Setup */}
              <div style={{ marginTop: '20px' }}>
                <span className="input-label">Social Media (Złote ikony pod opisem)</span>
                <input type="url" placeholder="Instagram URL" value={socials.instagram} onChange={e => setSocials({ ...socials, instagram: e.target.value })} style={{ marginTop: '8px', marginBottom: '8px' }} />
                <input type="url" placeholder="TikTok URL" value={socials.tiktok} onChange={e => setSocials({ ...socials, tiktok: e.target.value })} style={{ marginBottom: '8px' }} />
                <input type="url" placeholder="Facebook URL" value={socials.facebook} onChange={e => setSocials({ ...socials, facebook: e.target.value })} style={{ marginBottom: '8px' }} />
                <input type="url" placeholder="Twitter (X) URL" value={socials.twitter} onChange={e => setSocials({ ...socials, twitter: e.target.value })} style={{ marginBottom: '0' }} />
              </div>
            </div>
          </div>

          {/* ========== RIGHT: Editor ========== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '4px', marginBottom: '16px', border: '1px solid var(--border-light)' }}>
              {TABS.map(tab => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '12px', cursor: 'pointer',
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontFamily: 'inherit', fontSize: '14px', fontWeight: activeTab === tab.id ? 600 : 400,
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}>
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Links */}
            {activeTab === 'links' && (
              <div className="card">
                <h3 style={{ marginBottom: '4px' }}>Zarządzaj Linkami</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Przeciągnij ⠿ aby zmienić kolejność. Kliknij emoji aby zmienić ikonę.
                </p>
                <LinkEditor links={links} setLinks={setLinks} hasSnapMenu={hasSnapMenu} />
              </div>
            )}

            {/* Tab: Theme */}
            {activeTab === 'theme' && (
              <div className="card">
                <h3 style={{ marginBottom: '4px' }}>Wygląd Profilu</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Podgląd na żywo po lewej stronie.
                </p>
                <ThemeEditor 
                  theme={theme} setTheme={setTheme} 
                  accentColor={accentColor} setAccentColor={setAccentColor} 
                  font={font} setFont={setFont} 
                  buttonStyle={buttonStyle} setButtonStyle={setButtonStyle}
                  buttonVariant={buttonVariant} setButtonVariant={setButtonVariant}
                />
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Slug */}
                <div className="card">
                  <h3 style={{ marginBottom: '4px' }}>Własny Link</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Dostosuj adres URL swojego profilu.
                  </p>
                  <SlugEditor
                    uid={user?.uid}
                    currentSlug={profile.slug}
                    lastSlugChange={profile.lastSlugChange}
                    onSaved={handleSlugSaved}
                  />
                </div>

                {/* QR Code */}
                {publicUrl && (
                  <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '4px' }}>Kod QR</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      Udostępnij swój profil offline — wydrukuj lub pokaż na ekranie.
                    </p>
                    <QrWidget url={publicUrl} />
                  </div>
                )}

                {/* Ecosystem */}
                <div className="card">
                  <h3 style={{ marginBottom: '1rem' }}>Ekosystem Snap Code</h3>
                  <EcosystemWidget hasSnapMenu={hasSnapMenu} snapMenuSlug={snapMenuSlug} />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div style={{ marginTop: '16px' }}>
              <button onClick={save} disabled={saving} className="btn btn-primary"
                style={{ fontSize: '15px', padding: '16px' }}>
                {saving ? 'Zapisywanie...' : saved ? '✓ Zapisano!' : 'Zapisz zmiany'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
