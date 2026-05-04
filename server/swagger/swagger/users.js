/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string, example: '507f1f77bcf86cd799439011' }
 *         name: { type: string, example: 'John Doe' }
 *         email: { type: string, example: 'john@example.com' }
 *         mobile: { type: string, example: '9876543210' }
 *         role: { type: string, enum: [admin, student], example: 'student' }
 *         isActive: { type: boolean, default: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, example: 'admin@example.com' }
 *         password: { type: string, example: 'password123' }
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token: { type: string }
 *         user: { $ref: '#/components/schemas/User' }
 *     RegisterRequest:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name: { type: string, example: 'John Doe' }
 *         email: { type: string, example: 'john@example.com' }
 *         password: { type: string, example: 'password123' }
 *         mobile: { type: string, example: '9876543210' }
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new student
 *     tags: [Users & Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *
 * /api/auth/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Users & Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Users & Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *
 * /api/users:
 *   get:
 *     summary: Get all students (Admin Only)
 *     tags: [Users & Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: isActive
 *         in: query
 *         schema: { type: boolean }
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of students
 *
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin Only)
 *     tags: [Users & Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User data retrieved
 *
 *   put:
 *     summary: Update user (Admin Only)
 *     tags: [Users & Auth]
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
 *               name: { type: string }
 *               email: { type: string }
 *               mobile: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: User updated
 *
 *   delete:
 *     summary: Delete user (Admin Only)
 *     tags: [Users & Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 */
