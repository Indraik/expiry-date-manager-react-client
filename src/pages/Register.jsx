import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Mail, Lock, User, Eye, EyeOff, CheckCircle2, Sparkles, ShieldCheck, Bell } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
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
      const response = await fetch('http://localhost:5001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.errors?.[0]?.msg || data.message || 'Registration failed.');
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <aside className="auth-side" style={{ background: 'linear-gradient(145deg, #4f46e5 0%, #059669 100%)' }}>
        <div className="auth-side-blob auth-side-blob-1" />
        <div className="auth-side-blob auth-side-blob-2" />
        <div className="auth-side-content">
          <div className="auth-side-icon">
            <Clock size={36} />
          </div>
          <h2>Start Tracking Today</h2>
          <p>
            Join thousands of users who never waste another product. Sign up free — no credit card needed.
          </p>
          <div className="auth-side-features">
            <div className="auth-side-feat"><CheckCircle2 size={16} /> Free forever plan</div>
            <div className="auth-side-feat"><Sparkles size={16} /> Instant barcode scanning</div>
            <div className="auth-side-feat"><Bell size={16} /> Expiry alerts &amp; filters</div>
            <div className="auth-side-feat"><ShieldCheck size={16} /> Secure JWT auth</div>
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

          <h1 className="auth-heading">Create Account</h1>
          <p className="auth-sub">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          {error && (
            <div className="form-error" role="alert">
              <ShieldCheck size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div className="form-control-icon-wrap">
                <User size={16} className="form-control-icon" />
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="form-control"
                  placeholder="John Smith"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <div className="form-control-icon-wrap">
                <Mail size={16} className="form-control-icon" />
                <input
                  id="reg-email"
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
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="form-control-icon-wrap" style={{ position: 'relative' }}>
                <Lock size={16} className="form-control-icon" />
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="Min. 6 characters"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '.8rem', fontSize: '.95rem', marginTop: '.5rem' }}
            >
              {isLoading ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            By creating an account you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
