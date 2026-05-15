# TH SAAS

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT, HUBSPOT_ACCESS_TOKEN

# 3. Add Google service account key
# Drop your service-account.json into the credentials/ folder

# 4. Start dev server
npm run dev

# 5. Open Claude Code
claude
```

## Endpoints
- `GET /api/sheets`  — Google Sheet data
- `GET /api/hubspot` — HubSpot companies
- `GET /api/health`  — Health check
