import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaAndroid, FaApple, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assets/logo.jpg';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    // Simple intersection observer for scroll animations
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

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Approximate navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logo} alt="TestBharti Logo" />
          <span>TestBharti</span>
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <button className="nav-link-btn" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>Home</button>
          <button className="nav-link-btn" onClick={() => { scrollToSection('about'); setIsMobileMenuOpen(false); }}>About</button>
          <button className="nav-link-btn" onClick={() => { scrollToSection('features'); setIsMobileMenuOpen(false); }}>Features</button>
          <button className="nav-link-btn" onClick={() => { scrollToSection('pricing'); setIsMobileMenuOpen(false); }}>Pricing</button>
          <button className="nav-link-btn" onClick={() => { scrollToSection('download'); setIsMobileMenuOpen(false); }}>Download</button>
          <button className="nav-link-btn" onClick={() => { scrollToSection('legal'); setIsMobileMenuOpen(false); }}>Legal</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="animate-pop-in">Building Scalable Technology Platforms for <span className="highlight">Modern India</span></h1>
          <p className="animate-fade-in">
            TechBharti Solutions develops intelligent digital platforms across EdTech, Drone Services,
            LegalTech, AI, Cybersecurity, and Data Analytics—powering the next generation of innovation.
          </p>
          <div className="hero-actions animate-fade-in">
            <button className="primary-cta" onClick={() => navigate('/admin')}>Get Started</button>
            <button onClick={() => scrollToSection('features')} className="secondary-cta">Explore Features</button>
          </div>
        </div>
        <div className="hero-visual animate-float">
          <div className="abstract-shape"></div>
          <img src={logo} alt="TestBharti" className="hero-logo-large" />
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="about-section animate-on-scroll">
        <div className="section-header">
          <h2>About Us</h2>
          <div className="underline"></div>
        </div>
        <div className="about-grid">
          <div className="about-text">
            <h3>TechBharti Solutions</h3>
            <p>
              We are a technology-driven company focused on building scalable digital
              platforms that solve real-world problems across multiple sectors.
            </p>
            <p>
              From EdTech platforms like <strong>TestBharti</strong> to upcoming solutions in Drone-as-a-Service,
              LegalTech, Artificial Intelligence, Cybersecurity, and Data Analytics, we are creating a
              connected ecosystem of technology-driven products.
            </p>
          </div>
          <div className="vision-mission-cards">
            <div className="v-card">
              <h4>Our Vision</h4>
              <p>To build a leading multi-domain technology ecosystem delivering scalable and impactful digital solutions across India.</p>
            </div>
            <div className="v-card">
              <h4>Our Mission</h4>
              <p>To leverage technology, data, and innovation to simplify complex processes and empower individuals, businesses, and institutions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header animate-on-scroll">
          <h2>TestBharti Features</h2>
          <p>The ultimate MCQ-based exam preparation platform</p>
          <div className="underline"></div>
        </div>
        <div className="features-grid">
          <div className="feature-card animate-on-scroll">
            <div className="icon">📚</div>
            <h3>Topic-wise Sets</h3>
            <p>Structured MCQ sets categorized by topics for targeted learning and practice.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <div className="icon">📝</div>
            <h3>Mock Tests</h3>
            <p>Full-length mock tests with real exam simulation to boost your confidence.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <div className="icon">📊</div>
            <h3>Real-time Analytics</h3>
            <p>Get instant performance insights and track your progress over time.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <div className="icon">🛡️</div>
            <h3>Secure Environment</h3>
            <p>Fair and secure exam environment protected by advanced monitoring.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section animate-on-scroll">
        <div className="section-header">
          <h2>Pricing Plans</h2>
          <div className="underline"></div>
        </div>
        <div className="pricing-cards">
          <div className="price-card">
            <h3>Core Plan</h3>
            <div className="price">₹999</div>
            <div className="validity">6 Months Validity</div>
            <ul>
              <li>Access to core MCQ sets</li>
              <li>Limited mock tests</li>
              <li>Basic performance tracking</li>
            </ul>
            <button onClick={() => navigate('/login')}>Choose Plan</button>
          </div>
          <div className="price-card popular">
            <div className="badge">Most Popular</div>
            <h3>Premium Plan</h3>
            <div className="price">₹1799</div>
            <div className="validity">12 Months Validity</div>
            <ul>
              <li>Full MCQ access</li>
              <li>All mock tests</li>
              <li>Advanced analytics & insights</li>
              <li>Continuous content updates</li>
            </ul>
            <button onClick={() => navigate('/admin')}>Choose Plan</button>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section id="download" className="download-section animate-on-scroll">
        <div className="download-container">
          <div className="download-content">
            <h2>Take Your Exams <span className="highlight">On The Go</span></h2>
            <p>Download the TestBharti mobile application for a seamless and focused exam experience. Practice anytime, anywhere.</p>
            <div className="download-btns">
              <a href="#" className="app-btn android">
                <div className="btn-icon"><FaAndroid /></div>
                <div className="btn-text">
                  <span>Download for</span>
                  <strong>Android (.apk)</strong>
                </div>
              </a>
              <a href="#" className="app-btn ios">
                <div className="btn-icon"><FaApple /></div>
                <div className="btn-text">
                  <span>Download for</span>
                  <strong>iOS App Store</strong>
                </div>
              </a>
            </div>
          </div>
          <div className="download-visual">
            <div className="phone-mockup">
              <img src={logo} alt="App Interface" />
            </div>
          </div>
        </div>
      </section>

      {/* Legal Information Section */}
      <section id="legal" className="legal-section">
        <div className="section-header">
          <h2>Legal Information</h2>
          <p>Our commitment to transparency and security</p>
          <div className="underline"></div>
        </div>
        <div className="legal-grid">
          <div className="legal-card">
            <h3>Privacy Policy</h3>
            <p>TechBharti Solutions is committed to protecting user data and privacy. We collect only necessary information such as name, email, and usage data to provide and improve our services.</p>
            <p>All data is stored securely and handled in compliance with applicable Indian laws. We integrate only with trusted third-party payment gateways and analytics providers. User data is never sold or shared for advertising purposes.</p>
          </div>
          <div className="legal-card">
            <h3>Terms & Conditions</h3>
            <p>All platforms, including TestBharti, are owned and operated by TechBharti Solutions. Users are required to comply with all platform rules and guidelines.</p>
            <p>Access to services is provided on a subscription basis. Any misuse, unauthorized access, or violation of terms may result in account suspension or termination and may lead to legal action.</p>
          </div>
          <div className="legal-card">
            <h3>Refund Policy</h3>
            <p>All payments are non-refundable except in cases of verified technical failure or duplicate transactions. Refund requests must be submitted within 7 days of the transaction with appropriate details.</p>
          </div>
          <div className="legal-card">
            <h3>Cancellation Policy</h3>
            <p>Users may cancel their subscription at any time. However, no refund will be provided for any unused period. Access to the platform will remain active until the subscription expiry date.</p>
          </div>
          <div className="legal-card">
            <h3>Intellectual Property</h3>
            <p>All intellectual property, including software, platforms, applications (including TestBharti), and related systems, are the exclusive property of TechBharti Solutions.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="f-logo-wrap">
              <img src={logo} alt="Logo" />
              <h3>TechBharti Solutions</h3>
            </div>
            <p>Developing intelligent digital platforms across EdTech, AI, and Cybersecurity to power the next generation of innovation in Modern India.</p>
            <div className="social-links">
              <span className="social-icon">f</span>
              <span className="social-icon">t</span>
              <span className="social-icon">in</span>
              <span className="social-icon">ig</span>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button></li>
              <li><button onClick={() => scrollToSection('about')}>About Us</button></li>
              <li><button onClick={() => scrollToSection('features')}>Features</button></li>
              <li><button onClick={() => scrollToSection('pricing')}>Pricing Plans</button></li>
              <li><button onClick={() => scrollToSection('download')}>Download App</button></li>
              <li><button onClick={() => scrollToSection('legal')}>Policies</button></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Get In Touch</h4>
            <p><strong>Email:</strong> techbhartisolutions@gmail.com</p>
            <p><strong>Location:</strong> Gujarat, India</p>
            <p><strong>Web:</strong> www.techbhartisolution.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 designed by <a href="http://techcreaturesolution.com" target="_blank" rel="noopener noreferrer" className="designer-link">Tech Creature Solutions</a>. All rights reserved.</p>
          <div className="footer-legal">
            <span onClick={() => navigate('/privacy-policy')} style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span onClick={() => navigate('/terms-conditions')} style={{ cursor: 'pointer' }}>Terms & Conditions</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
