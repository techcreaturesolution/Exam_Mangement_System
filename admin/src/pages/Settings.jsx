import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [branding, setBranding] = useState({
    appName: 'TestBharti',
    primaryColor: '#1E3A6E',
    accentColor: '#E87722',
    logo: '',
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

  return (
    <div className="page">
      <h1>Settings / Branding</h1>

      <div className="settings-sections">
        <div className="settings-section">
          <h2>Admin Profile</h2>
          <div style={{ padding: '16px 0' }}>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> Admin</p>
          </div>
        </div>

        <div className="settings-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordChange} style={{ maxWidth: 400 }}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary">Change Password</button>
          </form>
        </div>

        <div className="settings-section">
          <h2>Branding</h2>
          <div style={{ maxWidth: 400 }}>
            <div className="form-group">
              <label>Application Name</label>
              <input type="text" value={branding.appName} onChange={(e) => setBranding({ ...branding, appName: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Primary Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="color" value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} />
                  <span>{branding.primaryColor}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Accent Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="color" value={branding.accentColor} onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })} />
                  <span>{branding.accentColor}</span>
                </div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => toast.success('Branding settings saved (client-side only)')}>Save Branding</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
