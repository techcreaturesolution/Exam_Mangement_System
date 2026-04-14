const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamAttempt = require('../models/ExamAttempt');

// @desc    Get all exams
// @route   GET /api/exams
const getExams = async (req, res) => {
  try {
    const { examType, category, subject, level, isActive } = req.query;
    const filter = {};
    if (examType) filter.examType = examType;
    if (category) filter.category = category;
    if (subject) filter.subject = subject;
    if (level) filter.level = level;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const exams = await Exam.find(filter)
      .populate('category', 'name')
      .populate('subject', 'name')
      .populate('level', 'name color')
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
      .populate('category', 'name')
      .populate('subject', 'name')
      .populate('level', 'name color')
      .populate({
        path: 'questions',
        select: '-isActive -createdAt -updatedAt',
        populate: [
          { path: 'level', select: 'name color' },
        ],
      });
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
      title, description, examType, category, subject, level,
      totalQuestions, duration, passingPercentage, negativeMarking,
      shuffleQuestions, showResult, showAnswers, maxAttempts,
      instructions, startDate, endDate,
    } = req.body;

    // Auto-select questions if not provided
    let { questions } = req.body;
    if (!questions || questions.length === 0) {
      const filter = {
        category,
        subject,
        level,
        isActive: true,
        examType: { $in: [examType, 'both'] },
      };
      const availableQuestions = await Question.find(filter).select('_id');

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

    const exam = await Exam.create({
      title, description, examType, category, subject, level,
      totalQuestions, duration, passingPercentage, totalMarks,
      negativeMarking, shuffleQuestions, showResult, showAnswers,
      maxAttempts, instructions, questions, startDate, endDate,
    });

    const populated = await exam.populate([
      { path: 'category', select: 'name' },
      { path: 'subject', select: 'name' },
      { path: 'level', select: 'name color' },
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
      .populate('category', 'name')
      .populate('subject', 'name')
      .populate('level', 'name color');
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

// @desc    Start exam attempt (for mobile users)
// @route   POST /api/exams/:id/start
const startExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (!exam.isActive) {
      return res.status(400).json({ message: 'This exam is not available' });
    }

    // Check max attempts
    if (exam.maxAttempts > 0) {
      const attemptCount = await ExamAttempt.countDocuments({
        user: req.user._id,
        exam: exam._id,
        status: 'completed',
      });
      if (attemptCount >= exam.maxAttempts) {
        return res.status(400).json({ message: 'Maximum attempts reached' });
      }
    }

    // Check for in-progress attempt
    const existingAttempt = await ExamAttempt.findOne({
      user: req.user._id,
      exam: exam._id,
      status: 'in_progress',
    });

    if (existingAttempt) {
      return res.json({ attempt: existingAttempt, exam });
    }

    // Prepare questions (optionally shuffle)
    let questions = exam.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options.map((opt) => ({ text: opt.text, _id: opt._id })),
      marks: q.marks,
      negativeMarks: q.negativeMarks,
    }));

    if (exam.shuffleQuestions) {
      questions = questions.sort(() => 0.5 - Math.random());
    }

    // Create attempt
    const attempt = await ExamAttempt.create({
      user: req.user._id,
      exam: exam._id,
      startTime: new Date(),
      totalMarks: exam.totalMarks,
      answers: questions.map((q) => ({
        question: q._id,
        selectedOption: -1,
        isCorrect: false,
        marksObtained: 0,
      })),
    });

    res.status(201).json({
      attempt,
      exam: {
        _id: exam._id,
        title: exam.title,
        duration: exam.duration,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        examType: exam.examType,
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
    const { attemptId, answers } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({ message: 'Exam already submitted' });
    }

    const exam = await Exam.findById(req.params.id).populate('questions');

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    let obtainedMarks = 0;

    const processedAnswers = attempt.answers.map((ans) => {
      const userAnswer = answers.find(
        (a) => a.question.toString() === ans.question.toString()
      );
      const question = exam.questions.find(
        (q) => q._id.toString() === ans.question.toString()
      );

      if (!userAnswer || userAnswer.selectedOption === -1) {
        unanswered++;
        return { ...ans.toObject(), selectedOption: -1 };
      }

      const isCorrect = question.options[userAnswer.selectedOption]?.isCorrect || false;
      let marks = 0;

      if (isCorrect) {
        correctAnswers++;
        marks = question.marks;
      } else {
        wrongAnswers++;
        marks = exam.negativeMarking ? -question.negativeMarks : 0;
      }

      obtainedMarks += marks;

      return {
        ...ans.toObject(),
        selectedOption: userAnswer.selectedOption,
        isCorrect,
        marksObtained: marks,
        timeTaken: userAnswer.timeTaken || 0,
      };
    });

    const percentage = exam.totalMarks > 0
      ? Math.round((obtainedMarks / exam.totalMarks) * 100)
      : 0;

    attempt.answers = processedAnswers;
    attempt.obtainedMarks = obtainedMarks;
    attempt.correctAnswers = correctAnswers;
    attempt.wrongAnswers = wrongAnswers;
    attempt.unanswered = unanswered;
    attempt.percentage = percentage;
    attempt.isPassed = percentage >= exam.passingPercentage;
    attempt.status = 'completed';
    attempt.endTime = new Date();
    attempt.timeSpent = Math.round(
      (attempt.endTime - attempt.startTime) / 1000
    );

    await attempt.save();

    const result = {
      _id: attempt._id,
      obtainedMarks: attempt.obtainedMarks,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      isPassed: attempt.isPassed,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      unanswered: attempt.unanswered,
      timeSpent: attempt.timeSpent,
    };

    // Include answers if exam allows showing answers
    if (exam.showAnswers) {
      result.answers = attempt.answers;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's exam history
// @route   GET /api/exams/history
const getExamHistory = async (req, res) => {
  try {
    const attempts = await ExamAttempt.find({
      user: req.user._id,
      status: 'completed',
    })
      .populate({
        path: 'exam',
        select: 'title examType category subject level duration',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'subject', select: 'name' },
          { path: 'level', select: 'name color' },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats (admin)
// @route   GET /api/exams/stats
const getExamStats = async (req, res) => {
  try {
    const totalExams = await Exam.countDocuments();
    const practiceExams = await Exam.countDocuments({ examType: 'practice' });
    const mockExams = await Exam.countDocuments({ examType: 'mock' });
    const totalQuestions = await Question.countDocuments();
    const totalAttempts = await ExamAttempt.countDocuments({ status: 'completed' });

    const recentAttempts = await ExamAttempt.find({ status: 'completed' })
      .populate('user', 'name email')
      .populate('exam', 'title examType')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalExams,
      practiceExams,
      mockExams,
      totalQuestions,
      totalAttempts,
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
  getExamStats,
};
