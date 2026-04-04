import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, LogOut } from 'lucide-react';

const AdminDashboard = ({ adminId, adminName, setAdminId, setAdminName }) => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [searchParams] = useSearchParams();
  
  const [announcements, setAnnouncements] = useState([]);
  const [media, setMedia] = useState([]);
  const [teachings, setTeachings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    image: null,
    images: [],
    videoFile: null,
    type: '',
    videoUrl: '',
    series: '',
    duration: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminId && !localStorage.getItem('adminId')) {
      navigate('/admin/login');
      return;
    }
    
    const editType = searchParams.get('edit');
    if (editType && ['announcements', 'media', 'teachings'].includes(editType)) {
      setActiveTab(editType);
    }
    
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [announcementsRes, mediaRes, teachingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/announcements'),
        fetch('http://localhost:5000/api/media'),
        fetch('http://localhost:5000/api/teachings')
      ]);

      if (!announcementsRes.ok) throw new Error('Failed to fetch announcements');
      if (!mediaRes.ok) throw new Error('Failed to fetch media');
      if (!teachingsRes.ok) throw new Error('Failed to fetch teachings');

      const announcementsData = await announcementsRes.json();
      const mediaData = await mediaRes.json();
      const teachingsData = await teachingsRes.json();

      setAnnouncements(announcementsData);
      setMedia(mediaData);
      setTeachings(teachingsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage(`Error loading data: ${error.message}`);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'images') {
        // Handle multiple images
        const fileList = Array.from(files);
        setFormData(prev => ({ ...prev, images: fileList }));
        
        // Create previews for all images
        const previews = [];
        fileList.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            previews.push(reader.result);
            if (previews.length === fileList.length) {
              setImagePreviews(previews);
            }
          };
          reader.readAsDataURL(file);
        });
      } else {
        const file = files[0];
        setFormData(prev => ({ ...prev, [name]: file }));
        if (file) {
          if (name === 'image') {
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
          } else if (name === 'videoFile') {
            setVideoPreview(file.name);
          }
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'announcements') {
      await submitAnnouncement();
    } else if (activeTab === 'media') {
      await submitMedia();
    } else if (activeTab === 'teachings') {
      await submitTeaching();
    }
  };

  const submitAnnouncement = async () => {
    if (!formData.title || !formData.description || !formData.date) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      const currentAdminId = adminId || localStorage.getItem('adminId');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/api/announcements/${editingId}`
        : 'http://localhost:5000/api/announcements';
      
      const payloadData = new FormData();
      payloadData.append('title', formData.title);
      payloadData.append('description', formData.description);
      payloadData.append('date', formData.date);
      if (formData.image) {
        payloadData.append('image', formData.image);
      }
      if (!editingId) {
        payloadData.append('adminId', currentAdminId);
      }

      const response = await fetch(url, {
        method,
        body: payloadData
      });

      if (!response.ok) {
        try {
          const responseText = await response.text();
          try {
            const error = JSON.parse(responseText);
            setMessage(error.error || 'Error saving announcement');
          } catch {
            setMessage(`Error saving announcement: ${response.status}`);
          }
        } catch (err) {
          setMessage('Error saving announcement: Network error');
        }
        return;
      }

      setMessage(editingId ? 'Announcement updated!' : 'Announcement created!');
      resetForm();
      setTimeout(() => {
        setMessage('');
        fetchAllData();
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Connection error: ${error.message}`);
    }
  };

  const submitMedia = async () => {
    if (!formData.title || !formData.type) {
      setMessage('Please fill in title and type');
      return;
    }

    if (!formData.videoFile && !formData.videoUrl) {
      setMessage('Please provide a video file or video URL');
      return;
    }

    try {
      const currentAdminId = adminId || localStorage.getItem('adminId');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/api/media/${editingId}`
        : 'http://localhost:5000/api/media';
      
      const payloadData = new FormData();
      payloadData.append('title', formData.title);
      payloadData.append('type', formData.type);
      payloadData.append('description', formData.description);
      if (formData.videoUrl && !formData.videoFile) {
        payloadData.append('videoUrl', formData.videoUrl);
      }
      if (formData.image) {
        payloadData.append('thumbnail', formData.image);
      }
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((img, index) => {
          payloadData.append(`images`, img);
        });
      }
      if (formData.videoFile) {
        payloadData.append('videoFile', formData.videoFile);
      }
      if (!editingId) {
        payloadData.append('adminId', currentAdminId);
      }

      const response = await fetch(url, {
        method,
        body: payloadData
      });

      if (!response.ok) {
        try {
          const responseText = await response.text();
          try {
            const error = JSON.parse(responseText);
            setMessage(error.error || 'Error saving media');
          } catch {
            setMessage(`Error saving media: ${response.status}`);
          }
        } catch (err) {
          setMessage('Error saving media: Network error');
        }
        return;
      }

      setMessage(editingId ? 'Media updated!' : 'Media created!');
      resetForm();
      setTimeout(() => {
        setMessage('');
        fetchAllData();
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Connection error: ${error.message}`);
    }
  };

  const submitTeaching = async () => {
    if (!formData.title) {
      setMessage('Please fill in title');
      return;
    }

    if (!formData.videoFile && !formData.videoUrl) {
      setMessage('Please provide a video file or video URL');
      return;
    }

    try {
      const currentAdminId = adminId || localStorage.getItem('adminId');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/api/teachings/${editingId}`
        : 'http://localhost:5000/api/teachings';
      
      const payloadData = new FormData();
      payloadData.append('title', formData.title);
      payloadData.append('series', formData.series);
      payloadData.append('duration', formData.duration);
      payloadData.append('description', formData.description);
      payloadData.append('date', formData.date);
      if (formData.videoUrl && !formData.videoFile) {
        payloadData.append('videoUrl', formData.videoUrl);
      }
      if (formData.videoFile) {
        payloadData.append('videoFile', formData.videoFile);
      }
      if (!editingId) {
        payloadData.append('adminId', currentAdminId);
      }

      const response = await fetch(url, {
        method,
        body: payloadData
      });

      if (!response.ok) {
        try {
          const responseText = await response.text();
          try {
            const error = JSON.parse(responseText);
            setMessage(error.error || 'Error saving teaching');
          } catch {
            setMessage(`Error saving teaching: ${response.status}`);
          }
        } catch (err) {
          setMessage('Error saving teaching: Network error');
        }
        return;
      }

      setMessage(editingId ? 'Teaching updated!' : 'Teaching created!');
      resetForm();
      setTimeout(() => {
        setMessage('');
        fetchAllData();
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Connection error: ${error.message}`);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      date: announcement.date,
      image: null,
      type: '',
      videoUrl: '',
      series: '',
      duration: ''
    });
    setImagePreview(announcement.image || null);
    setShowForm(true);
  };

  const handleEditMedia = (mediaItem) => {
    setEditingId(mediaItem.id);
    setFormData({
      title: mediaItem.title,
      description: mediaItem.description || '',
      date: '',
      image: null,
      videoFile: null,
      type: mediaItem.type,
      videoUrl: mediaItem.videoUrl || '',
      series: '',
      duration: ''
    });
    setImagePreview(mediaItem.thumbnail || null);
    setVideoPreview(null);
    setShowForm(true);
  };

  const handleEditTeaching = (teaching) => {
    setEditingId(teaching.id);
    setFormData({
      title: teaching.title,
      description: teaching.description || '',
      date: teaching.date || '',
      image: null,
      type: '',
      videoUrl: teaching.videoUrl,
      series: teaching.series || '',
      duration: teaching.duration || ''
    });
    setImagePreview(null);
    setShowForm(true);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/announcements/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setMessage('Announcement deleted!');
      setTimeout(() => { setMessage(''); fetchAllData(); }, 1500);
    } catch (error) {
      setMessage('Error deleting announcement');
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Delete this media?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/media/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setMessage('Media deleted!');
      setTimeout(() => { setMessage(''); fetchAllData(); }, 1500);
    } catch (error) {
      setMessage('Error deleting media');
    }
  };

  const handleDeleteTeaching = async (id) => {
    if (!window.confirm('Delete this teaching?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/teachings/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setMessage('Teaching deleted!');
      setTimeout(() => { setMessage(''); fetchAllData(); }, 1500);
    } catch (error) {
      setMessage('Error deleting teaching');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      image: null,
      images: [],
      videoFile: null,
      type: '',
      videoUrl: '',
      series: '',
      duration: ''
    });
    setImagePreview(null);
    setImagePreviews([]);
    setVideoPreview(null);
    setShowForm(false);
    setEditingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('isAdminLoggedIn');
    setAdminId(null);
    setAdminName(null);
    navigate('/admin/login');
  };

  return (
    <main className="container section animate-fade-in" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Message Display */}
      {message && (
        <div style={{ padding: '1rem', marginBottom: '2rem', borderRadius: '8px', background: message.includes('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: message.includes('Error') ? '#ef4444' : '#22c55e' }}>
          {message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome, {adminName || 'Admin'}</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
        {['announcements', 'media', 'teachings'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); resetForm(); }}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid var(--accent-main)' : '3px solid transparent',
              color: activeTab === tab ? 'var(--accent-main)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 500,
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Add New Button */}
      {!showForm && (
        <button 
          onClick={() => { 
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              date: '',
              image: null,
              type: '',
              videoUrl: '',
              series: '',
              duration: ''
            });
            setImagePreview(null);
            setShowForm(true);
          }} 
          style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: '1px solid #22c55e', padding: '0.75rem 1.5rem', borderRadius: '8px', marginBottom: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
        >
          <Plus size={18} /> New {activeTab.slice(0, -1)}
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>
            {editingId ? 'Edit' : 'Create'} {activeTab.slice(0, -1).toUpperCase()}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Title" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }} />
            </div>

            {activeTab !== 'teachings' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" rows="3" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }} />
              </div>
            )}

            {activeTab === 'announcements' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date/Time *</label>
                <input type="text" name="date" value={formData.date} onChange={handleInputChange} placeholder="Oct 15" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
            )}

            {activeTab === 'media' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Type *</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}>
                    <option value="">Select type</option>
                    <option value="Worship">Worship</option>
                    <option value="Event">Event</option>
                    <option value="Music">Music</option>
                    <option value="Vlog">Vlog</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Video File (MP4) *</label>
                  <input type="file" name="videoFile" onChange={handleInputChange} accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }} />
                  {videoPreview && <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-main)' }}>📁 {videoPreview}</p>}
                </div>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>OR</div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Video URL</label>
                  <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://youtu.be/..." style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Gallery Images (Multiple) *</label>
                  <input type="file" name="images" onChange={handleInputChange} accept="image/*" multiple style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }} />
                  {imagePreviews && imagePreviews.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Selected: {imagePreviews.length} image(s)</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                        {imagePreviews.map((preview, index) => (
                          <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '100px', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)' }}>
                            <img src={preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => { 
                              const newImages = formData.images.filter((_, i) => i !== index);
                              const newPreviews = imagePreviews.filter((_, i) => i !== index);
                              setFormData(p => ({ ...p, images: newImages }));
                              setImagePreviews(newPreviews);
                            }} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'teachings' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Series</label>
                    <input type="text" name="series" value={formData.series} onChange={handleInputChange} placeholder="Faith Series" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Duration</label>
                    <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="1h 15m" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                  <input type="text" name="date" value={formData.date} onChange={handleInputChange} placeholder="Oct 8" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Video File (MP4) *</label>
                  <input type="file" name="videoFile" onChange={handleInputChange} accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }} />
                  {videoPreview && <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-main)' }}>📁 {videoPreview}</p>}
                </div>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>OR</div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Video URL</label>
                  <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://youtu.be/..." style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Optional" rows="2" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              </>
            )}

            {(activeTab === 'announcements' || activeTab === 'media') && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image</label>
                <input type="file" name="image" onChange={handleInputChange} accept="image/*" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }} />
                {imagePreview && (
                  <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '150px', marginTop: '1rem', background: 'var(--bg-surface)' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => { setImagePreview(null); setFormData(p => ({ ...p, image: null })); }} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button>
                  </div>
                )}
              </div>
            )}

            {message && (
              <div style={{ padding: '1rem', borderRadius: '8px', background: message.includes('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: message.includes('Error') ? '#ef4444' : '#22c55e' }}>
                {message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" style={{ flex: 1, background: 'var(--accent-main)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lists */}
      {activeTab === 'announcements' && (
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>All Announcements ({announcements.length})</h2>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No announcements yet</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {announcements.map(ann => (
                <div key={ann.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{ann.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>{ann.description.substring(0, 100)}...</p>
                  <p style={{ color: 'var(--accent-main)', margin: '0.5rem 0 0 0', fontWeight: 500 }}>{ann.date}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => handleEditAnnouncement(ann)} style={{ flex: 1, background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => handleDeleteAnnouncement(ann.id)} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'media' && (
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>All Media ({media.length})</h2>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading media...</p>
          ) : media.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No media yet</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {media.map(med => (
                <div key={med.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{med.title}</h3>
                  <p style={{ color: 'var(--accent-main)', margin: '0 0 0.5rem 0' }}>{med.type}</p>
                  <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>{med.description ? med.description.substring(0, 100) : 'No description'}...</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEditMedia(med)} style={{ flex: 1, background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => handleDeleteMedia(med.id)} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'teachings' && (
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>All Teachings ({teachings.length})</h2>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading teachings...</p>
          ) : teachings.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No teachings yet</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '900px' }}>
              {teachings.map(teach => (
                <div key={teach.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{teach.title}</h3>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {teach.series && <span>Series: {teach.series}</span>}
                    {teach.date && <span>Date: {teach.date}</span>}
                    {teach.duration && <span>Duration: {teach.duration}</span>}
                  </div>
                  {teach.description && <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>{teach.description}</p>}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEditTeaching(teach)} style={{ flex: 1, background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => handleDeleteTeaching(teach.id)} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
