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

const infoCache = new Map();
async function getPackageInfo(name) {
  if (infoCache.has(name)) return infoCache.get(name);
  const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`);
  if (res.status === 404) { infoCache.set(name, null); return null; }
  const info = JSON.parse(res.data);
  infoCache.set(name, info);
  return info;
}

async function collectTree(name, depth, maxDepth, visited) {
  if (visited.has(name) || depth > maxDepth) return { name, circular: visited.has(name), deps: [] };
  visited.add(name);
  const info = await getPackageInfo(name);
  if (!info) return { name, notFound: true, deps: [] };
  const depNames = info.dependencies ? Object.keys(info.dependencies) : [];
  const deps = [];
  for (const d of depNames) {
    deps.push(await collectTree(d, depth + 1, maxDepth, new Set(visited)));
  }
  return { name, version: info.version, size: info.dist?.unpackedSize || 0, deps };
}

function printTree(node, prefix, isLast) {
  const connector = prefix === '' ? '' : (isLast ? '└── ' : '├── ');
  const sizeStr = node.size ? ` (${formatBytes(node.size)})` : '';
  const extra = node.circular ? ' [circular]' : (node.notFound ? ' [not found]' : '');
  console.log(`${prefix}${connector}${node.name}${node.version ? '@' + node.version : ''}${sizeStr}${extra}`);
  const childPrefix = prefix === '' ? '' : prefix + (isLast ? '    ' : '│   ');
  node.deps.forEach((d, i) => printTree(d, childPrefix, i === node.deps.length - 1));
}

function sumTree(node, seen = new Set()) {
  if (seen.has(node.name) || node.notFound || node.circular) return 0;
  seen.add(node.name);
  let total = node.size || 0;
  for (const d of node.deps) total += sumTree(d, seen);
  return total;
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const flags = rawArgs.filter(a => a.startsWith('-'));
  const args = rawArgs.filter(a => !a.startsWith('-'));
  const json = flags.includes('--json');
  const tree = flags.includes('--tree');
  const sort = flags.includes('--sort');
  const warnFlag = flags.find(f => f.startsWith('--warn='));
  const warnBytes = warnFlag ? parseSize(warnFlag.split('=')[1]) : null;
  const treeDepth = (() => {
    const f = flags.find(f => f.startsWith('--depth='));
    return f ? parseInt(f.split('=')[1]) || 3 : 3;
  })();

  if (args.length === 0) {
    console.log('dep-size — check npm package size before installing\n');
    console.log('Usage: dep-size <package> [package2 ...] [options]\n');
    console.log('Options:');
    console.log('  --json          JSON output');
    console.log('  --tree          Show dependency tree');
    console.log('  --depth=N       Tree depth (default: 3)');
    console.log('  --sort          Sort by size (largest first)');
    console.log('  --warn=SIZE     Exit 1 if size exceeds threshold (e.g. --warn=500KB)');
    console.log('\nExamples:');
    console.log('  dep-size express lodash');
    console.log('  dep-size axios got node-fetch --sort');
    console.log('  dep-size react --tree --depth=2');
    console.log('  dep-size lodash --warn=1MB --json   # CI gate');
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
    const fileCount = info.dist?.fileCount || '?';

    const r = {
      name,
      found: true,
      version: info.version,
      unpackedSize: unpacked,
      unpackedSizeHuman: formatBytes(unpacked),
      dependencies: deps.length,
      depList: deps,
      files: fileCount,
      license: info.license || 'unknown'
    };

    if (tree) {
      const treeData = await collectTree(name, 0, treeDepth, new Set());
      r.totalInstallSize = sumTree(treeData);
      r.totalInstallSizeHuman = formatBytes(r.totalInstallSize);
      r._tree = treeData;
    }

    results.push(r);
  }

  if (sort) results.sort((a, b) => (b.unpackedSize || 0) - (a.unpackedSize || 0));

  if (json) {
    const output = results.map(r => { const { _tree, ...rest } = r; return rest; });
    console.log(JSON.stringify(output, null, 2));
  } else {
    for (const r of results) {
      if (!r.found) continue;
      console.log('');
      const warn = warnBytes && r.unpackedSize > warnBytes;
      const color = warn ? '\x1b[33m' : '';
      const reset = '\x1b[0m';
      console.log(`  ${color}\x1b[1m${r.name}\x1b[0m${color}@${r.version}${reset}`);
      console.log(`    Size:    ${r.unpackedSizeHuman} (unpacked)${warn ? ' ⚠️  exceeds threshold' : ''}`);
      if (r.totalInstallSizeHuman) console.log(`    Total:   ~${r.totalInstallSizeHuman} (with all deps)`);
      console.log(`    Files:   ${r.files}`);
      console.log(`    Deps:    ${r.dependencies}${r.dependencies > 0 ? ' → ' + r.depList.slice(0, 8).join(', ') + (r.depList.length > 8 ? '...' : '') : ''}`);
      console.log(`    License: ${r.license}`);

      if (tree && r._tree) {
        console.log('');
        console.log('    Dependency tree:');
        r._tree.deps.forEach((d, i) => printTree(d, '      ', i === r._tree.deps.length - 1));
      }
    }
    console.log('');
  }

  if (warnBytes) {
    const exceeded = results.filter(r => r.found && r.unpackedSize > warnBytes);
    if (exceeded.length > 0) process.exit(1);
  }
}

function parseSize(str) {
  const m = str.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/i);
  if (!m) return null;
  const num = parseFloat(m[1]);
  const unit = (m[2] || 'B').toUpperCase();
  const mult = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
  return num * (mult[unit] || 1);
}

main();
