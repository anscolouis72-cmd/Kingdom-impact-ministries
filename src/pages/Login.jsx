import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, BookOpen, AlertCircle } from 'lucide-react';

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');

    try {
      const response = await fetch('http://192.168.8.165:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          setUnverifiedEmail(data.email);
          setError(data.error);
        } else {
          setError(data.error);
        }
        return;
      }
      
      setIsAuthenticated(true);
      alert(`Welcome back, ${data.name}! You are authenticated directly from the Database.`);
      navigate('/home');
    } catch (err) {
      setError("Failed to connect to the database server. Ensure the backend is running.");
    }
  };

  return (
    <main className="container section animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '3rem 2.5rem', position: 'relative', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '200px', height: '200px', background: 'var(--accent-dark)', filter: 'blur(80px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--accent-light)', color: 'var(--accent-main)', padding: '1rem', borderRadius: '50%' }}>
              <BookOpen size={32} />
            </div>
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue connecting and growing with your church family.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {error && (
            <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertCircle size={20} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>{error}</p>
                {unverifiedEmail && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                    <Link to="/signup" style={{ color: '#ef4444', textDecoration: 'underline', fontWeight: 600 }}>Re-verify your email or create a new account</Link>
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }} />
              <input type="email" placeholder="john@example.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--accent-main)', fontWeight: 500 }}>Forgot Password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }} />
              <input type="password" placeholder="••••••••" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
            Secure Sign In <LogIn size={20} />
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            New to Kingdom Impact? <Link to="/signup" style={{ color: 'var(--accent-main)', fontWeight: 600 }}>Create Account</Link>
          </p>
        </form>

      </div>
    </main>
  );
};

export default Login;
