import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, LogOut, User, LayoutDashboard } from 'lucide-react';

const Header = ({ loggedIn = false }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <header className="navbar fade-in">
      <Link to={loggedIn ? '/dashboard' : '/'} className="brand">
        <div className="brand-icon">
          <Clock size={20} />
        </div>
        <span className="brand-text">ExpiryManager</span>
      </Link>

      <div className="nav-actions">
        {loggedIn ? (
          <>
            <Link to="/dashboard" className="nav-item">
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
                padding: '.4rem .8rem',
                borderRadius: 'var(--r-sm)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                fontSize: '.85rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}
            >
              <User size={15} />
              <span style={{ display: 'none' }} className="sm-show">My Account</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <LogOut size={15} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
