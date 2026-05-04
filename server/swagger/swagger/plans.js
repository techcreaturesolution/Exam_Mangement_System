/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         planName: { type: string, example: 'Basic Plan' }
 *         price: { type: number, example: 99 }
 *         validityDays: { type: number, example: 30 }
 *         description: { type: string }
 *         features: { type: array, items: { type: string } }
 *         isActive: { type: boolean, default: true }
 */

/**
 * @swagger
 * /api/payments/plans:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plan'
 *   post:
 *     summary: Create plan (Admin Only)
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plan'
 *     responses:
 *       201:
 *         description: Plan created
 */

/**
 * @swagger
 * /api/payments/plans/{id}:
 *   get:
 *     summary: Get plan by ID
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Plan details
 *   put:
 *     summary: Update plan (Admin Only)
 *     tags: [Plans]
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
 *             $ref: '#/components/schemas/Plan'
 *     responses:
 *       200:
 *         description: Plan updated
 *   delete:
 *     summary: Delete plan (Admin Only)
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Plan deleted
 */
