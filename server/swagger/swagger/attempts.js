/**
 * @swagger
 * components:
 *   schemas:
 *     ExamAttempt:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         examId: { type: string }
 *         userId: { type: string }
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionId: { type: string }
 *               selectedAnswer: { type: string }
 *               isCorrect: { type: boolean }
 *               marksObtained: { type: number }
 *               timeTaken: { type: number }
 *         score: { type: number }
 *         totalMarks: { type: number }
 *         percentage: { type: number }
 *         rank: { type: number }
 *         correctAnswers: { type: number }
 *         wrongAnswers: { type: number }
 *         unanswered: { type: number }
 *         violations: { type: number }
 *         startedAt: { type: string, format: date-time }
 *         submittedAt: { type: string, format: date-time }
 *         status: { type: string, enum: [in_progress, completed, abandoned, auto_submitted] }
 *         timeSpent: { type: number }
 */

/**
 * @swagger
 * /api/exams/{id}/start:
 *   post:
 *     summary: Start an exam attempt
 *     tags: [Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Exam attempt started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamAttempt'
 *
 * /api/exams/{id}/submit:
 *   post:
 *     summary: Submit exam answers
 *     tags: [Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId: { type: string }
 *                     selectedAnswer: { type: string }
 *     responses:
 *       200:
 *         description: Exam submitted successfully
 *
 * /api/exams/history:
 *   get:
 *     summary: Get exam history (Student)
 *     tags: [Attempts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of attempts
 *
 * /api/exams/review/{attemptId}:
 *   get:
 *     summary: Review exam attempt
 *     tags: [Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: attemptId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Attempt details
 */
