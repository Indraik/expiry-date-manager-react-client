import { Clock, LogIn, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => setActiveTab('home')}>
        <div className="brand-icon">
          <Clock size={20} />
        </div>
        <span className="brand-text">Expiry Manager</span>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button
          className={`nav-item ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('home');
            setTimeout(() => {
              document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }}
        >
          Features
        </button>

        {isAuthenticated && (
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        )}
      </nav>

      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <div className="user-badge">
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <span className="user-name">{user?.name || 'User'}</span>
            </div>

            {activeTab !== 'dashboard' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
            )}

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                logout();
                setActiveTab('home');
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('login')}
            >
              <LogIn size={16} />
              Log In
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('register')}
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </header>
  );
}
