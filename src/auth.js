const { OAuth2Client } = require('google-auth-library');
const { get } = require('./config');

function getClient() {
  return new OAuth2Client(
    get('GOOGLE_CLIENT_ID'),
    get('GOOGLE_CLIENT_SECRET'),
    get('OAUTH_REDIRECT_URI') || 'http://localhost:3000/auth/google/callback'
  );
}

function getAuthUrl() {
  return getClient().generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  });
}

async function getUserFromCode(code) {
  const client = getClient();
  const { tokens } = await client.getToken(code);
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: get('GOOGLE_CLIENT_ID'),
  });
  return ticket.getPayload(); // { email, name, picture, hd, sub, ... }
}

function isAllowed(email) {
  const emails  = (get('ALLOWED_EMAILS')  || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const domains = (get('ALLOWED_DOMAIN')  || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  // No restrictions configured → allow everyone (useful for initial setup)
  if (!emails.length && !domains.length) return true;
  const em = (email || '').toLowerCase();
  if (emails.includes(em)) return true;
  const dom = em.split('@')[1] || '';
  return domains.some(d => dom === d);
}

function requireAuth(req, res, next) {
  const isOpen = req.path === '/login' || req.path.startsWith('/auth/');
  if (isOpen) return next();
  if (req.session && req.session.user) return next();
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized — please log in' });
  }
  res.redirect('/login');
}

module.exports = { getAuthUrl, getUserFromCode, isAllowed, requireAuth };
