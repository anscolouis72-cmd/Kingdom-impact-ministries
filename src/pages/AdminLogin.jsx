import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, LogIn, CheckCircle } from 'lucide-react';
import API_BASE_URL from '../api';

const AdminLogin = ({ setAdminId, setAdminName }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminCode: '',
    verificationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = isLogin ? '/api/admin/login' : '/api/admin/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password, adminCode: formData.adminCode };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Error');
        return;
      }

      if (!isLogin) {
        // Registration successful but needs verification
        setNeedsVerification(true);
        setVerificationEmail(formData.email);
        setMessage('Account created! Check your email for the verification code.');
        return;
      }

      // Login successful
      localStorage.setItem('adminId', data.id);
      localStorage.setItem('adminName', data.name);
      localStorage.setItem('adminEmail', data.email);
      localStorage.setItem('isAdminLoggedIn', 'true');

      setAdminId(data.id);
      setAdminName(data.name);
      setMessage('Success! Redirecting...');
      
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verificationEmail,
          token: formData.verificationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Error');
        return;
      }

      setMessage('✓ Email verified successfully! You can now log in.');
      setNeedsVerification(false);
      setFormData(prev => ({ ...prev, verificationCode: '', password: '' }));
      setIsLogin(true);
      
    } catch (error) {
      console.error('Error:', error);
      setMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (needsVerification) {
    return (
      <main className="container section animate-fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '450px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--accent-main)' }}>
              <Mail size={48} />
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Verify Your Email</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Check your email for a verification code
            </p>
          </div>

          <form onSubmit={handleVerifyEmail} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>
                A verification code has been sent to:<br />
                <strong style={{ color: 'var(--text-primary)' }}>{verificationEmail}</strong>
              </p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Verification Code</label>
              <input 
                type="text" 
                name="verificationCode" 
                value={formData.verificationCode} 
                onChange={handleChange} 
                placeholder="Enter 6-digit code from email" 
                maxLength="6"
                style={{ 
                  background: 'var(--bg-surface)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '8px', 
                  padding: '0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  letterSpacing: '0.2em',
                  fontWeight: 'bold',
                  outline: 'none'
                }} 
              />
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                Code valid for 24 hours
              </small>
            </div>

            {message && (
              <div style={{ padding: '1rem', borderRadius: '8px', background: message.includes('✓') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: message.includes('✓') ? '#22c55e' : '#ef4444', textAlign: 'center' }}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !formData.verificationCode} 
              style={{ 
                background: 'var(--accent-main)', 
                color: 'white', 
                border: 'none', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                fontWeight: 500, 
                cursor: loading || !formData.verificationCode ? 'not-allowed' : 'pointer', 
                opacity: loading || !formData.verificationCode ? 0.6 : 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem' 
              }}>
              <CheckCircle size={18} /> {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button 
              type="button" 
              onClick={() => { 
                setNeedsVerification(false); 
                setIsLogin(true);
                setMessage('');
              }} 
              style={{ 
                background: 'transparent', 
                color: 'var(--accent-main)', 
                border: '1px solid var(--accent-main)', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                cursor: 'pointer' 
              }}>
              Back to Login
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="container section animate-fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Sign in to manage application activites' : 'Create admin account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.75rem' }}>
                <User size={18} style={{ color: 'var(--accent-main)' }} />
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', flex: 1, outline: 'none' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.75rem' }}>
              <Mail size={18} style={{ color: 'var(--accent-main)' }} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', flex: 1, outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.75rem' }}>
              <Lock size={18} style={{ color: 'var(--accent-main)' }} />
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', flex: 1, outline: 'none' }} />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Admin Code</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.75rem' }}>
                <Lock size={18} style={{ color: 'var(--accent-main)' }} />
                <input type="password" name="adminCode" value={formData.adminCode} onChange={handleChange} placeholder="Enter admin code" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', flex: 1, outline: 'none' }} />
              </div>
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>Contact church leadership for the admin code</small>
            </div>
          )}

          {message && (
            <div style={{ padding: '1rem', borderRadius: '8px', background: message.includes('Success') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: message.includes('Success') ? '#22c55e' : '#ef4444', textAlign: 'center' }}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ background: 'var(--accent-main)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <LogIn size={18} /> {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <button type="button" onClick={() => { setIsLogin(!isLogin); setMessage(''); }} style={{ background: 'transparent', color: 'var(--accent-main)', border: '1px solid var(--accent-main)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default AdminLogin;
