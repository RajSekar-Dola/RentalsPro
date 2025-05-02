/**
 * @swagger
 * /booking:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - fromDateTime
 *               - toDateTime
 *               - price
 *             properties:
 *               product_id:
 *                 type: string
 *               fromDateTime:
 *                 type: string
 *                 format: date-time
 *               toDateTime:
 *                 type: string
 *                 format: date-time
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Booking successful
 * 
 * /checkconflict:
 *   post:
 *     summary: Check booking date conflicts
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - fromDateTime
 *               - toDateTime
 *             properties:
 *               product_id:
 *                 type: string
 *               fromDateTime:
 *                 type: string
 *                 format: date-time
 *               toDateTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Conflict check result
 */