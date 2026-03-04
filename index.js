#!/usr/bin/env node

const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'dep-size-cli' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}

async function getPackageInfo(name) {
  const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`);
  if (res.status === 404) return null;
  return JSON.parse(res.data);
}

async function getPackageSize(name, version) {
  try {
    const res = await fetch(`https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`);
    return parseInt(res.data.length) || null;  
  } catch { return null; }
}

async function main() {
  const args = process.argv.slice(2).filter(a => !a.startsWith('-'));
  const json = process.argv.includes('--json');

  if (args.length === 0) {
    console.log('Usage: dep-size <package> [package2 ...] [--json]');
    console.log('  Check npm package size and dependency count before installing.');
    process.exit(0);
  }

  const results = [];

  for (const name of args) {
    const info = await getPackageInfo(name);
    if (!info) {
      console.log(`\x1b[31m  ✗ ${name} — not found\x1b[0m`);
      results.push({ name, found: false });
      continue;
    }

    const deps = info.dependencies ? Object.keys(info.dependencies) : [];
    const unpacked = info.dist?.unpackedSize || 0;
    const tarball = info.dist?.fileCount || '?';

    const r = {
      name,
      found: true,
      version: info.version,
      unpackedSize: unpacked,
      unpackedSizeHuman: formatBytes(unpacked),
      dependencies: deps.length,
      depList: deps,
      files: tarball,
      license: info.license || 'unknown'
    };
    results.push(r);

    if (!json) {
      console.log('');
      console.log(`  \x1b[1m${name}\x1b[0m@${r.version}`);
      console.log(`    Size:    ${r.unpackedSizeHuman} (unpacked)`);
      console.log(`    Files:   ${r.files}`);
      console.log(`    Deps:    ${r.dependencies}${r.dependencies > 0 ? ' → ' + deps.slice(0, 8).join(', ') + (deps.length > 8 ? '...' : '') : ''}`);
      console.log(`    License: ${r.license}`);
    }
  }

  if (json) console.log(JSON.stringify(results, null, 2));
  else console.log('');
}

main();
