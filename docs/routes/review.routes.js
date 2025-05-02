/**
 * @swagger
 * /home/postreview:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Create a new review
 *     description: Allows authenticated users to post a new review
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - rating
 *             properties:
 *               text:
 *                 type: string
 *                 description: The review text content
 *                 example: "Great service and excellent equipment quality!"
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating value between 1 and 5
 *                 example: 4.5
 *     responses:
 *       200:
 *         description: Review successfully posted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "review successfully sent!"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please login to post a review."
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Missing required fields"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 * 
 * /home/getreviews:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get all reviews
 *     description: Retrieve all reviews from the system
 *     responses:
 *       200:
 *         description: List of all reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                         description: Username of the reviewer
 *                         example: "john_doe"
 *                       text:
 *                         type: string
 *                         description: Review content
 *                         example: "Great service!"
 *                       rating:
 *                         type: number
 *                         description: Rating given by the user
 *                         example: 4.5
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching reviews"
 */