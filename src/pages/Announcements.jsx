import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/announcements');
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container section animate-fade-in" style={{ minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="title-badge">Stay Updated</span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--text-primary), var(--accent-main))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Church Announcements
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Don't miss out on what God is doing in our midst. Keep up with all the upcoming events, programs, and outreach opportunities.
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No announcements available at this time.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {announcements.map((item) => (
            <div key={item.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              {item.image && (
                <div style={{ borderRadius: '8px', overflow: 'hidden', height: '200px', background: 'var(--bg-surface)' }}>
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
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
    </main>
  );
};

export default Announcements;
