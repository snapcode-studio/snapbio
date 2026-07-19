import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, limit, query } from 'firebase/firestore';
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
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { navigate('/'); return; }
      setUser(currentUser);

      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);

      let p = DEFAULT_PROFILE;
      if (snap.exists()) {
        const data = snap.data();
        p = { ...DEFAULT_PROFILE, ...(data.bioProfile || {}) };

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
      setName(p.name || '');
      setBio(p.bio || '');
      setAvatarUrl(p.avatarUrl || '');
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
        name,
        bio,
        avatarUrl,
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
  }, [user, profile, links, theme, accentColor, font, name, bio, avatarUrl]);

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
              borderRadius: '32px',
              padding: '24px',
              minHeight: '480px',
              border: '1px solid var(--border-light)',
              fontFamily: `'${font}', sans-serif`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'background 0.4s ease',
            }}>
              {/* Avatar */}
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: avatarUrl ? `url(${avatarUrl}) center/cover` : `linear-gradient(135deg, ${accentColor}44, ${accentColor}88)`,
                border: `3px solid ${accentColor}44`,
                marginBottom: '12px', flexShrink: 0,
              }} />
              <div style={{ fontWeight: 700, fontSize: '18px', color: themeData.text, marginBottom: '4px', textAlign: 'center' }}>
                {name || user?.email?.split('@')[0]}
              </div>
              <div style={{ fontSize: '12px', color: themeData.text + '88', marginBottom: '16px', textAlign: 'center', maxWidth: '200px' }}>
                {bio || 'Twój opis...'}
              </div>

              {/* Preview Links */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {links.slice(0, 5).map(link => {
                  if (link.type === 'header') {
                    return (
                      <div key={link.id} style={{
                        color: themeData.text,
                        fontSize: '15px',
                        fontWeight: 700,
                        textAlign: 'center',
                        marginTop: '12px',
                        marginBottom: '4px',
                        opacity: link.title ? 1 : 0.3,
                      }}>
                        {link.title || 'Nagłówek'}
                      </div>
                    );
                  }
                  if (link.type === 'snapmenu') {
                    return (
                      <div key={link.id} style={{
                        background: accentColor,
                        color: themeData.btnText || '#000',
                        borderRadius: '12px',
                        padding: '12px',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}>
                        <span style={{ fontSize: '18px' }}>🍽️</span>
                        <span>{link.title || 'Nasze Menu'}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={link.id} style={{
                      background: accentColor,
                      color: themeData.btnText || '#000',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: link.title ? 1 : 0.3,
                    }}>
                      <span>{link.icon || '🌐'}</span>
                      <span style={{ flex: 1, textAlign: 'center' }}>{link.title || 'Nowy link'}</span>
                    </div>
                  );
                })}
                {links.length === 0 && (
                  <div style={{ textAlign: 'center', color: themeData.text + '44', fontSize: '12px', padding: '20px' }}>
                    Dodaj linki →
                  </div>
                )}
              </div>

              {/* Preview Footer */}
              <div style={{ marginTop: 'auto', paddingTop: '20px', textAlign: 'center', fontSize: '10px', color: themeData.text + '40' }}>
                SnapBio • Snap Code Studio
              </div>
            </div>

            {/* Profile info below preview */}
            <div className="card" style={{ marginTop: '1rem', padding: '16px' }}>
              <span className="input-label">Profil</span>
              <input type="text" placeholder="Twoja nazwa" value={name} onChange={e => setName(e.target.value)} style={{ marginTop: '8px', marginBottom: '8px' }} />
              <input type="text" placeholder="Krótki opis (bio)" value={bio} onChange={e => setBio(e.target.value)} style={{ marginBottom: '8px' }} />
              <input type="url" placeholder="URL zdjęcia profilowego" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} style={{ marginBottom: 0 }} />
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
                <ThemeEditor theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} font={font} setFont={setFont} />
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
