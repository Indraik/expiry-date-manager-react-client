import React from 'react';
import { Clock } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <Clock size={18} />
              </div>
              <span className="footer-brand-name">ExpiryManager</span>
            </div>
            <p className="footer-desc">
              The smartest way to manage your inventory, track expiration dates, and reduce waste — at home or in your business.
            </p>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#">Features</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {year} ExpiryManager. All rights reserved.</span>
          <div className="footer-socials">
            <a href="#">Twitter</a>
            <a href="#">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
