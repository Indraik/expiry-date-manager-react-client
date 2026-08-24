import { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  Bell,
  Sparkles,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingDown,
  Layers,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ setActiveTab }) {
  const { isAuthenticated } = useAuth();

  // Interactive Live Demo state
  const [demoItems, setDemoItems] = useState([
    { id: 1, name: 'Greek Yogurt (Whole Milk)', category: 'Dairy', daysLeft: 2, status: 'warning' },
    { id: 2, name: 'Vitamin C 1000mg', category: 'Medicine', daysLeft: 45, status: 'fresh' },
    { id: 3, name: 'Artisan Sourdough Bread', category: 'Bakery', daysLeft: 0, status: 'expired' },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Groceries');
  const [newItemDays, setNewItemDays] = useState(5);

  const handleAddDemoItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    let status = 'fresh';
    const days = parseInt(newItemDays, 10);
    if (days <= 0) status = 'expired';
    else if (days <= 3) status = 'warning';

    const newItem = {
      id: Date.now(),
      name: newItemName,
      category: newItemCategory,
      daysLeft: days,
      status,
    };

    setDemoItems([newItem, ...demoItems]);
    setNewItemName('');
  };

  return (
    <div className="landing-page fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <Sparkles size={16} />
          <span>Next-Gen Smart Expiry Tracker</span>
        </div>

        <h1 className="hero-title">
          Never Let Your Supplies <span>Expire Again</span>
        </h1>

        <p className="hero-subtitle">
          Effortlessly track expiration dates for groceries, medications, and household items. Reduce waste, save money, and stay organized with automated alerts.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <button
              className="btn btn-primary"
              onClick={() => setActiveTab('dashboard')}
            >
              Go to Your Dashboard
              <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary"
                onClick={() => setActiveTab('register')}
              >
                Get Started Free
                <ArrowRight size={18} />
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveTab('login')}
              >
                Sign In to Account
              </button>
            </>
          )}
        </div>

        {/* Interactive Live Demo */}
        <div className="demo-container">
          <div className="demo-header">
            <div className="demo-title">
              <Zap size={20} className="text-emerald" style={{ color: '#059669' }} />
              Live Interactive Preview
            </div>
            <span className="demo-badge">Try Adding an Item Below</span>
          </div>

          <form onSubmit={handleAddDemoItem} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input form-input-no-icon"
              placeholder="e.g. Organic Almond Milk"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={{ flex: '2', minWidth: '200px' }}
            />
            <select
              className="form-input form-input-no-icon"
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              style={{ flex: '1', minWidth: '130px' }}
            >
              <option value="Groceries">Groceries</option>
              <option value="Dairy">Dairy</option>
              <option value="Bakery">Bakery</option>
              <option value="Medicine">Medicine</option>
              <option value="Cosmetics">Cosmetics</option>
            </select>
            <input
              type="number"
              className="form-input form-input-no-icon"
              placeholder="Days left"
              value={newItemDays}
              onChange={(e) => setNewItemDays(e.target.value)}
              style={{ width: '100px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Plus size={16} />
              Add
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {demoItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.98rem', color: '#0f172a' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Category: {item.category}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>
                    {item.daysLeft > 0 ? `${item.daysLeft} days left` : 'Expired'}
                  </span>

                  {item.status === 'fresh' && (
                    <span className="badge badge-fresh">
                      <CheckCircle2 size={14} /> Fresh
                    </span>
                  )}
                  {item.status === 'warning' && (
                    <span className="badge badge-warning">
                      <AlertTriangle size={14} /> Expiring Soon
                    </span>
                  )}
                  {item.status === 'expired' && (
                    <span className="badge badge-expired">
                      <XCircle size={14} /> Expired
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features-section" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Designed for Effortless Management</h2>
            <p className="section-subtitle">
              Powerful tools crafted with an intuitive light-themed interface to keep your kitchen and inventory perfectly organized.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Bell size={24} />
              </div>
              <h3 className="feature-card-title">Proactive Expiry Alerts</h3>
              <p className="feature-card-desc">
                Receive timely visual notifications and warnings before items cross their expiration threshold.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <TrendingDown size={24} />
              </div>
              <h3 className="feature-card-title">Zero Food Waste</h3>
              <p className="feature-card-desc">
                Track consumption habits, minimize unnecessary disposal, and save hundreds on recurring groceries.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Layers size={24} />
              </div>
              <h3 className="feature-card-title">Smart Categorization</h3>
              <p className="feature-card-desc">
                Seamlessly organize products across Dairy, Bakery, Pantry, Medicine, Cosmetics, and Custom tags.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-card-title">Secure & Instant Sync</h3>
              <p className="feature-card-desc">
                Powered by a fast RESTful Express backend with JWT token authentication and cloud MongoDB persistence.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
