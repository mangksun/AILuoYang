import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const miniappDir = resolve(scriptDir, '..');
const envPath = resolve(miniappDir, '.env.local');

function isPrivateIpv4(address) {
  return (
    /^10\./.test(address)
    || /^192\.168\./.test(address)
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
  );
}

function scoreAddress(address) {
  if (/^192\.168\./.test(address)) return 300;
  if (/^10\./.test(address)) return 200;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(address)) return 100;
  return 0;
}

function scoreInterfaceName(name) {
  if (/wi-?fi|wlan|ethernet|以太网/i.test(name)) return 1000;
  if (/virtual|vethernet|vmware|docker|wsl|loopback|host-only|meta/i.test(name)) return -500;
  return 0;
}

function detectWindowsDefaultRouteHost() {
  if (process.platform !== 'win32') return '';

  try {
    const output = execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        [
          'Get-NetIPConfiguration',
          "| Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq 'Up' }",
          '| ForEach-Object { [PSCustomObject]@{ Alias = $_.InterfaceAlias; Address = $_.IPv4Address.IPAddress } }',
          '| ConvertTo-Json -Compress',
        ].join(' '),
      ],
      { encoding: 'utf8' },
    ).trim();

    if (!output) return '';
    const parsed = JSON.parse(output);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const candidates = rows
      .flatMap((row) => {
        const addresses = Array.isArray(row.Address) ? row.Address : [row.Address];
        return addresses
          .filter((address) => typeof address === 'string' && isPrivateIpv4(address))
          .map((address) => ({
            address,
            name: String(row.Alias || ''),
            score: scoreAddress(address) + scoreInterfaceName(String(row.Alias || '')),
          }));
      })
      .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));

    return candidates[0]?.address || '';
  } catch {
    return '';
  }
}

function detectLanHost() {
  const explicitHost = process.env.MINIAPP_DEV_HOST?.trim();
  if (explicitHost) return explicitHost;

  const windowsDefaultRouteHost = detectWindowsDefaultRouteHost();
  if (windowsDefaultRouteHost) return windowsDefaultRouteHost;

  const candidates = [];
  const nets = networkInterfaces();

  for (const [name, entries] of Object.entries(nets)) {
    for (const entry of entries || []) {
      if (entry.family !== 'IPv4' || entry.internal || !isPrivateIpv4(entry.address)) {
        continue;
      }

      candidates.push({
        address: entry.address,
        name,
        score: scoreAddress(entry.address) + scoreInterfaceName(name),
      });
    }
  }

  candidates.sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
  return candidates[0]?.address || '127.0.0.1';
}

function readPort(name, fallback) {
  const value = process.env[name]?.trim();
  return value || fallback;
}

const host = detectLanHost();
const gatewayPort = readPort('MINIAPP_GATEWAY_PORT', '3000');
const live2dPort = readPort('MINIAPP_LIVE2D_PORT', '5173');
const voicePort = readPort('MINIAPP_VOICE_PORT', '8000');

const envContent = [
  `VITE_MINIAPP_API_BASE_URL=http://${host}:${gatewayPort}/api`,
  `VITE_MINIAPP_LIVE2D_H5_URL=http://${host}:${live2dPort}/live2d/index.html`,
  `VITE_MINIAPP_VOICE_API_BASE_URL=http://${host}:${voicePort}`,
  '',
].join('\n');

writeFileSync(envPath, envContent, 'utf8');

console.log(`[miniapp] wrote ${envPath}`);
console.log(`[miniapp] dev host: ${host}`);
