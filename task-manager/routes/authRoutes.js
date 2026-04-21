const express = require('express');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const authController = require('../controllers/authController');
const oauthController = require('../controllers/oauthController');
const { registerAdminRules, registerMemberRules, loginRules } = require('../middleware/validators/authValidators');
const validate = require('../middleware/validate');

const router = express.Router();

// 10 attempts per 15 min per IP — blocks brute-force on invite codes and passwords
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'fail', message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /auth/register/admin:
 *   post:
 *     summary: Register as admin — creates a new organization
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orgName, name, email, password]
 *             properties:
 *               orgName:  { type: string, example: My Company }
 *               name:     { type: string, example: Alice }
 *               email:    { type: string, example: alice@company.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       201:
 *         description: Admin registered. Response includes inviteCode to share with members.
 */
router.post('/register/admin',  authLimiter, registerAdminRules,  validate, authController.registerAdmin);

/**
 * @swagger
 * /auth/register/member:
 *   post:
 *     summary: Register as member — requires invite code from admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [inviteCode, name, email, password]
 *             properties:
 *               inviteCode: { type: string, example: A3F9C2B1 }
 *               name:       { type: string, example: Bob }
 *               email:      { type: string, example: bob@company.com }
 *               password:   { type: string, example: secret123 }
 *     responses:
 *       201:
 *         description: Member registered and joined organization.
 *       400:
 *         description: Invalid invite code.
 */
router.post('/register/member', authLimiter, registerMemberRules, validate, authController.registerMember);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, loginRules, validate, authController.login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/v1/auth/google/failure' }),
  oauthController.googleCallback
);
router.get('/google/failure', (req, res) => {
  res.status(401).json({ status: 'fail', message: 'Google authentication failed.' });
});

module.exports = router;
