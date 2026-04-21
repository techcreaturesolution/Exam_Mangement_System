const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/levels', require('./routes/levelRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/violations', require('./routes/violationRoutes'));

// Proxy routes matching the user's API spec
app.use('/api/users', (req, res, next) => {
  // Forward /api/users/* to authRoutes /users/*
  req.url = '/users' + req.url;
  require('./routes/authRoutes')(req, res, next);
});
app.use('/api/admin', (req, res, next) => {
  // Forward /api/admin/dashboard to examRoutes /dashboard
  req.url = req.url.replace('/admin', '');
  require('./routes/examRoutes')(req, res, next);
});
app.use('/api/reports', (req, res, next) => {
  // Forward /api/reports/* to examRoutes /reports/*
  req.url = '/reports' + req.url;
  require('./routes/examRoutes')(req, res, next);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Exam Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong!',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
