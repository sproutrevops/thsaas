require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const { getSheetTabs, getSheetData } = require('./sheets');
const { getHubSpotData } = require('./hubspot');
const { readConfig, writeConfig, get } = require('./config');
const { getAuthUrl, getUserFromCode, isAllowed, requireAuth } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(session({
  secret: get('SESSION_SECRET') || 'th-saas-change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  },
}));

app.use(requireAuth);

// ── Auth routes ──
app.get('/auth/google', (req, res) => {
  const clientId = get('GOOGLE_CLIENT_ID');
  if (!clientId) {
    return res.status(500).send('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }
  res.redirect(getAuthUrl());
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.redirect('/login?error=access_denied');
  try {
    const user = await getUserFromCode(code);
    if (!isAllowed(user.email)) {
      return res.redirect('/login?error=not_allowed');
    }
    req.session.user = { email: user.email, name: user.name, picture: user.picture };
    res.redirect('/');
  } catch (e) {
    console.error('OAuth callback error:', e.message);
    res.redirect('/login?error=auth_failed');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/api/me', (req, res) => {
  res.json(req.session.user || null);
});

app.use(express.static(path.join(__dirname, '../public')));

// Returns all tab names in the spreadsheet
app.get('/api/sheets/tabs', async (req, res) => {
  try {
    const tabs = await getSheetTabs();
    res.json({ tabs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Returns data for a specific sheet/range
app.get('/api/sheets', async (req, res) => {
  try {
    const range = req.query.range || 'Sheet1';
    const data = await getSheetData(range);
    res.json({ source: 'google_sheets', sheet: range, count: data.length, records: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hubspot', async (req, res) => {
  try {
    const data = await getHubSpotData();
    res.json({ source: 'hubspot', count: data.length, records: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/settings', (req, res) => {
  const sheetsId = get('GOOGLE_SHEETS_ID') || '';
  const hubspotToken = get('HUBSPOT_ACCESS_TOKEN') || '';
  res.json({
    GOOGLE_SHEETS_ID: sheetsId,
    HUBSPOT_ACCESS_TOKEN: hubspotToken ? '••••••••' + hubspotToken.slice(-6) : '',
    hasGoogleSheets: !!sheetsId,
    hasHubSpot: !!hubspotToken,
  });
});

app.post('/api/settings', (req, res) => {
  const { GOOGLE_SHEETS_ID, HUBSPOT_ACCESS_TOKEN } = req.body;
  const update = {};
  if (GOOGLE_SHEETS_ID !== undefined) update.GOOGLE_SHEETS_ID = GOOGLE_SHEETS_ID;
  if (HUBSPOT_ACCESS_TOKEN !== undefined && !HUBSPOT_ACCESS_TOKEN.startsWith('••••••••')) {
    update.HUBSPOT_ACCESS_TOKEN = HUBSPOT_ACCESS_TOKEN;
  }
  writeConfig(update);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`TH SAAS running at http://localhost:${PORT}`);
});
