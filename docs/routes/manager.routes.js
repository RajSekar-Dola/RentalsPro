/**
 * @swagger
 * /grabManager:
 *   get:
 *     tags:
 *       - Manager
 *     summary: Get manager details
 *     description: Retrieve the manager's username using their ID from cookie
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: Manager name retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "john_manager"
 *       400:
 *         description: No user ID found in cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No user ID found in cookies"
 *       404:
 *         description: Manager not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Manager not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching Name"
 * 
 * /manager/fetchBookingnotifications:
 *   post:
 *     tags:
 *       - Manager
 *     summary: Get booking notifications
 *     description: Retrieve all booking notifications for the manager
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: Booking notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bookingid:
 *                     type: string
 *                     description: ID of the booking
 *                     example: "507f1f77bcf86cd799439011"
 *       500:
 *         description: Server error
 * 
 * /manager/uploadnotifications:
 *   get:
 *     tags:
 *       - Manager
 *     summary: Get upload notifications
 *     description: Retrieve all upload notifications for the manager
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: Upload notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Upload notification message
 *                     example: "New product uploaded"
 *                   seen:
 *                     type: boolean
 *                     description: Whether the notification has been seen
 *                     example: false
 *       500:
 *         description: Server error
 * 
 * /api/dashboard/daily-bookings-cat:
 *   get:
 *     tags:
 *       - Manager Dashboard
 *     summary: Get daily bookings for manager's branch
 *     description: Retrieve daily booking statistics for the last 7 days for manager's branch
 *     security:
 *       - userAuth: []
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
 *                     description: Number of bookings for that day
 *                     example: 5
 *       500:
 *         description: Server error
 * 
 * /api/dashboard/monthly-bookings-cat:
 *   get:
 *     tags:
 *       - Manager Dashboard
 *     summary: Get monthly bookings for manager's branch
 *     description: Retrieve monthly booking statistics for manager's branch
 *     security:
 *       - userAuth: []
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
 *                     example: 25
 *       500:
 *         description: Server error
 * 
 * /api/dashboard/categories-cat:
 *   get:
 *     tags:
 *       - Manager Dashboard
 *     summary: Get product categories statistics for manager's branch
 *     description: Retrieve product category distribution for manager's branch
 *     security:
 *       - userAuth: []
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
 *                     description: Number of products in this category
 *                     example: 15
 *       500:
 *         description: Server error
 * 
 * /api/dashboard/daily-revenue-cat:
 *   get:
 *     tags:
 *       - Manager Dashboard
 *     summary: Get daily revenue for manager's branch
 *     description: Retrieve daily revenue statistics for the last 7 days for manager's branch
 *     security:
 *       - userAuth: []
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
 *                     description: Total revenue for that day
 *                     example: 1500.50
 *       500:
 *         description: Server error
 * 
 * /api/dashboard/monthly-revenue-cat:
 *   get:
 *     tags:
 *       - Manager Dashboard
 *     summary: Get monthly revenue for manager's branch
 *     description: Retrieve monthly revenue statistics for manager's branch
 *     security:
 *       - userAuth: []
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
 *                     example: 45000.75
 *       500:
 *         description: Server error
 */ 