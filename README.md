# dep-size

> Check npm package install size, dependency count, and bundle impact — before you `npm install`.

[![npm version](https://img.shields.io/npm/v/dep-size-cli)](https://npmjs.com/package/dep-size-cli)
[![npm downloads](https://img.shields.io/npm/dm/dep-size-cli)](https://npmjs.com/package/dep-size-cli)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://npmjs.com/package/dep-size-cli)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-blue)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/dep-size-cli)](./LICENSE)

## Why?

Every `npm install` adds weight. Large dependencies slow down CI pipelines, bloat Docker images, increase serverless cold starts, and expand your attack surface. **dep-size** lets you check what you're about to add — size, dependencies, file count — in seconds, from your terminal.

## Install

```bash
npm install -g dep-size-cli
```

Or run instantly with npx (no install needed):

```bash
npx dep-size-cli express lodash axios
```

## Usage

```bash
# Check a single package
dep-size express

# Compare multiple packages (sort by size!)
dep-size axios got node-fetch undici --sort

# Show dependency tree
dep-size express --tree --depth=2

# JSON output for scripts/CI
dep-size react --json

# CI gate: fail if package exceeds size threshold
dep-size my-lib --warn=500KB
```

### Example Output

```
  express@4.21.0
    Size:    214.0 KB (unpacked)
    Total:   ~1.8 MB (with all deps)
    Files:   72
    Deps:    31  accepts, array-flatten, body-parser, content-disposition...
    License: MIT

    Dependency tree:
      ├── accepts@1.3.8 (5.3 KB)
      │   ├── mime-types@2.1.35 (4.2 KB)
      │   └── negotiator@0.6.3 (4.8 KB)
      ├── body-parser@1.20.3 (18.1 KB)
      └── ...
```

## Features

- ⚡ **Fast** — queries npm registry directly, zero overhead
- 📦 **Size check** — see unpacked size before installing
- 🌳 **Dependency tree** — visualize what gets pulled in with `--tree`
- 📊 **Total install size** — estimated total including all transitive deps
- 🔢 **Dependency count** — know what you're pulling in
- 🔀 **Compare & sort** — side-by-side comparison with `--sort` (largest first)
- 🚨 **CI gate** — `--warn=SIZE` exits with code 1 if threshold exceeded
- 📋 **JSON output** — pipe into scripts and CI pipelines
- 🪶 **Zero dependencies** — just Node.js built-ins

## Options

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |
| `--tree` | Show dependency tree |
| `--depth=N` | Tree depth (default: 3) |
| `--sort` | Sort results by size (largest first) |
| `--warn=SIZE` | Exit 1 if any package exceeds threshold (e.g. `500KB`, `1MB`) |

## Use Cases

### Choosing Between Alternatives

Before picking an HTTP library, compare them:

```bash
dep-size axios got node-fetch undici --sort
```

### Auditing Existing Dependencies

Check every dependency in your project:

```bash
dep-size $(node -e "console.log(Object.keys(require('./package.json').dependencies).join(' '))")
```

### CI Size Gate

Prevent dependency bloat in your pipeline:

```bash
dep-size my-package --warn=2MB --json
```

### Understanding Transitive Dependencies

See the full picture of what `express` pulls in:

```bash
dep-size express --tree --depth=3
```

### Docker Image Optimization

Audit deps before building production images — identify the heaviest packages and find lighter alternatives.

## GitHub Actions Example

```yaml
- name: Check dependency sizes
  run: |
    npx dep-size-cli my-package --warn=2MB
    npx dep-size-cli $(node -e "console.log(Object.keys(require('./package.json').dependencies).join(' '))") --sort --json > dep-report.json

- name: Upload size report
  uses: actions/upload-artifact@v4
  with:
    name: dependency-sizes
    path: dep-report.json
```

## Comparison

| Tool | What it does | Install size | Dependencies |
|------|-------------|-------------|-------------|
| **dep-size** | Check size before installing | tiny | 0 |
| [packagephobia](https://packagephobia.com) | Web-based size check | N/A (web) | N/A |
| [bundlephobia](https://bundlephobia.com) | Bundle size (browser) | N/A (web) | N/A |
| [cost-of-modules](https://www.npmjs.com/package/cost-of-modules) | Size of installed deps | large | many |
| `npm pack --dry-run` | Tarball size only | built-in | N/A |

**dep-size** is the only zero-dependency CLI that shows install size, dependency tree, and supports CI gating — all from your terminal.

## Related Tools

Other zero-dependency CLI tools by [kszongic](https://github.com/kszongic):

- [commitwiz-ai](https://npmjs.com/package/commitwiz-ai) — AI-powered git commit messages
- [npm-name-check](https://npmjs.com/package/npm-name-check) — Check npm package name availability
- [env-lint-cli](https://npmjs.com/package/env-lint-cli) — Lint .env files against .env.example
- [license-maker](https://npmjs.com/package/license-maker) — Generate LICENSE files from the CLI

## License

MIT © [kszongic](https://github.com/kszongic)

## Support

If this saved you time, consider [sponsoring](https://github.com/sponsors/kszongic) ⭐
