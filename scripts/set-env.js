const fs = require('fs');
const path = require('path');

function loadDotEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  const result = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    result[key] = value;
  }
  return result;
}

// process.env tiene prioridad (CI/CD y plataformas de hosting)
// .env se usa como fallback solo en desarrollo local
const dotEnv = loadDotEnv();
const apiUrl = process.env['API_URL'] || dotEnv['API_URL'] || 'http://localhost:8080';

const content = `export const environment = {
  apiUrl: '${apiUrl}',
};
`;

const dest = path.resolve(__dirname, '..', 'src', 'environments', 'environment.ts');
fs.writeFileSync(dest, content, 'utf8');
console.log(`[set-env] environment.ts -> apiUrl: ${apiUrl}`);
