import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ categoryId: '', subjectId: '', levelId: '' });
  const [form, setForm] = useState({
    categoryId: '', subjectId: '', levelId: '',
    question: '', optionA: '', optionB: '', optionC: '', optionD: '',
    answer: 'A', marks: 1, negativeMarks: 0, explanation: '',
  });
  const [importForm, setImportForm] = useState({ categoryId: '', subjectId: '', levelId: '', file: null });

  useEffect(() => { fetchDropdowns(); }, []);
  useEffect(() => { fetchQuestions(); }, [page, filters]);

  const fetchDropdowns = async () => {
    try {
      const [catRes, subRes, levRes] = await Promise.all([
        api.get('/categories'), api.get('/subjects'), api.get('/levels'),
      ]);
      setCategories(catRes.data);
      setSubjects(subRes.data);
      setLevels(levRes.data);
    } catch (error) {
      toast.error('Failed to fetch dropdown data');
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await api.get('/questions', { params });
      setQuestions(data.questions);
      setTotalPages(data.pages);
    } catch (error) {
      toast.error('Failed to fetch questions');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/questions/${editingId}`, form);
        toast.success('Question updated');
      } else {
        await api.post('/questions', form);
        toast.success('Question created');
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save question');
    }
  };

  const resetForm = () => {
    setForm({
      categoryId: '', subjectId: '', levelId: '',
      question: '', optionA: '', optionB: '', optionC: '', optionD: '',
      answer: 'A', marks: 1, negativeMarks: 0, explanation: '',
    });
  };

  const handleEdit = (q) => {
    setForm({
      categoryId: q.categoryId?._id || q.categoryId,
      subjectId: q.subjectId?._id || q.subjectId,
      levelId: q.levelId?._id || q.levelId,
      question: q.question, optionA: q.optionA, optionB: q.optionB,
      optionC: q.optionC, optionD: q.optionD, answer: q.answer,
      marks: q.marks, negativeMarks: q.negativeMarks, explanation: q.explanation || '',
    });
    setEditingId(q._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question deleted');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importForm.file) return toast.error('Please select a file');
    const formData = new FormData();
    formData.append('file', importForm.file);
    formData.append('categoryId', importForm.categoryId);
    formData.append('subjectId', importForm.subjectId);
    formData.append('levelId', importForm.levelId);
    try {
      const { data } = await api.post('/questions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(data.message);
      setShowImportModal(false);
      fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed');
    }
  };

  const getFilteredSubjects = (catId) => subjects.filter(s => !catId || (s.categoryId?._id || s.categoryId) === catId);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Question Bank</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>Import CSV/Excel</button>
          <button className="btn btn-primary" onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}>+ Add Question</button>
        </div>
      </div>

      <div className="filters" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={filters.categoryId} onChange={(e) => { setFilters({ ...filters, categoryId: e.target.value, subjectId: '' }); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
        </select>
        <select value={filters.subjectId} onChange={(e) => { setFilters({ ...filters, subjectId: e.target.value }); setPage(1); }}>
          <option value="">All Subjects</option>
          {getFilteredSubjects(filters.categoryId).map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
        </select>
        <select value={filters.levelId} onChange={(e) => { setFilters({ ...filters, levelId: e.target.value }); setPage(1); }}>
          <option value="">All Levels</option>
          {levels.map(l => <option key={l._id} value={l._id}>{l.levelName}</option>)}
        </select>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Level</th>
                <th>Answer</th>
                <th>Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q._id}>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</td>
                  <td>{q.categoryId?.categoryName || '-'}</td>
                  <td>{q.subjectId?.subjectName || '-'}</td>
                  <td><span style={{ color: q.levelId?.color }}>{q.levelId?.levelName || '-'}</span></td>
                  <td><strong>{q.answer}</strong></td>
                  <td>{q.marks}</td>
                  <td>
                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(q)}>Edit</button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(q._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>No questions found</td></tr>}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Question' : 'Add Question'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value, subjectId: '' })} required>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
                    <option value="">Select</option>
                    {getFilteredSubjects(form.categoryId).map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select value={form.levelId} onChange={(e) => setForm({ ...form, levelId: e.target.value })} required>
                    <option value="">Select</option>
                    {levels.map(l => <option key={l._id} value={l._id}>{l.levelName}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Question</label>
                <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required rows={3} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Option A</label>
                  <input type="text" value={form.optionA} onChange={(e) => setForm({ ...form, optionA: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Option B</label>
                  <input type="text" value={form.optionB} onChange={(e) => setForm({ ...form, optionB: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Option C</label>
                  <input type="text" value={form.optionC} onChange={(e) => setForm({ ...form, optionC: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Option D</label>
                  <input type="text" value={form.optionD} onChange={(e) => setForm({ ...form, optionD: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Correct Answer</label>
                  <select value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Marks</label>
                  <input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: parseInt(e.target.value) })} min={1} />
                </div>
                <div className="form-group">
                  <label>Negative Marks</label>
                  <input type="number" value={form.negativeMarks} onChange={(e) => setForm({ ...form, negativeMarks: parseFloat(e.target.value) })} min={0} step={0.25} />
                </div>
              </div>
              <div className="form-group">
                <label>Explanation (optional)</label>
                <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Import Questions from CSV/Excel</h2>
            <p style={{ color: '#666', fontSize: 14 }}>
              File must have columns: Question, Option A, Option B, Option C, Option D, Answer, Marks (optional), Negative Marks (optional), Explanation (optional)
            </p>
            <form onSubmit={handleImport}>
              <div className="form-group">
                <label>Category</label>
                <select value={importForm.categoryId} onChange={(e) => setImportForm({ ...importForm, categoryId: e.target.value })} required>
                  <option value="">Select</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select value={importForm.subjectId} onChange={(e) => setImportForm({ ...importForm, subjectId: e.target.value })} required>
                  <option value="">Select</option>
                  {getFilteredSubjects(importForm.categoryId).map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Level</label>
                <select value={importForm.levelId} onChange={(e) => setImportForm({ ...importForm, levelId: e.target.value })} required>
                  <option value="">Select</option>
                  {levels.map(l => <option key={l._id} value={l._id}>{l.levelName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>File (.csv, .xlsx)</label>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setImportForm({ ...importForm, file: e.target.files[0] })} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowImportModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Import</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
