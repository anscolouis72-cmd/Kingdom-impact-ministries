import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, BookOpen, Radio, User, LogOut, Settings } from 'lucide-react';
import Home from './pages/Home.jsx';
import Announcements from './pages/Announcements.jsx';
import Media from './pages/Media.jsx';
import Teachings from './pages/Teachings.jsx';
import Bible from './pages/Bible.jsx';
import Live from './pages/Live.jsx';
import SignUp from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import './index.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminId, setAdminId] = useState(null);
  const [adminName, setAdminName] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize authentication state from localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    // Initialize admin state
    const savedAdminId = localStorage.getItem('adminId');
    const savedAdminName = localStorage.getItem('adminName');
    if (savedAdminId && savedAdminName) {
      setAdminId(savedAdminId);
      setAdminName(savedAdminName);
    }
    
    setIsLoading(false);
  }, []);

  // Save authentication state to localStorage
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  // Initialize theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Redirect to signup if not authenticated and trying to access protected pages
  useEffect(() => {
    if (isLoading) return; // Don't redirect until we've loaded auth state
    const protectedRoutes = ['/home', '/announcements', '/media', '/teachings', '/bible', '/live'];
    if (!isAuthenticated && protectedRoutes.includes(location.pathname)) {
      navigate('/signup');
    }
  }, [isAuthenticated, location.pathname, navigate, isLoading]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container nav-container">
          <Link to={isAuthenticated ? "/home" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', flexShrink: 1 }}>
            <img src="/logo.jpg" alt="KIM Logo" style={{ height: '64px', objectFit: 'contain', borderRadius: '8px' }} />
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>Kingdom Impact Ministries</h1>
          </Link>

          <div className="nav-actions">
            <ul className="nav-links">
              {isAuthenticated && (
                <>
                  <li><Link to="/home" style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>Home</Link></li>
                  <li><Link to="/announcements" style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>Announcements</Link></li>
                  <li><Link to="/media" style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>Media</Link></li>
                  <li><Link to="/teachings" style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>Teachings</Link></li>
                  <li><Link to="/bible" style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><BookOpen size={18} />Bible</Link></li>
                  <li><Link to="/live" style={{ fontWeight: 500, color: 'var(--accent-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: '8px', height: '8px', background: '#ff3b30', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />Live</Link></li>
                </>
              )}
            </ul>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            {!isAuthenticated && (
              adminId ? (
                <Link to="/admin/dashboard" className="btn-primary" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: '1px solid #22c55e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={18} /> Admin Panel
                </Link>
              ) : (
                <Link to="/admin/login" className="btn-primary" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: '1px solid #22c55e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={18} /> Admin
                </Link>
              )
            )}
            {isAuthenticated ? (
              <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('isAuthenticated'); navigate('/signup'); }} className="btn-primary" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
                <LogOut size={18} /> Log Out
              </button>
            ) : !adminId ? (
              <Link to="/signup" className="btn-primary" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', textDecoration: 'none' }}>
                <User size={18} /> Sign Up
              </Link>
            ) : null}
            {isAuthenticated && (
              <Link to="/live" className="btn-primary watch-live-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Radio size={18} /> Watch Live
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content with Routing */}
      <Routes>
        {/* Landing Page - Sign Up */}
        <Route path="/" element={<SignUp setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* Main App Pages - Accessible after authentication */}
        <Route path="/home" element={<Home />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/media" element={<Media />} />
        <Route path="/teachings" element={<Teachings />} />
        <Route path="/bible" element={<Bible />} />
        <Route path="/live" element={<Live />} />
        
        {/* Auth Pages */}
        <Route path="/signup" element={<SignUp setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* Admin Pages */}
        <Route path="/admin/login" element={<AdminLogin setAdminId={setAdminId} setAdminName={setAdminName} />} />
        <Route path="/admin/dashboard" element={<AdminDashboard adminId={adminId} adminName={adminName} setAdminId={setAdminId} setAdminName={setAdminName} />} />
      </Routes>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-secondary)', padding: '4rem 0 2rem 0', borderTop: '1px solid var(--glass-border)', marginTop: '4rem' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <Link to={isAuthenticated ? "/home" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-main)', textDecoration: 'none' }}>
            <img src="/logo.jpg" alt="KIM Logo" style={{ height: '80px', objectFit: 'contain', borderRadius: '8px' }} />
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>Kingdom Impact Ministries</h2>
          </Link>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
            Impacting the world through the knowledge of God and His kingdom.
          </p>
          <div style={{ width: '100%', height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} Kingdom Impact Ministries. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
