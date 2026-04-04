import React, { useEffect, useState } from 'react';
import { Radio, Calendar, Clock, Info } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  Kingdom Impact Ministries – Apostle Willie Lamptey
const FB_PAGE_URL = 'https://www.facebook.com/ApostleWilliamLamptey';
const FB_PAGE_ID = '111751803793146';
// ─────────────────────────────────────────────────────────────

const serviceSchedule = [
  { day: 'Sunday', label: 'Sunday Service', time: '9:00 AM – 12:00 PM', icon: '🙏' },
  { day: 'Wednesday', label: 'Midweek Bible Study', time: '6:00 PM – 8:00 PM', icon: '📖' },
  { day: 'Friday', label: 'Prayer Night', time: '8:00 PM – 10:00 PM', icon: '🕯️' },
];

const Live = () => {
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Load the Facebook JS SDK
  useEffect(() => {
    if (document.getElementById('facebook-jssdk')) {
      // SDK already present — just re-parse
      if (window.FB) {
        window.FB.XFBML.parse();
        setSdkLoaded(true);
      }
      return;
    }

    window.fbAsyncInit = () => {
      window.FB.init({ xfbml: true, version: 'v19.0' });
      setSdkLoaded(true);
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return (
    <main className="container section animate-fade-in" style={{ minHeight: '80vh' }}>

      {/* ── Page Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="title-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', background: '#ff3b30', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
          Streaming Live
        </span>
        <h1
          style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            background: 'linear-gradient(to right, var(--text-primary), var(--accent-main))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Watch Live Service
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Join us live on Facebook as we worship and encounter God together. No matter where you are, you're welcome here.
        </p>
      </div>

      {/* ── Facebook Live Embed ── */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
        {/* Facebook Page Plugin – videos tab auto-surfaces live stream when active */}
        <div
          style={{
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            minHeight: '500px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <iframe
            src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(FB_PAGE_URL)}&tabs=videos&width=800&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false&appId=${FB_PAGE_ID}`}
            style={{
              width: '100%',
              maxWidth: '800px',
              height: '500px',
              border: 'none',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            title="Kingdom Impact Ministries – Live & Videos"
          />
        </div>

        {/* Info strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          <Radio size={18} style={{ color: 'var(--accent-main)' }} />
          Live on Facebook · Kingdom Impact Ministries (Apostle Willie Lamptey)
        </div>
      </div>

      {/* ── No-Live Fallback Notice ── */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem 2rem',
          marginBottom: '3rem',
          borderLeft: '4px solid var(--accent-main)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        <Radio size={22} style={{ color: 'var(--accent-main)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Not seeing a live stream?</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            We may not be live right now. Check the service schedule below or follow our{' '}
            <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-main)' }}>
              Facebook page
            </a>{' '}
            to get notified when we go live.
          </p>
        </div>
      </div>

      {/* ── Service Schedule ── */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="title-badge">Join Us</span>
        <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>Service Schedule</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        {serviceSchedule.map((service, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'transform 0.3s ease', cursor: 'default' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '2.5rem' }}>{service.icon}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-main)', fontWeight: 600 }}>
              <Calendar size={16} />
              {service.day}
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{service.label}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <Clock size={15} />
              {service.time}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Live;
