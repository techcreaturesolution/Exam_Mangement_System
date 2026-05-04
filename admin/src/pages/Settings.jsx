import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  FiUser, FiMail, FiShield, FiLock, FiEye, FiEyeOff,
  FiSave, FiDroplet, FiType
} from 'react-icons/fi';

const Settings = () => {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [branding, setBranding] = useState({
    appName: 'TestBharti',
    primaryColor: '#6B46C1',
    accentColor: '#9F7AEA',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="settings-grid">

        {/* ── Admin Profile Card ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiUser />
            </div>
            <div>
              <h2 className="settings-card-title">Admin Profile</h2>
              <p className="settings-card-subtitle">Your account information</p>
            </div>
          </div>

          <div className="profile-avatar-row">
            <div className="profile-avatar">
              {getInitials(user?.name)}
            </div>
            <div className="profile-meta">
              <span className="profile-name">{user?.name || 'Admin'}</span>
              <span className="profile-role-badge">Super Admin</span>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-item">
              <span className="profile-info-icon"><FiUser /></span>
              <div>
                <span className="profile-info-label">Full Name</span>
                <span className="profile-info-value">{user?.name || '—'}</span>
              </div>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-icon"><FiMail /></span>
              <div>
                <span className="profile-info-label">Email Address</span>
                <span className="profile-info-value">{user?.email || '—'}</span>
              </div>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-icon"><FiShield /></span>
              <div>
                <span className="profile-info-label">Role</span>
                <span className="profile-info-value">Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Change Password Card ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiLock />
            </div>
            <div>
              <h2 className="settings-card-title">Change Password</h2>
              <p className="settings-card-subtitle">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="settings-form">
            {/* Current Password */}
            <div className="form-group">
              <label>Current Password</label>
              <div className="input-with-icon">
                <input
                  type={showPwd.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPwd({ ...showPwd, current: !showPwd.current })}
                >
                  {showPwd.current ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <input
                  type={showPwd.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPwd({ ...showPwd, new: !showPwd.new })}
                >
                  {showPwd.new ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <input
                  type={showPwd.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  required
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })}
                >
                  {showPwd.confirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Password strength hint */}
            {passwordForm.newPassword && (
              <div className={`pwd-strength ${passwordForm.newPassword.length >= 8 ? 'strong' : 'weak'}`}>
                {passwordForm.newPassword.length >= 8 ? '✓ Strong password' : '⚠ Use at least 8 characters'}
              </div>
            )}

            <button type="submit" className="btn btn-primary settings-submit-btn">
              <FiLock /> Update Password
            </button>
          </form>
        </div>

        {/* ── Branding Card ── */}
        <div className="settings-card settings-card-full">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiDroplet />
            </div>
            <div>
              <h2 className="settings-card-title">Branding</h2>
              <p className="settings-card-subtitle">Customize your application appearance</p>
            </div>
          </div>

          <div className="branding-grid">
            {/* App Name */}
            <div className="form-group">
              <label><FiType style={{ marginRight: 6, verticalAlign: 'middle' }} />Application Name</label>
              <input
                type="text"
                value={branding.appName}
                onChange={(e) => setBranding({ ...branding, appName: e.target.value })}
                placeholder="Enter app name"
              />
            </div>

            {/* Color pickers */}
            <div className="color-picker-group">
              <label>Primary Color</label>
              <div className="color-picker-row">
                <div className="color-swatch-wrapper">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="color-input"
                  />
                  <span className="color-swatch" style={{ background: branding.primaryColor }} />
                </div>
                <span className="color-hex-label">{branding.primaryColor}</span>
              </div>
            </div>

            <div className="color-picker-group">
              <label>Accent Color</label>
              <div className="color-picker-row">
                <div className="color-swatch-wrapper">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="color-input"
                  />
                  <span className="color-swatch" style={{ background: branding.accentColor }} />
                </div>
                <span className="color-hex-label">{branding.accentColor}</span>
              </div>
            </div>
          </div>

          {/* Preview strip */}
          <div className="branding-preview">
            <span className="branding-preview-label">Preview</span>
            <div className="branding-preview-bar" style={{ background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.accentColor})` }}>
              <span>{branding.appName}</span>
            </div>
          </div>

          <button
            className="btn btn-primary settings-submit-btn"
            onClick={() => toast.success('Branding settings saved!')}
          >
            <FiSave /> Save Branding
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
