/**
 * @swagger
 * components:
 *   schemas:
 *     Level:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         levelName: { type: string, example: 'Easy' }
 *         sortOrder: { type: number, default: 0 }
 *         color: { type: string, default: '#4CAF50' }
 *         isActive: { type: boolean, default: true }
 */

/**
 * @swagger
 * /api/levels:
 *   get:
 *     summary: Get all levels
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of levels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Level'
 *   post:
 *     summary: Create level (Admin Only)
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Level'
 *     responses:
 *       201:
 *         description: Level created
 *
 * /api/levels/{id}:
 *   put:
 *     summary: Update level (Admin Only)
 *     tags: [Levels]
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
 *             $ref: '#/components/schemas/Level'
 *     responses:
 *       200:
 *         description: Level updated
 *   delete:
 *     summary: Delete level (Admin Only)
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Level deleted
 */
