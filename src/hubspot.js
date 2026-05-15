const axios = require('axios');
const { get } = require('./config');

const HS_BASE = 'https://api.hubapi.com';

function headers() {
  return {
    Authorization: `Bearer ${get('HUBSPOT_ACCESS_TOKEN')}`,
    'Content-Type': 'application/json',
  };
}

async function getHubSpotData() {
  const res = await axios.get(`${HS_BASE}/crm/v3/objects/companies`, {
    headers: headers(),
    params: {
      limit: 100,
      properties: 'name,domain,industry,numberofemployees,annualrevenue,hs_object_id',
    },
  });

  return res.data.results.map((r) => ({ id: r.id, ...r.properties }));
}

module.exports = { getHubSpotData };
