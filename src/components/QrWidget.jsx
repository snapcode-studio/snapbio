import { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import html2canvas from 'html2canvas';

export default function QrWidget({ url, label }) {
  const containerRef = useRef(null);
  const qrRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    qrRef.current = new QRCodeStyling({
      width: 280,
      height: 280,
      data: url,
      image: '/favicon-96x96.png',
      dotsOptions: { color: '#0a0a0c', type: 'rounded' },
      backgroundOptions: { color: 'transparent' },
      imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 },
      cornersSquareOptions: { color: '#0a0a0c', type: 'extra-rounded' },
      cornersDotOptions: { color: '#0a0a0c', type: 'dot' },
    });

    containerRef.current.innerHTML = '';
    qrRef.current.append(containerRef.current);
  }, [url]);

  const download = async () => {
    if (!containerRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(containerRef.current, { backgroundColor: '#ffffff', scale: 4, useCORS: true });
      const a = document.createElement('a');
      a.download = 'SnapBio-QR.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  if (!url) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="input-label" style={{ display: 'block', marginBottom: '12px' }}>Kod QR Twojego profilu</span>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '16px', display: 'inline-block', boxShadow: '0 8px 32px rgba(255,255,255,0.08)', marginBottom: '12px' }}>
        <div ref={containerRef} />
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', fontFamily: "'Geist Mono', monospace" }}>{url}</p>
      <button type="button" onClick={download} disabled={downloading} className="btn btn-secondary" style={{ fontSize: '13px', padding: '10px 20px', width: 'auto' }}>
        {downloading ? 'Pobieranie...' : '↓ Pobierz QR'}
      </button>
    </div>
  );
}
