/**
 * @swagger
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: Admin is not logged in
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Unauthorized: Admin authentication required"
 * 
 * /api/addBranch:
 *   post:
 *     tags:
 *       - Admin Branch Management
 *     summary: Add a new branch
 *     description: Add a new branch location to the system (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the new branch
 *                 example: "Downtown Branch"
 *     responses:
 *       201:
 *         description: Branch added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Location added successfully"
 *                 locations:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Downtown Branch", "North Branch"]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         description: Branch already exists
 *       500:
 *         description: Server error
 * 
 * /admindashboard/createmanager:
 *   post:
 *     tags:
 *       - Admin Manager Management
 *     summary: Create a new manager
 *     description: Create a new manager account for a branch (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - branch
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_manager"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securepass123"
 *               branch:
 *                 type: string
 *                 example: "Downtown Branch"
 *     responses:
 *       201:
 *         description: Manager created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errormessage:
 *                   type: string
 *                   example: "Manager created successfully !"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Error in manager creation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errormessage:
 *                   type: string
 *                   example: "Email already exists"
 *       500:
 *         description: Server error
 * 
 * /admindashboard/registeredmanagers:
 *   get:
 *     tags:
 *       - Admin Manager Management
 *     summary: Get all registered managers
 *     description: Retrieve a list of all registered managers (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: List of managers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 registercount:
 *                   type: number
 *                   example: 5
 *                 managers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       branch:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 * 
 * /admindashboard/registeredusers:
 *   get:
 *     tags:
 *       - Admin User Management
 *     summary: Get all registered users
 *     description: Retrieve a list of all registered users (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 registercount:
 *                   type: number
 *                   example: 100
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       dateofbirth:
 *                         type: string
 *                         format: date
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 * 
 * /admindashboard/deleteusers:
 *   post:
 *     tags:
 *       - Admin User Management
 *     summary: Delete a user
 *     description: Delete a user and optionally their associated data (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: MongoDB _id of the user to delete
 *                 example: "643f2d4e1a5f7d8e9b0c1234"
 *               forceDelete:
 *                 type: boolean
 *                 description: Whether to force delete user with existing bookings
 *                 example: false
 *     responses:
 *       200:
 *         description: User deletion status
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "User and their bookings/products deleted successfully!"
 *                 - type: object
 *                   properties:
 *                     alert:
 *                       type: boolean
 *                       example: true
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "User not found in database!"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error!"
 * 
 * /api/dashboard/daily-uploads:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get daily product uploads
 *     description: Retrieve daily product upload statistics for the last 7 days (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Daily uploads retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Date in YYYY-MM-DD format
 *                     example: "2024-03-20"
 *                   count:
 *                     type: number
 *                     example: 10
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 * 
 * /api/dashboard/monthly-uploads:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get monthly product uploads
 *     description: Retrieve monthly product upload statistics (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Monthly uploads retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: number
 *                         example: 2024
 *                       month:
 *                         type: number
 *                         example: 3
 *                   count:
 *                     type: number
 *                     example: 45
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 * 
 * /api/dashboard/daily-bookings:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get daily bookings
 *     description: Retrieve daily booking statistics for the last 7 days (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Daily bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Date in YYYY-MM-DD format
 *                     example: "2024-03-20"
 *                   count:
 *                     type: number
 *                     example: 15
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 * 
 * /api/dashboard/monthly-bookings:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get monthly bookings
 *     description: Retrieve monthly booking statistics (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Monthly bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: number
 *                         example: 2024
 *                       month:
 *                         type: number
 *                         example: 3
 *                   count:
 *                     type: number
 *                     example: 150
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 * 
 * /api/dashboard/categories:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get product categories statistics
 *     description: Retrieve product category distribution across the system (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Categories statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Product type/category
 *                     example: "Electronics"
 *                   count:
 *                     type: number
 *                     example: 50
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 * 
 * /api/dashboard/daily-revenue:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get daily revenue
 *     description: Retrieve daily revenue statistics for the last 7 days (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Daily revenue retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Date in YYYY-MM-DD format
 *                     example: "2024-03-20"
 *                   totalRevenue:
 *                     type: number
 *                     example: 5000.50
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 * 
 * /api/dashboard/monthly-revenue:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get monthly revenue
 *     description: Retrieve monthly revenue statistics (Requires admin authentication)
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Monthly revenue retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: number
 *                         example: 2024
 *                       month:
 *                         type: number
 *                         example: 3
 *                   totalRevenue:
 *                     type: number
 *                     example: 75000.25
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */ 