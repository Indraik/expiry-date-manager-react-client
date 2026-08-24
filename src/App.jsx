import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import './App.css';

function MainApp() {
  // 'home' is the default Landing Page view
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'home' && <LandingPage setActiveTab={setActiveTab} />}
        {activeTab === 'login' && <LoginPage setActiveTab={setActiveTab} />}
        {activeTab === 'register' && <RegisterPage setActiveTab={setActiveTab} />}
        {activeTab === 'dashboard' && <DashboardPage />}
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Expiry Date Manager. Smart inventory tracking & zero food waste system.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
