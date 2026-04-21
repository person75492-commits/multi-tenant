const { issueToken } = require('../services/authService');

/**
 * Called after Passport verifies the Google profile.
 * Sends the JWT as a short-lived HttpOnly cookie so it never
 * appears in server logs, browser history, or referrer headers.
 * The frontend reads it on the /oauth/callback page and moves it
 * to memory / secure storage, then clears the cookie.
 */
exports.googleCallback = (req, res) => {
  const token = issueToken(req.user);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('oauth_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: 5 * 60 * 1000, // 5 minutes — just long enough for the frontend to pick it up
  });

  res.redirect(`${clientUrl}/oauth/callback`);
};
