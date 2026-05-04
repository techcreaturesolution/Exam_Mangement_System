/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         categoryId: { type: string }
 *         subjectId: { type: string }
 *         levelId: { type: string }
 *         question: { type: string }
 *         optionA: { type: string }
 *         optionB: { type: string }
 *         optionC: { type: string }
 *         optionD: { type: string }
 *         answer: { type: string, enum: [A, B, C, D] }
 *         marks: { type: number }
 *         explanation: { type: string }
 */

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions (Admin Only)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of questions
 *
 *   post:
 *     summary: Create question (Admin Only)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Question'
 *     responses:
 *       201:
 *         description: Question created
 */

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get question by ID (Admin Only)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Question data
 *
 *   put:
 *     summary: Update question (Admin Only)
 *     tags: [Questions]
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
 *             $ref: '#/components/schemas/Question'
 *     responses:
 *       200:
 *         description: Question updated
 *
 *   delete:
 *     summary: Delete question (Admin Only)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Question deleted
 */

/**
 * @swagger
 * /api/questions/import:
 *   post:
 *     summary: Import questions from file (Admin Only)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Questions imported
 */

/**
 * @swagger
 * /api/questions/count:
 *   get:
 *     summary: Get question count (Admin Only)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total count
 */
