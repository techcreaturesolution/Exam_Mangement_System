/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         userId: { type: string }
 *         planId: { type: string }
 *         startDate: { type: string, format: date-time }
 *         endDate: { type: string, format: date-time }
 *         status: { type: string, enum: [active, expired, cancelled] }
 */

/**
 * @swagger
 * /api/payments/my-subscription:
 *   get:
 *     summary: Get current active subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 */

/**
 * @swagger
 * /api/payments/check-access:
 *   get:
 *     summary: Check if user has active subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access status
 */
