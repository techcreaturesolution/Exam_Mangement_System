import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Levels = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ levelName: '', sortOrder: 0, color: '#4CAF50' });

  useEffect(() => { fetchLevels(); }, []);

  const fetchLevels = async () => {
    try {
      const { data } = await api.get('/levels');
      setLevels(data);
    } catch (error) {
      toast.error('Failed to fetch levels');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/levels/${editingId}`, form);
        toast.success('Level updated');
      } else {
        await api.post('/levels', form);
        toast.success('Level created');
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ levelName: '', sortOrder: 0, color: '#4CAF50' });
      fetchLevels();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save level');
    }
  };

  const handleEdit = (level) => {
    setForm({ levelName: level.levelName, sortOrder: level.sortOrder, color: level.color || '#4CAF50' });
    setEditingId(level._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this level?')) return;
    try {
      await api.delete(`/levels/${id}`);
      toast.success('Level deleted');
      fetchLevels();
    } catch (error) {
      toast.error('Failed to delete level');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Level / Difficulty Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm({ levelName: '', sortOrder: 0, color: '#4CAF50' }); setShowModal(true); }}>
          + Add Level
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Level Name</th>
            <th>Sort Order</th>
            <th>Color</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((level) => (
            <tr key={level._id}>
              <td><span style={{ color: level.color, fontWeight: 'bold' }}>{level.levelName}</span></td>
              <td>{level.sortOrder}</td>
              <td><span style={{ background: level.color, padding: '2px 12px', borderRadius: 4, color: '#fff' }}>{level.color}</span></td>
              <td>
                <button className="btn btn-sm btn-edit" onClick={() => handleEdit(level)}>Edit</button>
                <button className="btn btn-sm btn-delete" onClick={() => handleDelete(level._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {levels.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No levels found</td></tr>}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Level' : 'Add Level'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Level Name</label>
                <input type="text" value={form.levelName} onChange={(e) => setForm({ ...form, levelName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} required />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Levels;
