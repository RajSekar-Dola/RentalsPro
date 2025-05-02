/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - dateofbirth
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Unique username
 *         email:
 *           type: string
 *           format: email
 *           description: Unique email address
 *         dateofbirth:
 *           type: string
 *           format: date
 *         password:
 *           type: string
 *           format: password
 *         bookings:
 *           type: array
 *           items:
 *             type: string
 *         rentals:
 *           type: array
 *           items:
 *             type: string
 *         notifications:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               seen:
 *                 type: boolean
 *         expired:
 *           type: boolean
 */