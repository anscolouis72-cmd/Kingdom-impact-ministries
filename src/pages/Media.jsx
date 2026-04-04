import React, { useState, useEffect } from 'react';
import { Video, Edit, Trash2, Plus, Play, X } from 'lucide-react';

const Media = ({ adminId }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const savedAdminId = localStorage.getItem('adminId');
    setIsAdmin(!!savedAdminId);
    
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/media');
      const data = await response.json();
      setMedia(data);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/media/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        alert('Error deleting media');
        return;
      }

      setMedia(media.filter(m => m.id !== id));
      alert('Media deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Connection error');
    }
  };

  const isLocalVideo = (url) => url && url.startsWith('/uploads/');

  if (loading) {
    return (
      <main className="container section animate-fade-in" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading media...</p>
      </main>
    );
  }

  return (
    <main className="container section animate-fade-in" style={{ minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="title-badge">Our Gallery</span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--text-primary), var(--accent-main))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Church Media
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Relive glorious moments. Enjoy high definition videos of our worship, special ministrations, and events here.
        </p>
      </div>

      {isAdmin && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-main)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 500 }}>
            <Plus size={18} /> Add Media
          </a>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {media.length > 0 ? (
          media.map((item) => (
            <div key={item.id} className="glass-panel" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s ease', position: 'relative' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ height: '220px', background: 'var(--accent-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                ) : (
                  <>
                    <img src={`https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=600&auto=format&fit=crop&sig=${item.id}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, position: 'absolute' }} />
                    <Video size={48} style={{ position: 'relative', zIndex: 1 }} />
                  </>
                )}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-main)', fontWeight: 'bold', textTransform: 'uppercase' }}>{item.type}</span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                {item.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{item.description}</p>}
                
                {item.videoUrl && (
                  isLocalVideo(item.videoUrl) ? (
                    <button onClick={() => setSelectedVideo(item)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--accent-main)', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500, marginBottom: isAdmin ? '1rem' : 0, width: '100%' }}>
                      <Play size={16} /> Watch Video
                    </button>
                  ) : (
                    <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--accent-main)', color: 'white', padding: '0.75rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500, marginBottom: isAdmin ? '1rem' : 0 }}>
                      <Play size={16} /> Watch Video
                    </a>
                  )
                )}
                
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <a href={`/admin/dashboard?edit=media&id=${item.id}`} style={{ flex: 1, padding: '0.5rem', background: 'var(--accent-main)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <Edit size={16} /> Edit
                    </a>
                    <button onClick={() => handleDelete(item.id)} style={{ flex: 1, padding: '0.5rem', background: '#ff3b30', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.1rem' }}>No media yet. Check back soon!</p>
          </div>
        )}
      </div>

      {selectedVideo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedVideo(null)}>
          <div style={{ position: 'relative', width: '90%', maxWidth: '900px', background: 'var(--bg-surface)', borderRadius: '12px', padding: '2rem', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedVideo(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', zIndex: 10 }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1rem', marginTop: 0 }}>{selectedVideo.title}</h2>
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

export default Media;
