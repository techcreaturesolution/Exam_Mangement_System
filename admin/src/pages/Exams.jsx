import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', examType: 'practice',
    category: '', subject: '', level: '',
    totalQuestions: 10, duration: 30, passingPercentage: 40,
    negativeMarking: false, shuffleQuestions: true,
    showResult: true, showAnswers: false, maxAttempts: 0,
    instructions: '', isActive: true, isDemo: false, allowReview: true,
  });

  useEffect(() => {
    fetchExams();
    fetchCategories();
    fetchLevels();
  }, []);

  useEffect(() => {
    if (form.category) fetchSubjectsByCategory(form.category);
  }, [form.category]);

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/exams');
      setExams(data);
    } catch (error) {
      toast.error('Error fetching exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories');
    }
  };

  const fetchSubjectsByCategory = async (categoryId) => {
    try {
      const { data } = await api.get(`/subjects?category=${categoryId}`);
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects');
    }
  };

  const fetchLevels = async () => {
    try {
      const { data } = await api.get('/levels');
      setLevels(data);
    } catch (error) {
      console.error('Error fetching levels');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/exams/${editId}`, form);
        toast.success('Exam updated');
      } else {
        await api.post('/exams', form);
        toast.success('Exam created');
      }
      fetchExams();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving exam');
    }
  };

  const handleEdit = (exam) => {
    setForm({
      title: exam.title, description: exam.description || '',
      examType: exam.examType, category: exam.category?._id || '',
      subject: exam.subject?._id || '', level: exam.level?._id || '',
      totalQuestions: exam.totalQuestions, duration: exam.duration,
      passingPercentage: exam.passingPercentage,
      negativeMarking: exam.negativeMarking,
      shuffleQuestions: exam.shuffleQuestions,
      showResult: exam.showResult, showAnswers: exam.showAnswers,
      maxAttempts: exam.maxAttempts, instructions: exam.instructions || '',
      isActive: exam.isActive, isDemo: exam.isDemo || false,
      allowReview: exam.allowReview !== false,
    });
    setEditId(exam._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success('Exam deleted');
      fetchExams();
    } catch (error) {
      toast.error('Error deleting exam');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({
      title: '', description: '', examType: 'practice',
      category: '', subject: '', level: '',
      totalQuestions: 10, duration: 30, passingPercentage: 40,
      negativeMarking: false, shuffleQuestions: true,
      showResult: true, showAnswers: false, maxAttempts: 0,
      instructions: '', isActive: true, isDemo: false, allowReview: true,
    });
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Exams</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Create Exam
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Level</th>
                <th>Questions</th>
                <th>Duration</th>
                <th>Demo</th>
                <th>Attempts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td><strong>{exam.title}</strong></td>
                  <td><span className={`badge ${exam.examType}`}>{exam.examType}</span></td>
                  <td>{exam.category?.name || '-'}</td>
                  <td>{exam.subject?.name || '-'}</td>
                  <td><span className="badge" style={{ backgroundColor: exam.level?.color, color: '#fff' }}>{exam.level?.name}</span></td>
                  <td>{exam.totalQuestions}</td>
                  <td>{exam.duration} min</td>
                  <td>{exam.isDemo ? <span className="badge" style={{ backgroundColor: '#10b981' }}>Free</span> : '-'}</td>
                  <td>{exam.maxAttempts === 0 ? 'Unlimited' : exam.maxAttempts}</td>
                  <td><span className={`badge ${exam.isActive ? 'active' : 'inactive'}`}>{exam.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(exam)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleDelete(exam._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && <tr><td colSpan="11" className="text-center">No exams found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Exam' : 'Create Exam'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Exam Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Exam Type *</label>
                  <select value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                    <option value="practice">Practice Exam</option>
                    <option value="mock">Mock Exam</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subject: '' })} required>
                    <option value="">Select</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required>
                    <option value="">Select</option>
                    {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Level *</label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required>
                    <option value="">Select</option>
                    {levels.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Questions *</label>
                  <input type="number" value={form.totalQuestions} onChange={(e) => setForm({ ...form, totalQuestions: parseInt(e.target.value) })} min={1} required />
                </div>
                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })} min={1} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Passing Percentage (%)</label>
                  <input type="number" value={form.passingPercentage} onChange={(e) => setForm({ ...form, passingPercentage: parseInt(e.target.value) })} min={0} max={100} />
                </div>
                <div className="form-group">
                  <label>Max Attempts (0 = unlimited)</label>
                  <input type="number" value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: parseInt(e.target.value) })} min={0} />
                </div>
              </div>
              <div className="form-row checkboxes">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.negativeMarking} onChange={(e) => setForm({ ...form, negativeMarking: e.target.checked })} />
                  Negative Marking
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.shuffleQuestions} onChange={(e) => setForm({ ...form, shuffleQuestions: e.target.checked })} />
                  Shuffle Questions
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.showResult} onChange={(e) => setForm({ ...form, showResult: e.target.checked })} />
                  Show Result
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.showAnswers} onChange={(e) => setForm({ ...form, showAnswers: e.target.checked })} />
                  Show Answers
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isDemo} onChange={(e) => setForm({ ...form, isDemo: e.target.checked })} />
                  Demo Exam (Free)
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.allowReview} onChange={(e) => setForm({ ...form, allowReview: e.target.checked })} />
                  Allow Paper Review
                </label>
              </div>
              <div className="form-group">
                <label>Instructions</label>
                <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={3}
                  placeholder="Enter exam instructions for students..." />
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

export default Exams;
