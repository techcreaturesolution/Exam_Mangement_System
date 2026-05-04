import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await api.get('/auth/users', { params });
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleActive = async (userId, currentStatus) => {
    try {
      await api.put(`/auth/users/${userId}`, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Student Management</h1>
        <form onSubmit={handleSearch} className="filter-row" style={{ margin: 0 }}>
          <input type="text" placeholder="Search by name, email, mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Active Plan</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.mobile || '-'}</td>
                <td>
                  <span className={`badge badge-${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {user.activeSubscription ? (
                    <span className="badge badge-active">{user.activeSubscription.planName}</span>
                  ) : <span style={{ color: '#999' }}>None</span>}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleActive(user._id, user.isActive)}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn-sm btn-delete" onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>No students found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;
