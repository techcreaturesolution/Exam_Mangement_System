import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiEye } from 'react-icons/fi';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyAdmins, setCompanyAdmins] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', email: '', phone: '', website: '', address: '',
    plan: 'free', maxUsers: 100, maxExams: 10, maxQuestions: 500,
    adminName: '', adminEmail: '', adminPassword: 'admin123456',
    features: { antiCheat: true, razorpayEnabled: false, customBranding: false },
  });
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: 'admin123456', phone: '' });

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/companies');
      setCompanies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async (companyId) => {
    try {
      const { data } = await api.get(`/companies/${companyId}/admins`);
      setCompanyAdmins(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await api.put(`/companies/${editingCompany._id}`, form);
      } else {
        await api.post('/companies', form);
      }
      setShowModal(false);
      setEditingCompany(null);
      resetForm();
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving company');
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/companies/${selectedCompany._id}/admins`, adminForm);
      setShowAdminModal(false);
      setAdminForm({ name: '', email: '', password: 'admin123456', phone: '' });
      fetchAdmins(selectedCompany._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding admin');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company? All associated data will be deactivated.')) return;
    try {
      await api.delete(`/companies/${id}`);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting company');
    }
  };

  const openEdit = (company) => {
    setEditingCompany(company);
    setForm({
      name: company.name, description: company.description || '', email: company.email || '',
      phone: company.phone || '', website: company.website || '', address: company.address || '',
      plan: company.plan, maxUsers: company.maxUsers, maxExams: company.maxExams,
      maxQuestions: company.maxQuestions, adminName: '', adminEmail: '', adminPassword: '',
      features: company.features || { antiCheat: true, razorpayEnabled: false, customBranding: false },
    });
    setShowModal(true);
  };

  const openAdmins = (company) => {
    setSelectedCompany(company);
    fetchAdmins(company._id);
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', email: '', phone: '', website: '', address: '',
      plan: 'free', maxUsers: 100, maxExams: 10, maxQuestions: 500,
      adminName: '', adminEmail: '', adminPassword: 'admin123456',
      features: { antiCheat: true, razorpayEnabled: false, customBranding: false },
    });
  };

  const planColors = { free: '#9E9E9E', basic: '#2196F3', premium: '#FF9800', enterprise: '#9C27B0' };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Companies</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setEditingCompany(null); setShowModal(true); }}>
          <FiPlus /> Add Company
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Admins</th>
              <th>Users</th>
              <th>Limits</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company._id}>
                <td>
                  <strong>{company.name}</strong>
                  {company.slug && <small style={{ display: 'block', color: '#999' }}>{company.slug}</small>}
                </td>
                <td>{company.email || '-'}</td>
                <td>
                  <span className="badge" style={{ backgroundColor: planColors[company.plan], color: '#fff' }}>
                    {company.plan.toUpperCase()}
                  </span>
                </td>
                <td>{company.adminCount || 0}</td>
                <td>{company.userCount || 0}</td>
                <td>
                  <small>{company.maxExams} exams, {company.maxQuestions} Q's</small>
                </td>
                <td>
                  <span className={`badge ${company.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {company.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => openAdmins(company)} title="View Admins">
                      <FiUsers />
                    </button>
                    <button className="btn-icon" onClick={() => openEdit(company)} title="Edit">
                      <FiEdit2 />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(company._id)} title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {companies.length === 0 && (
          <div className="empty-state">No companies yet. Add your first company!</div>
        )}
      </div>

      {/* Company Admin Viewer */}
      {selectedCompany && (
        <div className="modal-overlay" onClick={() => setSelectedCompany(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h2>Admins - {selectedCompany.name}</h2>
            <div style={{ marginBottom: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdminModal(true)}>
                <FiPlus /> Add Admin
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th></tr>
              </thead>
              <tbody>
                {companyAdmins.map((admin) => (
                  <tr key={admin._id}>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>{admin.phone || '-'}</td>
                    <td>
                      <span className={`badge ${admin.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {companyAdmins.length === 0 && <p style={{ color: '#999' }}>No admins yet.</p>}
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button className="btn" onClick={() => setSelectedCompany(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Admin to {selectedCompany?.name}</h2>
            <form onSubmit={handleAddAdmin}>
              <div className="form-group">
                <label>Name</label>
                <input value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={adminForm.phone} onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowAdminModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCompany ? 'Edit Company' : 'Add New Company'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="2" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>

              <h3 style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 16 }}>Plan & Limits</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Plan</label>
                  <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Users</label>
                  <input type="number" value={form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Max Exams</label>
                  <input type="number" value={form.maxExams} onChange={(e) => setForm({ ...form, maxExams: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Max Questions</label>
                  <input type="number" value={form.maxQuestions} onChange={(e) => setForm({ ...form, maxQuestions: parseInt(e.target.value) })} />
                </div>
              </div>

              <h3 style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 16 }}>Features</h3>
              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.features.antiCheat} onChange={(e) => setForm({ ...form, features: { ...form.features, antiCheat: e.target.checked } })} />
                  Anti-Cheat / Proctoring
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.features.razorpayEnabled} onChange={(e) => setForm({ ...form, features: { ...form.features, razorpayEnabled: e.target.checked } })} />
                  Razorpay Payments
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.features.customBranding} onChange={(e) => setForm({ ...form, features: { ...form.features, customBranding: e.target.checked } })} />
                  Custom Branding
                </label>
              </div>

              {!editingCompany && (
                <>
                  <h3 style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 16 }}>Initial Admin (Optional)</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Admin Name</label>
                      <input value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Admin Email</label>
                      <input type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Admin Password</label>
                    <input value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} placeholder="Default: admin123456" />
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCompany ? 'Update' : 'Create Company'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
