# TH SAAS

## Overview
Node.js/Express app connecting to Google Sheets and HubSpot API.

## Tech Stack
- Runtime: Node.js + Express
- Data Sources: Google Sheets API v4, HubSpot CRM API
- Port: 3000

## Commands
```bash
npm install       # Install dependencies
npm run dev       # Start dev server (auto-reload)
npm start         # Start production server
```

## Project Structure
- `src/server.js`    — Express entry point and routes
- `src/sheets.js`    — Google Sheets API helper
- `src/hubspot.js`   — HubSpot API helper
- `credentials/`     — Google service account key (gitignored)
- `public/index.html`— Frontend

## Environment Variables (.env)
- `GOOGLE_SHEETS_ID`        — Spreadsheet ID from the Google Sheet URL
- `GOOGLE_SERVICE_ACCOUNT`  — ./credentials/service-account.json
- `HUBSPOT_ACCESS_TOKEN`    — HubSpot private app token
- `PORT`                    — Server port (default 3000)

## API Endpoints
- `GET /api/sheets`   — Fetch data from Google Sheet
- `GET /api/hubspot`  — Fetch data from HubSpot
- `GET /api/health`   — Health check

## Notes
- Google Sheets: share the sheet with the service account email address
- HubSpot: use a private app token (Settings > Integrations > Private Apps)
