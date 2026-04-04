import React, { useState, useEffect } from 'react';
import { BookOpen, Edit, Trash2, Plus, Play, X } from 'lucide-react';

const Teachings = () => {
  const [teachings, setTeachings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const savedAdminId = localStorage.getItem('adminId');
    setIsAdmin(!!savedAdminId);
    
    fetchTeachings();
  }, []);

  const fetchTeachings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teachings');
      const data = await response.json();
      setTeachings(data);
    } catch (error) {
      console.error('Error fetching teachings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teaching?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/teachings/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        alert('Error deleting teaching');
        return;
      }

      setTeachings(teachings.filter(t => t.id !== id));
      alert('Teaching deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Connection error');
    }
  };

  const isLocalVideo = (url) => url && url.startsWith('/uploads/');

  if (loading) {
    return (
      <main className="container section animate-fade-in" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading teachings...</p>
      </main>
    );
  }

  return (
    <main className="container section animate-fade-in" style={{ minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="title-badge">Podcast & Sermons</span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--text-primary), var(--accent-main))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Sunday Teachings
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Build your faith continuously. Stream and download recent messages from the Kingdom Impact sanctuary.
        </p>
      </div>

      {isAdmin && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-main)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 500 }}>
            <Plus size={18} /> Add Teaching
          </a>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {teachings.length > 0 ? (
          teachings.map((item) => (
            <div key={item.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.3s ease', cursor: 'pointer', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flex: 1, minWidth: '250px' }}>
                <div style={{ background: 'var(--accent-light)', color: 'var(--accent-main)', padding: '1rem', borderRadius: '1rem', minWidth: 'fit-content' }}>
                  <BookOpen size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-main)' }}>
                    {item.series && `${item.series} • `}
                    {item.date}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                  {item.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.description}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right', minWidth: '80px' }}>
                  {item.duration}
                </div>
                {item.videoUrl && (
                  isLocalVideo(item.videoUrl) ? (
                    <button onClick={() => setSelectedVideo(item)} style={{ background: 'var(--accent-main)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Play size={16} /> Watch
                    </button>
                  ) : (
                    <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--accent-main)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Play size={16} /> Watch
                    </a>
                  )
                )}
              </div>
              {isAdmin && (
                <div style={{ width: '100%', display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <a href={`/admin/dashboard?edit=teachings&id=${item.id}`} style={{ flex: 1, padding: '0.5rem', background: 'var(--accent-main)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <Edit size={16} /> Edit
                  </a>
                  <button onClick={() => handleDelete(item.id)} style={{ flex: 1, padding: '0.5rem', background: '#ff3b30', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.1rem' }}>No teachings yet. Check back soon!</p>
          </div>
        )}
      </div>

      {selectedVideo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedVideo(null)}>
          <div style={{ position: 'relative', width: '90%', maxWidth: '900px', background: 'var(--bg-surface)', borderRadius: '12px', padding: '2rem', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedVideo(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', zIndex: 10 }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '0.5rem', marginTop: 0 }}>{selectedVideo.title}</h2>
            {selectedVideo.series && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Series: {selectedVideo.series}</p>}
            <div style={{ width: '100%', backgroundColor: 'black', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video 
                key={selectedVideo.id}
                controls 
                autoPlay
                style={{ width: '100%', height: 'auto', maxHeight: '60vh', display: 'block' }}
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('Video playback error:', e);
                  alert('Error playing video. The video format may not be supported by your browser.');
                }}
              >
                <source src={selectedVideo.videoUrl} type="video/mp4" />
                <source src={selectedVideo.videoUrl} type="video/quicktime" />
                <p>Your browser does not support the video tag. Try using a modern browser like Chrome, Firefox, or Safari.</p>
              </video>
            </div>
            {selectedVideo.description && <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{selectedVideo.description}</p>}
          </div>
        </div>
      )}
    </main>
  );
};

export default Teachings;
