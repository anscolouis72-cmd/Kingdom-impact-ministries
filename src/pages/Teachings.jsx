import React, { useState, useEffect } from 'react';
import { BookOpen, Edit, Trash2, Plus, Play } from 'lucide-react';

const Teachings = () => {
  const [teachings, setTeachings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
                  <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--accent-main)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Play size={16} /> Watch
                  </a>
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
    </main>
  );
};

export default Teachings;
