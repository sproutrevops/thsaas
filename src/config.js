const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config.json');

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function writeConfig(data) {
  const current = readConfig();
  const updated = { ...current, ...data };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
  return updated;
}

function get(key) {
  const cfg = readConfig();
  return cfg[key] || process.env[key] || null;
}

module.exports = { readConfig, writeConfig, get };
