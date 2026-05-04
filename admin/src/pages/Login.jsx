import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

import logo from '../assets/logo.jpg';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login }    = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* Background blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      {/* ── Pulsing solid rings ── */}
      <div className="login-ring" style={{ width: 180, height: 180, top: '8%',  left: '4%',  animationDuration: '4s',   animationDelay: '0s'   }} />
      <div className="login-ring" style={{ width: 120, height: 120, top: '55%', left: '2%',  animationDuration: '5.5s', animationDelay: '1s'   }} />
      <div className="login-ring" style={{ width: 200, height: 200, top: '6%',  right: '3%', animationDuration: '5s',   animationDelay: '0.5s' }} />
      <div className="login-ring" style={{ width: 140, height: 140, top: '60%', right: '2%', animationDuration: '4.5s', animationDelay: '1.5s' }} />
      <div className="login-ring" style={{ width: 100, height: 100, bottom: '6%', left: '18%', animationDuration: '6s', animationDelay: '2s'  }} />
      <div className="login-ring" style={{ width: 130, height: 130, bottom: '5%', right:'16%', animationDuration: '5s', animationDelay: '0.8s' }} />

      {/* ── Dashed rotating rings ── */}
      <div className="login-dash-ring"     style={{ width: 240, height: 240, top: '5%',  left: '1%',  animationDuration: '14s' }} />
      <div className="login-dash-ring ccw" style={{ width: 160, height: 160, top: '50%', left: '0%',  animationDuration: '10s' }} />
      <div className="login-dash-ring"     style={{ width: 280, height: 280, top: '2%',  right: '0%', animationDuration: '18s' }} />
      <div className="login-dash-ring ccw" style={{ width: 180, height: 180, top: '55%', right: '0%', animationDuration: '12s' }} />

      {/* ── Twinkling dots ── */}
      <div className="login-dot" style={{ width: 10, height: 10, top: '15%',  left: '22%',  animationDuration: '2.5s', animationDelay: '0s'   }} />
      <div className="login-dot" style={{ width:  7, height:  7, top: '30%',  left: '15%',  animationDuration: '3.2s', animationDelay: '0.7s' }} />
      <div className="login-dot" style={{ width: 12, height: 12, top: '72%',  left: '20%',  animationDuration: '2.8s', animationDelay: '1.2s' }} />
      <div className="login-dot" style={{ width:  8, height:  8, top: '85%',  left: '38%',  animationDuration: '3.5s', animationDelay: '0.3s' }} />
      <div className="login-dot" style={{ width: 11, height: 11, top: '12%',  right: '22%', animationDuration: '2.6s', animationDelay: '1.5s' }} />
      <div className="login-dot" style={{ width:  7, height:  7, top: '40%',  right: '18%', animationDuration: '3.8s', animationDelay: '0.9s' }} />
      <div className="login-dot" style={{ width: 10, height: 10, top: '75%',  right: '22%', animationDuration: '2.9s', animationDelay: '0.4s' }} />
      <div className="login-dot" style={{ width:  9, height:  9, top: '5%',   left: '50%',  animationDuration: '3.1s', animationDelay: '1.8s' }} />
      <div className="login-dot" style={{ width:  6, height:  6, bottom: '12%', left: '45%', animationDuration: '4s',  animationDelay: '0.6s' }} />
      <div className="login-dot" style={{ width: 13, height: 13, bottom: '18%', right:'40%', animationDuration: '3.4s', animationDelay: '1.1s' }} />

      {/* ── Login card ── */}
      <div className="login-card">
        <img src={logo} alt="Logo" className="login-card-logo" />
        <h1>Admin Login</h1>
        <p>Sign in to your dashboard to manage exams</p>

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="form-group">
            <label>Email Address</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mylingo.com"
                required
                className="login-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="login-input"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Sign In
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;
