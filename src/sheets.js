const { google } = require('googleapis');
const { get } = require('./config');

function makeAuth() {
  return new google.auth.GoogleAuth({
    keyFile: get('GOOGLE_SERVICE_ACCOUNT') || process.env.GOOGLE_SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

async function getSheetTabs() {
  const sheets = google.sheets({ version: 'v4', auth: makeAuth() });
  const response = await sheets.spreadsheets.get({
    spreadsheetId: get('GOOGLE_SHEETS_ID'),
    fields: 'sheets.properties(sheetId,title,index)',
  });
  return response.data.sheets.map((s) => ({
    id: s.properties.sheetId,
    title: s.properties.title,
    index: s.properties.index,
  }));
}

async function getSheetData(range = 'Sheet1') {
  const sheets = google.sheets({ version: 'v4', auth: makeAuth() });

  // Sheet names with spaces must be wrapped in single quotes for the API
  const formattedRange = !range.includes('!') && /[^a-zA-Z0-9_]/.test(range)
    ? `'${range}'`
    : range;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: get('GOOGLE_SHEETS_ID'),
    range: formattedRange,
  });

  const rows = response.data.values || [];
  if (rows.length === 0) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((h, i) => [h, row[i] ?? null]))
  );
}

module.exports = { getSheetTabs, getSheetData };
