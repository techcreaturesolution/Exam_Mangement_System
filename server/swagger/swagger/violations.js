/**
 * @swagger
 * components:
 *   schemas:
 *     ExamViolation:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         attemptId: { type: string }
 *         userId: { type: string }
 *         violationType: { type: string, enum: [tab_switch, window_blur, full_screen_exit, multiple_faces, no_face, unknown_person] }
 *         details: { type: string }
 *         timestamp: { type: string, format: date-time }
 */

/**
 * @swagger
 * /api/violations:
 *   post:
 *     summary: Report an exam violation
 *     tags: [Violations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [attemptId, violationType]
 *             properties:
 *               attemptId: { type: string }
 *               violationType: { type: string }
 *               details: { type: string }
 *     responses:
 *       201:
 *         description: Violation reported
 *
 *   get:
 *     summary: Get all violations (Admin Only)
 *     tags: [Violations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of violations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamViolation'
 *
 * /api/violations/attempt/{attemptId}:
 *   get:
 *     summary: Get violations for a specific attempt
 *     tags: [Violations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: attemptId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of violations for attempt
 */
