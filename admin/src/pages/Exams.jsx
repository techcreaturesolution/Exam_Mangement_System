import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [form, setForm] = useState({
    examTitle: '', description: '', examType: 'practice', categoryId: '', subjectId: '', levelId: '',
    setNumber: 1, totalQuestions: 25, durationMinutes: 30, passingMarks: 40, negativeMarking: false,
    randomQuestions: true, showResult: true, allowReview: true, maxAttempts: 0,
    antiCheatEnabled: true, maxViolations: 3, isDemo: false, isFree: false,
    startDate: '', endDate: '', instructions: '',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [examRes, catRes, subRes, levRes] = await Promise.all([
        api.get('/exams'), api.get('/categories'), api.get('/subjects'), api.get('/levels'),
      ]);
      setExams(examRes.data);
      setCategories(catRes.data);
      setSubjects(subRes.data);
      setLevels(levRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;
      if (!payload.levelId) delete payload.levelId;
      // Set default questions based on type
      if (payload.examType === 'practice' && !editingId) {
        payload.totalQuestions = payload.totalQuestions || 25;
      }
      if (payload.examType === 'mock_test' && !editingId) {
        payload.totalQuestions = payload.totalQuestions || 100;
      }

      if (editingId) {
        await api.put(`/exams/${editingId}`, payload);
        toast.success('Exam updated');
      } else {
        await api.post('/exams', payload);
        toast.success('Exam created');
      }
      setShowModal(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save exam');
    }
  };

  const handleEdit = (exam) => {
    setForm({
      examTitle: exam.examTitle, description: exam.description || '',
      examType: exam.examType || 'practice',
      categoryId: exam.categoryId?._id || exam.categoryId,
      subjectId: exam.subjectId?._id || exam.subjectId,
      levelId: exam.levelId?._id || exam.levelId || '',
      setNumber: exam.setNumber || 1,
      totalQuestions: exam.totalQuestions, durationMinutes: exam.durationMinutes,
      passingMarks: exam.passingMarks, negativeMarking: exam.negativeMarking,
      randomQuestions: exam.randomQuestions, showResult: exam.showResult,
      allowReview: exam.allowReview, maxAttempts: exam.maxAttempts || 0,
      antiCheatEnabled: exam.antiCheatEnabled, maxViolations: exam.maxViolations,
      isDemo: exam.isDemo || false, isFree: exam.isFree || false,
      startDate: exam.startDate ? exam.startDate.slice(0, 16) : '',
      endDate: exam.endDate ? exam.endDate.slice(0, 16) : '',
      instructions: exam.instructions || '',
    });
    setEditingId(exam._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success('Exam deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete exam');
    }
  };

  const getFilteredSubjects = (catId) => subjects.filter(s => !catId || (s.categoryId?._id || s.categoryId) === catId);

  const filteredExams = filterType === 'all' ? exams : exams.filter(e => e.examType === filterType);

  const resetForm = () => ({
    examTitle: '', description: '', examType: 'practice', categoryId: '', subjectId: '', levelId: '',
    setNumber: 1, totalQuestions: 25, durationMinutes: 30, passingMarks: 40, negativeMarking: false,
    randomQuestions: true, showResult: true, allowReview: true, maxAttempts: 0,
    antiCheatEnabled: true, maxViolations: 3, isDemo: false, isFree: false,
    startDate: '', endDate: '', instructions: '',
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Exam Management</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }}>
            <option value="all">All Types</option>
            <option value="practice">Practice Sets</option>
            <option value="mock_test">Mock Tests</option>
          </select>
          <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm(resetForm()); setShowModal(true); }}>
            + Create Exam
          </button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Exam Title</th>
            <th>Type</th>
            <th>Category</th>
            <th>Subject (Topic)</th>
            <th>Set #</th>
            <th>Questions</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Access</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredExams.map((exam) => (
            <tr key={exam._id}>
              <td>{exam.examTitle}</td>
              <td>
                <span className={`badge badge-${exam.examType === 'mock_test' ? 'warning' : 'info'}`}>
                  {exam.examType === 'mock_test' ? 'Mock Test' : 'Practice'}
                </span>
              </td>
              <td>{exam.categoryId?.categoryName || '-'}</td>
              <td>{exam.subjectId?.subjectName || '-'}</td>
              <td>{exam.examType === 'practice' ? `Set ${exam.setNumber || 1}` : '-'}</td>
              <td>{exam.totalQuestions}</td>
              <td>{exam.durationMinutes} min</td>
              <td><span className={`badge badge-${exam.status}`}>{exam.status}</span></td>
              <td>
                {exam.isDemo && <span className="badge badge-demo">DEMO</span>}
                {exam.isFree && <span className="badge badge-active" style={{ marginLeft: 4 }}>FREE</span>}
                {!exam.isDemo && !exam.isFree && <span className="badge">Paid</span>}
              </td>
              <td>
                <button className="btn btn-sm btn-edit" onClick={() => handleEdit(exam)}>Edit</button>
                <button className="btn btn-sm btn-delete" onClick={() => handleDelete(exam._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {filteredExams.length === 0 && <tr><td colSpan="10" style={{ textAlign: 'center' }}>No exams found</td></tr>}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Exam' : 'Create Exam'}</h2>
            <form onSubmit={handleSubmit}>
              {/* Exam Type Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="form-group">
                  <label>Exam Type *</label>
                  <select value={form.examType} onChange={(e) => {
                    const type = e.target.value;
                    setForm({ ...form, examType: type, totalQuestions: type === 'mock_test' ? 100 : 25, durationMinutes: type === 'mock_test' ? 120 : 30 });
                  }} required>
                    <option value="practice">Practice Set (25 MCQs per set)</option>
                    <option value="mock_test">Mock Test (100 MCQs)</option>
                  </select>
                </div>
                {form.examType === 'practice' && (
                  <div className="form-group">
                    <label>Set Number</label>
                    <input type="number" value={form.setNumber} onChange={(e) => setForm({ ...form, setNumber: parseInt(e.target.value) })} min={1} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Exam Title *</label>
                <input type="text" value={form.examTitle} onChange={(e) => setForm({ ...form, examTitle: e.target.value })} required placeholder={form.examType === 'mock_test' ? 'e.g., Mock Test 1' : 'e.g., GFR - Set 1'} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value, subjectId: '' })} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject (Topic) *</label>
                  <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
                    <option value="">Select Subject</option>
                    {getFilteredSubjects(form.categoryId).map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Level (optional)</label>
                  <select value={form.levelId} onChange={(e) => setForm({ ...form, levelId: e.target.value })}>
                    <option value="">Any Level</option>
                    {levels.map(l => <option key={l._id} value={l._id}>{l.levelName}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Total Questions</label>
                  <input type="number" value={form.totalQuestions} onChange={(e) => setForm({ ...form, totalQuestions: parseInt(e.target.value) })} min={1} required />
                  <small style={{ color: '#666' }}>{form.examType === 'practice' ? 'Default: 25 per set' : 'Default: 100 for mock'}</small>
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })} min={1} required />
                </div>
                <div className="form-group">
                  <label>Passing Marks (%)</label>
                  <input type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: parseInt(e.target.value) })} min={0} max={100} />
                </div>
                <div className="form-group">
                  <label>Max Attempts (0=unlimited)</label>
                  <input type="number" value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: parseInt(e.target.value) })} min={0} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Start Date (optional)</label>
                  <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Date (optional)</label>
                  <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: '12px 0' }}>
                <label><input type="checkbox" checked={form.randomQuestions} onChange={(e) => setForm({ ...form, randomQuestions: e.target.checked })} /> Random Questions</label>
                <label><input type="checkbox" checked={form.negativeMarking} onChange={(e) => setForm({ ...form, negativeMarking: e.target.checked })} /> Negative Marking</label>
                <label><input type="checkbox" checked={form.showResult} onChange={(e) => setForm({ ...form, showResult: e.target.checked })} /> Show Result</label>
                <label><input type="checkbox" checked={form.allowReview} onChange={(e) => setForm({ ...form, allowReview: e.target.checked })} /> Allow Review</label>
                <label><input type="checkbox" checked={form.isDemo} onChange={(e) => setForm({ ...form, isDemo: e.target.checked })} /> Demo (Free Preview)</label>
                <label><input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} /> Free (No Plan Required)</label>
                <label><input type="checkbox" checked={form.antiCheatEnabled} onChange={(e) => setForm({ ...form, antiCheatEnabled: e.target.checked })} /> Anti-Cheat</label>
              </div>
              {form.antiCheatEnabled && (
                <div className="form-group">
                  <label>Max Violations Before Auto-Submit</label>
                  <input type="number" value={form.maxViolations} onChange={(e) => setForm({ ...form, maxViolations: parseInt(e.target.value) })} min={1} />
                </div>
              )}
              <div className="form-group">
                <label>Instructions</label>
                <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={3} placeholder={form.examType === 'mock_test' ? '• All questions are mandatory.\n• Each question carries 1 mark.\n• No negative marking.\n• You can navigate between questions.' : '• Answer all 25 MCQs.\n• You can navigate between questions.'} />
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

export default Exams;
