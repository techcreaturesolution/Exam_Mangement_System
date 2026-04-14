import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Levels = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: 'easy', description: '', order: 1, color: '#4CAF50', isActive: true,
  });

  useEffect(() => { fetchLevels(); }, []);

  const fetchLevels = async () => {
    try {
      const { data } = await api.get('/levels');
      setLevels(data);
    } catch (error) {
      toast.error('Error fetching levels');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/levels/${editId}`, form);
        toast.success('Level updated');
      } else {
        await api.post('/levels', form);
        toast.success('Level created');
      }
      fetchLevels();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving level');
    }
  };

  const handleEdit = (lvl) => {
    setForm({
      name: lvl.name, description: lvl.description || '',
      order: lvl.order, color: lvl.color, isActive: lvl.isActive,
    });
    setEditId(lvl._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this level?')) return;
    try {
      await api.delete(`/levels/${id}`);
      toast.success('Level deleted');
      fetchLevels();
    } catch (error) {
      toast.error('Error deleting level');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ name: 'easy', description: '', order: 1, color: '#4CAF50', isActive: true });
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Difficulty Levels</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Level
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Color</th>
                <th>Description</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((lvl) => (
                <tr key={lvl._id}>
                  <td><strong style={{ textTransform: 'capitalize' }}>{lvl.name}</strong></td>
                  <td><span className="color-dot" style={{ backgroundColor: lvl.color }}></span> {lvl.color}</td>
                  <td>{lvl.description || '-'}</td>
                  <td>{lvl.order}</td>
                  <td><span className={`badge ${lvl.isActive ? 'active' : 'inactive'}`}>{lvl.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(lvl)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleDelete(lvl._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {levels.length === 0 && <tr><td colSpan="6" className="text-center">No levels found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Level' : 'Add Level'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Level Name *</label>
                <select value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Levels;
