import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Radio, PlayCircle, Video, BookOpen, ArrowRight } from 'lucide-react';

const Home = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/announcements');
      const data = await response.json();
      setAnnouncements(data.slice(0, 3)); // Show only first 3 announcements on home page
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="section animate-fade-in" style={{ position: 'relative', overflow: 'hidden', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'var(--accent-main)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'var(--accent-main)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }}></div>
        
        <div className="container animate-fade-in" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <span className="title-badge">Welcome to Kingdom Impact Ministries</span>
          <h1 className="hero-title">
            Experiencing God's Presence & Power
          </h1>
          <p className="hero-subtitle">
            Join our global family as we impact the world through the uncompromised Word of God, fervent prayer, and genuine fellowship.
          </p>
          <div className="hero-buttons">
            <Link to="/live" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Join Live Service <Radio size={20} />
            </Link>
            <button className="btn-primary" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
              Watch Latest Message <PlayCircle size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="title-badge">Updates</span>
              <h2 style={{ fontSize: '2.5rem' }}>Church Announcements</h2>
            </div>
            <Link to="/announcements" style={{ background: 'transparent', border: 'none', color: 'var(--accent-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none' }}>
              View All <ArrowRight size={18} />
            </Link>
          </div>
          
          {loading ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No announcements available at this time.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {announcements.map((item) => (
                <div key={item.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-main)', fontWeight: 500 }}>
                    <Calendar size={18} />
                    <span>{item.date}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Media & Teachings Section */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="title-badge">Resources</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Media & Teachings</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Access our library of messages, worship sessions, and past services to build your faith.</p>
          </div>

          <div className="responsive-grid-2">
            {/* Media Videos */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '240px', background: 'var(--accent-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=600&auto=format&fit=crop" alt="Worship" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, position: 'absolute' }} />
                <Video size={48} style={{ position: 'relative', zIndex: 1 }} />
              </div>
              <div style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Worship Moments</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Experience the powerful moves of God through our high-definition church media videos.</p>
                <button className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Browse Gallery</button>
              </div>
            </div>

            {/* Sunday Teachings */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '240px', background: 'var(--accent-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=600&auto=format&fit=crop" alt="Bible Study" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, position: 'absolute' }} />
                <BookOpen size={48} style={{ position: 'relative', zIndex: 1 }} />
              </div>
              <div style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sunday Teachings</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Catch up on every Sunday sermon. Deepen your understanding of the scripture.</p>
                <button className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Listen to Podcasts</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Streaming Highlight */}
      <section className="section" style={{ background: 'var(--accent-dark)', color: 'white' }}>
        <div className="container responsive-flex">
          <div style={{ maxWidth: '600px' }}>
            <span className="title-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>Live Now</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Join Our Global Online Family</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
              Distance is not a barrier in the realm of the spirit. Stream our services live from absolutely anywhere in the world and encounter God with us.
            </p>
            <Link to="/live" className="btn-primary" style={{ background: 'white', color: 'var(--accent-main)', fontSize: '1.1rem', padding: '1rem 2rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={20} /> Enter Live Room
            </Link>
          </div>
          <div className="live-stream-image-container">
              <img src="https://images.unsplash.com/photo-1544427920-c49ccfbc216d?q=80&w=500&auto=format&fit=crop" alt="Live Streaming" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#ff3b30', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                LIVE
              </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
