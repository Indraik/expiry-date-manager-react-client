import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, CheckCircle2, AlertTriangle, XCircle,
  Clock, ShieldCheck, Bell, Zap, Layers, Plus, Package,
  Barcode, Calendar, TrendingDown
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DEMO_DEFAULTS = [
  { id: 1, name: 'Greek Yogurt (Whole Milk)', category: 'Dairy',    daysLeft: 2,  status: 'warning' },
  { id: 2, name: 'Vitamin C 1000mg',          category: 'Medicine', daysLeft: 45, status: 'fresh'   },
  { id: 3, name: 'Artisan Sourdough Bread',   category: 'Bakery',   daysLeft: 0,  status: 'expired' },
];

const statusIcon = (status) => {
  if (status === 'expired') return <XCircle size={16} style={{ color: '#dc2626' }} />;
  if (status === 'warning') return <AlertTriangle size={16} style={{ color: '#d97706' }} />;
  return <CheckCircle2 size={16} style={{ color: '#059669' }} />;
};

const dayLabel = (days) => {
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today!';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

const FEATURES = [
  { icon: <Barcode size={22} />, label: 'Barcode Scanning', color: '#dbeafe', iconColor: '#1d4ed8', desc: 'Scan product barcodes instantly with your camera to auto-fill product details.' },
  { icon: <Bell size={22} />,    label: 'Smart Alerts',    color: '#fef3c7', iconColor: '#d97706', desc: 'Get notified before items expire so you always stay ahead of waste.' },
  { icon: <Package size={22} />, label: 'Full Inventory',  color: '#d1fae5', iconColor: '#059669', desc: 'Track all your groceries, medicines, and household items in one place.' },
  { icon: <TrendingDown size={22} />, label: 'Reduce Waste', color: '#ede9fe', iconColor: '#7c3aed', desc: 'Stop throwing away expired products — save money and the environment.' },
];

const LandingPage = () => {
  const [demoItems, setDemoItems] = useState(DEMO_DEFAULTS);
  const [newName, setNewName] = useState('');
  const [newDays, setNewDays] = useState(5);
  const [newCat, setNewCat] = useState('Groceries');

  const addDemoItem = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const d = parseInt(newDays, 10);
    const status = d <= 0 ? 'expired' : d <= 3 ? 'warning' : 'fresh';
    setDemoItems([{ id: Date.now(), name: newName, category: newCat, daysLeft: d, status }, ...demoItems]);
    setNewName('');
  };

  return (
    <div className="landing-page">
      <Header />

      {/* ── Hero ── */}
      <section className="hero-section fade-in">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />

        <div className="hero-pill">
          <Sparkles size={15} />
          <span>Next-Gen Smart Expiry Tracker</span>
        </div>

        <h1 className="hero-title">
          Never Let Your Supplies <span>Expire Again</span>
        </h1>

        <p className="hero-subtitle">
          Effortlessly track expiration dates for groceries, medications, and household items.
          Reduce waste, save money, and stay organised with automated alerts.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Log in to Dashboard
          </Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat"><CheckCircle2 size={18} /> Barcode Scanning</div>
          <div className="hero-stat"><Bell size={18} /> Smart Notifications</div>
          <div className="hero-stat"><ShieldCheck size={18} /> Secure & Private</div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <h2>Everything You Need</h2>
        <p className="section-sub">Powerful features to help you stay on top of expiry dates effortlessly.</p>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.label}>
              <div className="feature-icon" style={{ background: f.color, color: f.iconColor }}>
                {f.icon}
              </div>
              <h3>{f.label}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section className="demo-section">
        <div className="demo-container">
          <div className="demo-info">
            <h2>See It In Action</h2>
            <p>
              Try the live demo below. Add items and watch the status update in real-time.
              When you're ready, create your free account.
            </p>
            <Link to="/register" className="btn btn-primary">
              Start Tracking Free <ArrowRight size={16} />
            </Link>
          </div>

          <div className="demo-app float-anim">
            <div className="demo-topbar">
              <div className="demo-dot" style={{ background: '#ef4444' }} />
              <div className="demo-dot" style={{ background: '#f59e0b' }} />
              <div className="demo-dot" style={{ background: '#22c55e' }} />
              <div className="demo-title"><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />ExpiryManager — Dashboard</div>
            </div>
            <div className="demo-body">
              <form className="demo-add-form" onSubmit={addDemoItem}>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Product name..."
                  required
                />
                <select value={newCat} onChange={e => setNewCat(e.target.value)}>
                  <option>Groceries</option>
                  <option>Dairy</option>
                  <option>Medicine</option>
                  <option>Bakery</option>
                </select>
                <input
                  type="number"
                  value={newDays}
                  onChange={e => setNewDays(e.target.value)}
                  placeholder="Days"
                  min={-1}
                  style={{ maxWidth: 70 }}
                />
                <button type="submit"><Plus size={13} /> Add</button>
              </form>

              <div className="demo-list">
                {demoItems.map(item => (
                  <div key={item.id} className={`demo-item ${item.status}`}>
                    {statusIcon(item.status)}
                    <div className="demo-item-info">
                      <div className="demo-item-name">{item.name}</div>
                      <div className="demo-item-cat">{item.category}</div>
                    </div>
                    <div className="demo-item-days">{dayLabel(item.daysLeft)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
