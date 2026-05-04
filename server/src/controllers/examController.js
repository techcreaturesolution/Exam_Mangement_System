const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamAttempt = require('../models/ExamAttempt');

// @desc    Get all exams
// @route   GET /api/exams
const getExams = async (req, res) => {
  try {
    const { categoryId, subjectId, status, isDemo, examType, isFree } = req.query;
    const filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (subjectId) filter.subjectId = subjectId;
    if (status) filter.status = status;
    if (isDemo !== undefined) filter.isDemo = isDemo === 'true';
    if (examType) filter.examType = examType;
    if (isFree !== undefined) filter.isFree = isFree === 'true';

    const exams = await Exam.find(filter)
      .populate('categoryId', 'categoryName')
      .populate('subjectId', 'subjectName')
      .populate('levelId', 'levelName color')
      .sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
const getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('categoryId', 'categoryName')
      .populate('subjectId', 'subjectName')
      .populate('levelId', 'levelName color');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create exam
// @route   POST /api/exams
const createExam = async (req, res) => {
  try {
    const {
      examTitle, description, examType, categoryId, subjectId, levelId,
      setNumber, totalQuestions, durationMinutes, passingMarks, negativeMarking,
      randomQuestions, showResult, allowReview, maxAttempts,
      instructions, startDate, endDate, antiCheatEnabled,
      maxViolations, autoSubmitOnViolation, isDemo, isFree,
    } = req.body;

    // Auto-select questions based on category/subject/level
    let { questions } = req.body;
    const questionFilter = {
      categoryId,
      subjectId,
      isActive: true,
    };
    if (levelId) questionFilter.levelId = levelId;

    if (!questions || questions.length === 0) {
      const availableQuestions = await Question.find(questionFilter).select('_id');

      if (availableQuestions.length < totalQuestions) {
        return res.status(400).json({
          message: `Not enough questions. Available: ${availableQuestions.length}, Required: ${totalQuestions}`,
        });
      }

      // Randomly select questions
      const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
      questions = shuffled.slice(0, totalQuestions).map((q) => q._id);
    }

    // Calculate total marks
    const questionDocs = await Question.find({ _id: { $in: questions } });
    const totalMarks = questionDocs.reduce((sum, q) => sum + q.marks, 0);

    const examData = {
      examTitle, description, examType: examType || 'practice',
      categoryId, subjectId, levelId,
      setNumber: setNumber || 1,
      totalQuestions, durationMinutes, passingMarks: passingMarks || 40,
      totalMarks, negativeMarking, randomQuestions, showResult,
      allowReview, maxAttempts: maxAttempts || 0, instructions,
      questions, startDate, endDate,
      isDemo: isDemo || false,
      isFree: isFree || false,
      antiCheatEnabled: antiCheatEnabled !== false,
      maxViolations: maxViolations || 3,
      autoSubmitOnViolation: autoSubmitOnViolation || false,
      createdBy: req.user._id,
    };

    const exam = await Exam.create(examData);
    const populated = await exam.populate([
      { path: 'categoryId', select: 'categoryName' },
      { path: 'subjectId', select: 'subjectName' },
      { path: 'levelId', select: 'levelName color' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('categoryId', 'categoryName')
      .populate('subjectId', 'subjectName')
      .populate('levelId', 'levelName color');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start exam attempt
// @route   POST /api/exams/:id/start
const startExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate({
      path: 'questions',
      select: 'question optionA optionB optionC optionD marks negativeMarks',
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.status !== 'active') {
      return res.status(400).json({ message: 'This exam is not available' });
    }

    // Check date range
    const now = new Date();
    if (exam.startDate && now < exam.startDate) {
      return res.status(400).json({ message: 'Exam has not started yet' });
    }
    if (exam.endDate && now > exam.endDate) {
      return res.status(400).json({ message: 'Exam has ended' });
    }

    // Check max attempts
    if (exam.maxAttempts > 0) {
      const attemptCount = await ExamAttempt.countDocuments({
        userId: req.user._id,
        examId: exam._id,
        status: { $in: ['completed', 'auto_submitted'] },
      });
      if (attemptCount >= exam.maxAttempts) {
        return res.status(400).json({ message: 'Maximum attempts reached' });
      }
    }

    // Check for in-progress attempt
    const existingAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      examId: exam._id,
      status: 'in_progress',
    });

    if (existingAttempt) {
      return res.json({
        attempt: existingAttempt,
        exam: {
          _id: exam._id,
          examTitle: exam.examTitle,
          durationMinutes: exam.durationMinutes,
          totalQuestions: exam.totalQuestions,
          totalMarks: exam.totalMarks,
          antiCheatEnabled: exam.antiCheatEnabled,
          maxViolations: exam.maxViolations,
          instructions: exam.instructions,
        },
        questions: exam.questions.map((q) => ({
          _id: q._id,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          marks: q.marks,
        })),
      });
    }

    // Prepare questions
    let questions = exam.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      marks: q.marks,
    }));

    if (exam.randomQuestions) {
      questions = questions.sort(() => 0.5 - Math.random());
    }

    // Create attempt
    const attempt = await ExamAttempt.create({
      userId: req.user._id,
      examId: exam._id,
      startedAt: new Date(),
      totalMarks: exam.totalMarks,
      answers: questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: '',
        isCorrect: false,
        marksObtained: 0,
      })),
    });

    res.status(201).json({
      attempt,
      exam: {
        _id: exam._id,
        examTitle: exam.examTitle,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        antiCheatEnabled: exam.antiCheatEnabled,
        maxViolations: exam.maxViolations,
        instructions: exam.instructions,
      },
      questions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit exam attempt
// @route   POST /api/exams/:id/submit
const submitExam = async (req, res) => {
  try {
    const { attemptId, answers, autoSubmitted } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Exam already submitted' });
    }

    const exam = await Exam.findById(req.params.id).populate('questions');

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    let score = 0;

    const processedAnswers = attempt.answers.map((ans) => {
      const userAnswer = answers ? answers.find(
        (a) => a.questionId.toString() === ans.questionId.toString()
      ) : null;
      const question = exam.questions.find(
        (q) => q._id.toString() === ans.questionId.toString()
      );

      if (!question) return ans.toObject();

      if (!userAnswer || !userAnswer.selectedAnswer) {
        unanswered++;
        return { ...ans.toObject(), selectedAnswer: '', isCorrect: false, marksObtained: 0 };
      }

      const isCorrect = userAnswer.selectedAnswer === question.answer;
      let marks = 0;

      if (isCorrect) {
        correctAnswers++;
        marks = question.marks;
      } else {
        wrongAnswers++;
        marks = exam.negativeMarking ? -question.negativeMarks : 0;
      }

      score += marks;

      return {
        ...ans.toObject(),
        selectedAnswer: userAnswer.selectedAnswer,
        isCorrect,
        marksObtained: marks,
        timeTaken: userAnswer.timeTaken || 0,
      };
    });

    const percentage = exam.totalMarks > 0
      ? Math.round((Math.max(0, score) / exam.totalMarks) * 100)
      : 0;

    attempt.answers = processedAnswers;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.correctAnswers = correctAnswers;
    attempt.wrongAnswers = wrongAnswers;
    attempt.unanswered = unanswered;
    attempt.status = autoSubmitted ? 'auto_submitted' : 'completed';
    attempt.submittedAt = new Date();
    attempt.timeSpent = Math.round(
      (attempt.submittedAt - attempt.startedAt) / 1000
    );

    // Calculate rank
    const betterAttempts = await ExamAttempt.countDocuments({
      examId: exam._id,
      status: { $in: ['completed', 'auto_submitted'] },
      percentage: { $gt: percentage },
    });
    attempt.rank = betterAttempts + 1;

    await attempt.save();

    const result = {
      _id: attempt._id,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      rank: attempt.rank,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      unanswered: attempt.unanswered,
      timeSpent: attempt.timeSpent,
      status: attempt.status,
      isPassed: percentage >= (exam.passingMarks || 40),
    };

    if (exam.showResult) {
      res.json(result);
    } else {
      res.json({ message: 'Exam submitted successfully. Results will be available later.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get exam history for user
// @route   GET /api/exams/history
const getExamHistory = async (req, res) => {
  try {
    const attempts = await ExamAttempt.find({
      userId: req.user._id,
      status: { $in: ['completed', 'auto_submitted'] },
    })
      .populate({
        path: 'examId',
        select: 'examTitle categoryId subjectId levelId durationMinutes totalQuestions',
        populate: [
          { path: 'categoryId', select: 'categoryName' },
          { path: 'subjectId', select: 'subjectName' },
          { path: 'levelId', select: 'levelName color' },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Review exam attempt (show correct answers)
// @route   GET /api/exams/review/:attemptId
const reviewAttempt = async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.attemptId)
      .populate({
        path: 'examId',
        select: 'examTitle allowReview totalMarks passingMarks durationMinutes',
      });

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this attempt' });
    }

    if (attempt.status === 'in_progress') {
      return res.status(400).json({ message: 'Exam is still in progress' });
    }

    if (!attempt.examId.allowReview) {
      return res.status(403).json({ message: 'Review is not enabled for this exam' });
    }

    // Get full questions with correct answers
    const questionsIds = attempt.answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionsIds } });

    const reviewData = {
      _id: attempt._id,
      exam: attempt.examId,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      rank: attempt.rank,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      unanswered: attempt.unanswered,
      timeSpent: attempt.timeSpent,
      questions: attempt.answers.map((ans) => {
        const q = questions.find((qq) => qq._id.toString() === ans.questionId.toString());
        if (!q) return null;
        return {
          _id: q._id,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.answer,
          explanation: q.explanation || null,
          selectedAnswer: ans.selectedAnswer,
          isCorrect: ans.isCorrect,
          marksObtained: ans.marksObtained,
          marks: q.marks,
        };
      }).filter(Boolean),
    };

    res.json(reviewData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get performance report
// @route   GET /api/reports/analytics
const getPerformanceReport = async (req, res) => {
  try {
    const userId = req.query.userId || req.user._id;

    const attempts = await ExamAttempt.find({
      userId,
      status: { $in: ['completed', 'auto_submitted'] },
    })
      .populate({
        path: 'examId',
        select: 'examTitle categoryId subjectId levelId',
        populate: [
          { path: 'categoryId', select: 'categoryName' },
          { path: 'subjectId', select: 'subjectName' },
          { path: 'levelId', select: 'levelName' },
        ],
      })
      .sort({ createdAt: -1 });

    const totalAttempts = attempts.length;
    const totalCorrect = attempts.reduce((sum, a) => sum + a.correctAnswers, 0);
    const totalWrong = attempts.reduce((sum, a) => sum + a.wrongAnswers, 0);
    const totalUnanswered = attempts.reduce((sum, a) => sum + a.unanswered, 0);
    const totalQuestionsSolved = totalCorrect + totalWrong + totalUnanswered;
    const overallAccuracy = totalQuestionsSolved > 0
      ? Math.round((totalCorrect / totalQuestionsSolved) * 100)
      : 0;
    const avgPercentage = totalAttempts > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts)
      : 0;
    const totalTimeSpent = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

    // Per-exam breakdown
    const examMap = {};
    attempts.forEach((a) => {
      const examId = a.examId?._id?.toString();
      if (!examId) return;
      if (!examMap[examId]) {
        examMap[examId] = {
          exam: {
            _id: a.examId._id,
            examTitle: a.examId.examTitle,
            category: a.examId.categoryId?.categoryName || '',
            subject: a.examId.subjectId?.subjectName || '',
            level: a.examId.levelId?.levelName || '',
          },
          attempts: [],
          bestScore: 0,
          averageScore: 0,
        };
      }
      examMap[examId].attempts.push({
        _id: a._id,
        percentage: a.percentage,
        correctAnswers: a.correctAnswers,
        wrongAnswers: a.wrongAnswers,
        unanswered: a.unanswered,
        timeSpent: a.timeSpent,
        date: a.createdAt,
      });
      if (a.percentage > examMap[examId].bestScore) {
        examMap[examId].bestScore = a.percentage;
      }
    });

    Object.values(examMap).forEach((e) => {
      e.averageScore = Math.round(
        e.attempts.reduce((s, a) => s + a.percentage, 0) / e.attempts.length
      );
      e.totalAttempts = e.attempts.length;
    });

    // Category-wise accuracy
    const categoryMap = {};
    attempts.forEach((a) => {
      const catName = a.examId?.categoryId?.categoryName || 'Unknown';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { correct: 0, total: 0, attempts: 0 };
      }
      categoryMap[catName].correct += a.correctAnswers;
      categoryMap[catName].total += a.correctAnswers + a.wrongAnswers + a.unanswered;
      categoryMap[catName].attempts++;
    });

    const categoryAccuracy = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      totalAttempts: data.attempts,
    }));

    // Subject-wise accuracy
    const subjectMap = {};
    attempts.forEach((a) => {
      const subName = a.examId?.subjectId?.subjectName || 'Unknown';
      if (!subjectMap[subName]) {
        subjectMap[subName] = { correct: 0, total: 0, attempts: 0 };
      }
      subjectMap[subName].correct += a.correctAnswers;
      subjectMap[subName].total += a.correctAnswers + a.wrongAnswers + a.unanswered;
      subjectMap[subName].attempts++;
    });

    const subjectAccuracy = Object.entries(subjectMap).map(([name, data]) => ({
      name,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      totalAttempts: data.attempts,
    }));

    // Recent trend
    const recentTrend = attempts.slice(0, 10).map((a) => ({
      examTitle: a.examId?.examTitle || '',
      percentage: a.percentage,
      date: a.createdAt,
    }));

    res.json({
      overview: {
        totalAttempts,
        avgPercentage,
        overallAccuracy,
        totalTimeSpent,
        totalQuestionsSolved,
        totalCorrect,
        totalWrong,
        totalUnanswered,
      },
      examBreakdown: Object.values(examMap),
      categoryAccuracy,
      subjectAccuracy,
      recentTrend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get results & rankings
// @route   GET /api/reports/results
const getResults = async (req, res) => {
  try {
    const { examId, page = 1, limit = 20 } = req.query;
    const filter = { status: { $in: ['completed', 'auto_submitted'] } };
    if (examId) filter.examId = examId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ExamAttempt.countDocuments(filter);

    const attempts = await ExamAttempt.find(filter)
      .populate('userId', 'name email mobile')
      .populate({
        path: 'examId',
        select: 'examTitle categoryId subjectId passingMarks',
        populate: [
          { path: 'categoryId', select: 'categoryName' },
          { path: 'subjectId', select: 'subjectName' },
        ],
      })
      .sort({ percentage: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ results: attempts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get rankings for an exam
// @route   GET /api/reports/rankings
const getRankings = async (req, res) => {
  try {
    const { examId } = req.query;
    if (!examId) {
      return res.status(400).json({ message: 'examId is required' });
    }

    const attempts = await ExamAttempt.find({
      examId,
      status: { $in: ['completed', 'auto_submitted'] },
    })
      .populate('userId', 'name email profileImage')
      .sort({ percentage: -1, timeSpent: 1 });

    const rankings = attempts.map((a, index) => ({
      rank: index + 1,
      user: a.userId,
      score: a.score,
      totalMarks: a.totalMarks,
      percentage: a.percentage,
      correctAnswers: a.correctAnswers,
      wrongAnswers: a.wrongAnswers,
      timeSpent: a.timeSpent,
      submittedAt: a.submittedAt,
    }));

    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const Category = require('../models/Category');
    const Subject = require('../models/Subject');
    const Plan = require('../models/Plan');
    const Payment = require('../models/Payment');
    const Violation = require('../models/ExamViolation');

    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalCategories = await Category.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalExams = await Exam.countDocuments();
    const activeExams = await Exam.countDocuments({ status: 'active' });
    const totalAttempts = await ExamAttempt.countDocuments({
      status: { $in: ['completed', 'auto_submitted'] },
    });
    const totalViolations = await Violation.countDocuments();

    // Revenue
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Recent students
    const recentStudents = await User.find({ role: 'student' })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent attempts
    const recentAttempts = await ExamAttempt.find({
      status: { $in: ['completed', 'auto_submitted'] },
    })
      .populate('userId', 'name')
      .populate('examId', 'examTitle')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalStudents,
      activeStudents,
      totalCategories,
      totalSubjects,
      totalQuestions,
      totalExams,
      activeExams,
      totalAttempts,
      totalViolations,
      totalRevenue,
      recentStudents,
      recentAttempts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  startExam,
  submitExam,
  getExamHistory,
  reviewAttempt,
  getPerformanceReport,
  getResults,
  getRankings,
  getDashboardStats,
};
