/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           description: Username for login
 *           example: "john_doe"
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: [User, Manager, Admin]
 *           description: Role of the user
 *           example: "User"
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Login successful"
 *         role:
 *           type: string
 *           enum: [User, Manager, Admin]
 *           description: Role of the authenticated user
 *           example: "User"
 *
 * tags:
 *   name: Authentication
 *   description: Login endpoints for users, managers, and admins
 *
 * /login:
 *   post:
 *     summary: Authenticate user/manager/admin
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: Authentication cookie
 *               example: user_id=abc123; Path=/; HttpOnly
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /signOut:
 *   post:
 *     summary: Logout user/manager/admin
 *     tags: [Authentication]
 *     security:
 *       - userAuth: []
 *       - managerAuth: []
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: Clear authentication cookie
 *               example: user_id=; Path=/; HttpOnly; Max-Age=0
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */