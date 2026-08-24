import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, LogOut, User, LayoutDashboard } from 'lucide-react';

const LoggedInHeader = () => {
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
    <header className="navbar">
      <Link to="/dashboard" className="brand">
        <div className="brand-icon">
          <Clock size={20} />
        </div>
        <span className="brand-text">ExpiryManager</span>
      </Link>

      <div className="nav-actions">
        <Link to="/dashboard" className="nav-item active">
          <LayoutDashboard size={16} />
          Dashboard
        </Link>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.5rem',
            padding: '.4rem .85rem',
            borderRadius: 'var(--r-sm)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            fontSize: '.85rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          <User size={15} />
          <span>My Account</span>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: '#dc2626', borderColor: '#fca5a5' }}
          onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; }}
          onMouseOut={e => { e.currentTarget.style.background = ''; }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default LoggedInHeader;
