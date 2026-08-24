import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Mail, Lock, Eye, EyeOff, CheckCircle2, Sparkles, ShieldCheck, Bell } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.errors?.[0]?.msg || data.message || 'Login failed.');
      }
      if (data.token) localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <aside className="auth-side">
        <div className="auth-side-blob auth-side-blob-1" />
        <div className="auth-side-blob auth-side-blob-2" />
        <div className="auth-side-content">
          <div className="auth-side-icon">
            <Clock size={36} />
          </div>
          <h2>Welcome Back!</h2>
          <p>
            Track your expiry dates, reduce waste, and stay on top of your inventory — all in one place.
          </p>
          <div className="auth-side-features">
            <div className="auth-side-feat"><CheckCircle2 size={16} /> Barcode & QR scanning</div>
            <div className="auth-side-feat"><Sparkles size={16} /> Smart expiry status badges</div>
            <div className="auth-side-feat"><Bell size={16} /> Expiry filter &amp; date range alerts</div>
            <div className="auth-side-feat"><ShieldCheck size={16} /> Secure JWT authentication</div>
          </div>
        </div>
      </aside>

      {/* Right form area */}
      <div className="auth-form-area">
        <div className="auth-box">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <Clock size={22} />
            </div>
            <span className="auth-logo-text">Expiry<span>Manager</span></span>
          </Link>

          <h1 className="auth-heading">Sign In</h1>
          <p className="auth-sub">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>

          {error && (
            <div className="form-error" role="alert">
              <ShieldCheck size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <div className="form-control-icon-wrap">
                <Mail size={16} className="form-control-icon" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-control"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="form-control-icon-wrap" style={{ position: 'relative' }}>
                <Lock size={16} className="form-control-icon" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="••••••••"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', padding: '.2rem', background: 'none', border: 'none', cursor: 'pointer' }}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
              <a href="#" style={{ fontSize: '.82rem', color: 'var(--accent)', fontWeight: 600 }}>Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '.8rem', fontSize: '.95rem' }}
            >
              {isLoading ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            By signing in, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
