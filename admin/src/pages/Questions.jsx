import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ category: '', subject: '', level: '' });
  const [form, setForm] = useState({
    questionText: '', options: [
      { text: '', isCorrect: true }, { text: '', isCorrect: false },
      { text: '', isCorrect: false }, { text: '', isCorrect: false },
    ],
    explanation: '', category: '', subject: '', level: '',
    examType: 'both', marks: 1, negativeMarks: 0,
  });
  const [uploadForm, setUploadForm] = useState({
    file: null, category: '', subject: '', level: '', examType: 'both',
  });

  useEffect(() => {
    fetchCategories();
    fetchLevels();
  }, []);

  useEffect(() => { fetchQuestions(); }, [page, filters]);

  useEffect(() => {
    if (filters.category) {
      fetchSubjectsByCategory(filters.category);
    }
  }, [filters.category]);

  const fetchQuestions = async () => {
    try {
      const params = { page, limit: 20, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const { data } = await api.get('/questions', { params });
      setQuestions(data.questions);
      setTotalPages(data.pages);
    } catch (error) {
      toast.error('Error fetching questions');
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
        await api.put(`/questions/${editId}`, form);
        toast.success('Question updated');
      } else {
        await api.post('/questions', form);
        toast.success('Question created');
      }
      fetchQuestions();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving question');
    }
  };

  const handleEdit = (q) => {
    setForm({
      questionText: q.questionText,
      options: q.options.length >= 4 ? q.options : [
        ...q.options,
        ...Array(4 - q.options.length).fill({ text: '', isCorrect: false }),
      ],
      explanation: q.explanation || '',
      category: q.category?._id || '',
      subject: q.subject?._id || '',
      level: q.level?._id || '',
      examType: q.examType,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
    });
    if (q.category?._id) fetchSubjectsByCategory(q.category._id);
    setEditId(q._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question deleted');
      fetchQuestions();
    } catch (error) {
      toast.error('Error deleting question');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error('Please select a file');
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('category', uploadForm.category);
      formData.append('subject', uploadForm.subject);
      formData.append('level', uploadForm.level);
      formData.append('examType', uploadForm.examType);
      const { data } = await api.post('/questions/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(data.message);
      fetchQuestions();
      setShowUploadModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    }
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...form.options];
    if (field === 'isCorrect') {
      newOptions.forEach((opt, i) => { opt.isCorrect = i === index; });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setForm({ ...form, options: newOptions });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({
      questionText: '', options: [
        { text: '', isCorrect: true }, { text: '', isCorrect: false },
        { text: '', isCorrect: false }, { text: '', isCorrect: false },
      ],
      explanation: '', category: '', subject: '', level: '',
      examType: 'both', marks: 1, negativeMarks: 0,
    });
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Question Bank</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowUploadModal(true)}>
            <FiUpload /> Bulk Upload
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Add Question
          </button>
        </div>
      </div>

      <div className="filters card">
        <div className="filter-row">
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, subject: '' })}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })}>
            <option value="">All Subjects</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })}>
            <option value="">All Levels</option>
            {levels.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Level</th>
                <th>Type</th>
                <th>Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q._id}>
                  <td className="question-text">{q.questionText.substring(0, 80)}{q.questionText.length > 80 ? '...' : ''}</td>
                  <td>{q.category?.name || '-'}</td>
                  <td>{q.subject?.name || '-'}</td>
                  <td><span className="badge" style={{ backgroundColor: q.level?.color, color: '#fff' }}>{q.level?.name}</span></td>
                  <td><span className={`badge ${q.examType}`}>{q.examType}</span></td>
                  <td>{q.marks}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(q)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleDelete(q._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && <tr><td colSpan="7" className="text-center">No questions found</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Question' : 'Add Question'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question Text *</label>
                <textarea value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} rows={3} required />
              </div>
              <div className="form-group">
                <label>Options *</label>
                {form.options.map((opt, i) => (
                  <div key={i} className="option-row">
                    <input type="radio" name="correct" checked={opt.isCorrect} onChange={() => updateOption(i, 'isCorrect', true)} />
                    <input type="text" value={opt.text} onChange={(e) => updateOption(i, 'text', e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`} required />
                  </div>
                ))}
                <small>Select the radio button for the correct answer</small>
              </div>
              <div className="form-group">
                <label>Explanation</label>
                <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={(e) => { setForm({ ...form, category: e.target.value, subject: '' }); if (e.target.value) fetchSubjectsByCategory(e.target.value); }} required>
                    <option value="">Select</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required>
                    <option value="">Select</option>
                    {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Level *</label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required>
                    <option value="">Select</option>
                    {levels.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Exam Type</label>
                  <select value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                    <option value="both">Both</option>
                    <option value="practice">Practice</option>
                    <option value="mock">Mock</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Marks</label>
                  <input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: parseInt(e.target.value) })} min={1} />
                </div>
                <div className="form-group">
                  <label>Negative Marks</label>
                  <input type="number" value={form.negativeMarks} onChange={(e) => setForm({ ...form, negativeMarks: parseFloat(e.target.value) })} min={0} step={0.25} />
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

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Bulk Upload Questions</h2>
            <p className="upload-info">
              Upload an Excel (.xlsx) or CSV file with columns:<br />
              <strong>Question, Option A, Option B, Option C, Option D, Correct Answer (A/B/C/D), Explanation, Marks, Negative Marks</strong>
            </p>
            <form onSubmit={handleBulkUpload}>
              <div className="form-group">
                <label>File *</label>
                <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })} required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={uploadForm.category} onChange={(e) => { setUploadForm({ ...uploadForm, category: e.target.value }); if (e.target.value) fetchSubjectsByCategory(e.target.value); }} required>
                  <option value="">Select</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <select value={uploadForm.subject} onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })} required>
                  <option value="">Select</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Level *</label>
                  <select value={uploadForm.level} onChange={(e) => setUploadForm({ ...uploadForm, level: e.target.value })} required>
                    <option value="">Select</option>
                    {levels.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Exam Type</label>
                  <select value={uploadForm.examType} onChange={(e) => setUploadForm({ ...uploadForm, examType: e.target.value })}>
                    <option value="both">Both</option>
                    <option value="practice">Practice</option>
                    <option value="mock">Mock</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
