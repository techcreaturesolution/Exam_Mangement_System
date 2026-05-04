/**
 * @swagger
 * components:
 *   schemas:
 *     Exam:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         examTitle: { type: string }
 *         description: { type: string }
 *         categoryId: { type: string }
 *         subjectId: { type: string }
 *         levelId: { type: string }
 *         totalQuestions: { type: number }
 *         durationMinutes: { type: number }
 *         passingMarks: { type: number }
 *         negativeMarking: { type: boolean }
 *         randomQuestions: { type: boolean, default: true }
 *         showResult: { type: boolean, default: true }
 *         allowReview: { type: boolean, default: true }
 *         isDemo: { type: boolean, default: false }
 *         maxAttempts: { type: number, default: 0 }
 *         antiCheatEnabled: { type: boolean, default: true }
 *         maxViolations: { type: number, default: 3 }
 *         autoSubmitOnViolation: { type: boolean, default: false }
 *         instructions: { type: string }
 *         questions: { type: array, items: { type: string } }
 *         startDate: { type: string, format: date-time }
 *         endDate: { type: string, format: date-time }
 *         status: { type: string, enum: [draft, active, completed, archived], default: 'active' }
 */

/**
 * @swagger
 * /api/exams:
 *   get:
 *     summary: Get all exams
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exam'
 *
 *   post:
 *     summary: Create exam (Admin Only)
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exam'
 *     responses:
 *       201:
 *         description: Exam created
 */

/**
 * @swagger
 * /api/exams/{id}:
 *   get:
 *     summary: Get exam by ID
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Exam data
 *
 *   put:
 *     summary: Update exam (Admin Only)
 *     tags: [Exams]
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
 *             $ref: '#/components/schemas/Exam'
 *     responses:
 *       200:
 *         description: Exam updated
 *
 *   delete:
 *     summary: Delete exam (Admin Only)
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Exam deleted
 */
