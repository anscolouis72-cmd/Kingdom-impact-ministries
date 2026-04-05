import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

const SignUp = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [verificationToken, setVerificationToken] = useState('');
  const [step, setStep] = useState('signup'); // 'signup' or 'verify'
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('http://192.168.8.165:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }
      
      setSignupEmail(formData.email);
      setSuccessMessage(data.message || `Account created! A verification email has been sent to ${formData.email}. Check your email and enter the verification code below.`);
      setStep('verify');
    } catch (err) {
      setError("Failed to connect to the database server. Ensure the backend is running.");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!verificationToken.trim()) {
      setError('Please enter the verification code');
      return;
    }
    
    try {
      const response = await fetch('http://192.168.8.165:5000/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          token: verificationToken
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }
      
      setSuccessMessage('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError("Failed to verify email. Please check your connection.");
    }
  };

  if (step === 'verify') {
    return (
      <main className="container section animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '3rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '200px', height: '200px', background: 'var(--accent-main)', filter: 'blur(80px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }}></div>

          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--accent-light)', color: 'var(--accent-main)', padding: '1rem', borderRadius: '50%' }}>
                <Mail size={32} />
              </div>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Verify Your Email</h1>
            <p style={{ color: 'var(--text-secondary)' }}>We've sent a verification code to <strong>{signupEmail}</strong>. Please check your email and enter the code below.</p>
          </div>

          {successMessage && (
            <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={20} />
              {successMessage}
            </div>
          )}

          {error && (
            <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Verification Code</label>
              <input 
                type="text" 
                placeholder="Enter the code from your email" 
                required 
                value={verificationToken} 
                onChange={(e) => setVerificationToken(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', textAlign: 'center', fontFamily: 'monospace', letterSpacing: '0.1em' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
              Verify Email <CheckCircle size={20} />
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Didn't receive the code? <button type="button" onClick={() => { setStep('signup'); setFormData({ name: '', email: '', password: '' }); setVerificationToken(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-main)', fontWeight: 600, cursor: 'pointer' }}>Sign up again</button>
            </p>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="container section animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '3rem 2.5rem', position: 'relative', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '200px', height: '200px', background: 'var(--accent-main)', filter: 'blur(80px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--accent-light)', color: 'var(--accent-main)', padding: '1rem', borderRadius: '50%' }}>
              <BookOpen size={32} />
            </div>
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Join the Kingdom</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create an account to stay connected with our community and access exclusive materials.</p>
        </div>

        {error && (
          <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="John Doe" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }} />
              <input type="email" placeholder="john@example.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password (min 6 characters)</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }} />
              <input type="password" placeholder="••••••••" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
            Create Account <ArrowRight size={20} />
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-main)', fontWeight: 600 }}>Sign In here</Link>
          </p>
        </form>

      </div>
    </main>
  );
};

export default SignUp;
