/**
 * @swagger
 * tags:
 *   name: User
 *   description: User operations and dashboard features
 * 
 * /products:
 *   post:
 *     summary: Get products with optional filters in request body
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productType:
 *                 type: string
 *                 description: Filter by product type
 *               locationName:
 *                 type: string
 *                 description: Filter by location name
 *               fromDateTime:
 *                 type: string
 *                 format: date-time
 *                 description: Filter by start date
 *               toDateTime:
 *                 type: string
 *                 format: date-time
 *                 description: Filter by end date
 *               price:
 *                 type: number
 *                 description: Filter by maximum price
 *     responses:
 *       200:
 *         description: List of filtered products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errormessage:
 *                   type: string
 *                   example: "Failed to fetch products"
 * 
 * /grabDetails:
 *   get:
 *     summary: Get user profile details
 *     tags: [User]
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User's unique identifier
 *                 username:
 *                   type: string
 *                   description: User's username
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User's email address
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of booking IDs
 *       400:
 *         description: No user ID found in cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No username cookie found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 * 
 * /grabBookings:
 *   get:
 *     summary: Get user's booking history
 *     tags: [User]
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings and product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 BookingDetails:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 ProductDetails:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
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
 * /grabRentals:
 *   get:
 *     summary: Get user's rental history
 *     tags: [User]
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: List of user's rentals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rentedProducts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
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
 * /settings:
 *   post:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               editUsername:
 *                 type: string
 *                 description: New username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New password
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User details updated successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Username or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /login:
 *   post:
 *     summary: User login (use this endpoint with role="User")
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [User]
 *                 default: User
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 * 
 * /signup:
 *   post:
 *     summary: Register new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - dateofbirth
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               dateofbirth:
 *                 type: string
 *                 format: date
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Username or email already exists
 *       500:
 *         description: Server error
 */