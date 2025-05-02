/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *         profilePicture:
 *           type: string
 *           description: URL to user's profile picture
 *     
 *     Booking:
 *       type: object
 *       required:
 *         - product_id
 *         - buyerid
 *         - fromDateTime
 *         - toDateTime
 *         - price
 *       properties:
 *         product_id:
 *           type: string
 *           description: ID of the product being booked
 *         buyerid:
 *           type: string
 *           description: ID of the user making the booking
 *         fromDateTime:
 *           type: string
 *           format: date-time
 *           description: Start date and time of the booking
 *         toDateTime:
 *           type: string
 *           format: date-time
 *           description: End date and time of the booking
 *         price:
 *           type: number
 *           description: Price of the booking
 *         bookingDate:
 *           type: string
 *           format: date-time
 *           description: Date and time when the booking was made
 *         level:
 *           type: number
 *           default: 0
 *           description: Booking status level (0=pending, 1=confirmed, 2=completed, 3=cancelled)
 *     
 *     Review:
 *       type: object
 *       required:
 *         - username
 *         - text
 *         - rating
 *       properties:
 *         username:
 *           type: string
 *           description: Username of the reviewer
 *         text:
 *           type: string
 *           description: Review text content
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating given (1-5 stars)
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the review
 *     
 *     Product:
 *       type: object
 *       required:
 *         - productType
 *         - productName
 *         - locationName
 *         - fromDate
 *         - toDate
 *         - price
 *       properties:
 *         productType:
 *           type: string
 *           enum: [cars, bikes, cameras, drones, fishingrods, speakers, cycles]
 *           description: Type of the product
 *         productName:
 *           type: string
 *           description: Name of the product
 *         locationName:
 *           type: string
 *           description: Location where the product is available
 *         fromDate:
 *           type: string
 *           format: date-time
 *           description: Start date and time of availability
 *         toDate:
 *           type: string
 *           format: date-time
 *           description: End date and time of availability
 *         price:
 *           type: number
 *           minimum: 1
 *           description: Price per day
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *     
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         code:
 *           type: integer
 *           description: HTTP status code
 */