import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import './Landing.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="Logo" />
          <span>TestBharti</span>
        </div>
        <div className="nav-links">
          <button className="login-btn" onClick={() => navigate('/admin')}>Login</button>
        </div>
      </nav>

      <div style={{ padding: '120px 5% 80px', minHeight: '80vh' }}>
        <div className="policy-content animate-pop-in" style={{ 
          padding: '50px', 
          maxWidth: '1000px', 
          margin: '0 auto',
          background: 'var(--white)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(107, 70, 193, 0.08)',
          border: '1px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative abstract shape */}
          <div className="abstract-shape" style={{ top: '-10%', right: '-10%', opacity: '0.5' }}></div>
          
          <h1 className="animate-pop-in" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '40px', position: 'relative', zIndex: 1 }}>Privacy Policy</h1>
          
          <section className="animate-on-scroll" style={{ marginBottom: '50px', position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '25px', background: 'var(--bg-light)', borderRadius: '15px', borderLeft: '4px solid var(--primary-color)' }}>
              <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-dark)' }}>
                TechBharti Solutions is committed to protecting user data and privacy. We collect only necessary information 
                such as name, email, and usage data to provide and improve our services.
              </p>
            </div>
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-dark)', marginTop: '20px', padding: '0 10px' }}>
              All data is stored securely and handled in compliance with applicable Indian laws. We integrate only with 
              trusted third-party payment gateways and analytics providers. User data is never sold or shared for 
              advertising purposes.
            </p>
          </section>

          <button 
            className="animate-on-scroll primary-cta"
            onClick={() => navigate('/')}
            style={{ position: 'relative', zIndex: 1 }}
          >
            ← Back to Home
          </button>
        </div>
      </div>

      <footer className="landing-footer" style={{ marginTop: 'auto' }}>
        <div className="footer-bottom" style={{ justifyContent: 'center' }}>
          <p>&copy; 2026 designed by Tech Creature Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
