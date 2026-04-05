import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Radio, PlayCircle, Video, BookOpen, ArrowRight, Play, Image, X } from 'lucide-react';

const Home = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [media, setMedia] = useState([]);
  const [teachings, setTeachings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [announcementsRes, mediaRes, teachingsRes] = await Promise.all([
        fetch('http://192.168.8.165:5000/api/announcements'),
        fetch('http://192.168.8.165:5000/api/media'),
        fetch('http://192.168.8.165:5000/api/teachings')
      ]);
      
      const announcementsData = await announcementsRes.json();
      const mediaData = await mediaRes.json();
      const teachingsData = await teachingsRes.json();
      
      setAnnouncements(announcementsData.slice(0, 3));
      setMedia(mediaData.slice(0, 3));
      setTeachings(teachingsData.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLocalVideo = (url) => url && url.startsWith('/uploads/');

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const response = await fetch(`http://192.168.8.165:5000/api/${type}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        alert(`Error deleting ${type}`);
        return;
      }

      if (type === 'media') {
        setMedia(media.filter(m => m.id !== id));
      } else if (type === 'teachings') {
        setTeachings(teachings.filter(t => t.id !== id));
      }
      alert(`${type} deleted successfully`);
    } catch (error) {
      console.error('Error:', error);
      alert('Connection error');
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="title-badge">Resources</span>
              <h2 style={{ fontSize: '2.5rem' }}>Latest Media & Teachings</h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/media" style={{ background: 'transparent', border: 'none', color: 'var(--accent-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none' }}>
                View All Media <ArrowRight size={18} />
              </Link>
              <Link to="/teachings" style={{ background: 'transparent', border: 'none', color: 'var(--accent-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none' }}>
                View All Teachings <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading media and teachings...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Media Items */}
              {media.map((item) => (
                <div key={`media-${item.id}`} className="glass-panel" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s ease', position: 'relative' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
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
                    
                    {/* Gallery Images Grid */}
                    {item.gallery_images && (
                      (() => {
                        try {
                          const galleryImages = typeof item.gallery_images === 'string' ? JSON.parse(item.gallery_images) : item.gallery_images;
                          return galleryImages && galleryImages.length > 0 ? (
                            <div>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                                <Image size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> Gallery ({galleryImages.length} images)
                              </p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '0.3rem', marginBottom: '1rem' }}>
                                {galleryImages.slice(0, 4).map((imgPath, idx) => (
                                  <div key={idx} style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                    <img src={imgPath} alt={`Gallery ${idx + 1}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null;
                        } catch (e) {
                          return null;
                        }
                      })()
                    )}
                    
                    {item.videoUrl && (
                      isLocalVideo(item.videoUrl) ? (
                        <button onClick={() => setSelectedVideo(item)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--accent-main)', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500, width: '100%' }}>
                          <Play size={16} /> Watch Video
                        </button>
                      ) : (
                        <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--accent-main)', color: 'white', padding: '0.75rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>
                          <Play size={16} /> Watch Video
                        </a>
                      )
                    )}
                  </div>
                </div>
              ))}

              {/* Teaching Items */}
              {teachings.map((item) => (
                <div key={`teaching-${item.id}`} className="glass-panel" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ height: '220px', background: 'var(--accent-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
                    <img src={`https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=600&auto=format&fit=crop&sig=${item.id}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, position: 'absolute' }} />
                    <BookOpen size={48} style={{ position: 'relative', zIndex: 1 }} />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-main)', fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.series}</p>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                    {item.date && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{item.date}</p>}
                    {item.duration && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{item.duration}</p>}
                    {item.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{item.description}</p>}
                    
                    {item.videoUrl && (
                      isLocalVideo(item.videoUrl) ? (
                        <button onClick={() => setSelectedVideo(item)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--accent-main)', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500, width: '100%' }}>
                          <Play size={16} /> Listen Now
                        </button>
                      ) : (
                        <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--accent-main)', color: 'white', padding: '0.75rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>
                          <Play size={16} /> Listen Now
                        </a>
                      )
                    )}
                  </div>
                </div>
              ))}

              {media.length === 0 && teachings.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '1.1rem' }}>No media or teachings available yet. Check back soon!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
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
