# dep-size

> Check npm package install size, dependency count, and bundle impact — before you `npm install`.

[![npm](https://img.shields.io/npm/v/dep-size-cli)](https://npmjs.com/package/dep-size-cli)

## Why?

Every `npm install` adds weight. **dep-size** lets you check what you're about to add to your project — size, dependencies, file count — in seconds, from your terminal.

## Install

```bash
npm install -g dep-size-cli
```

Or use directly with npx:

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

### Example output

```
  express@4.21.0
    Size:    214.0 KB (unpacked)
    Total:   ~1.8 MB (with all deps)
    Files:   72
    Deps:    31 → accepts, array-flatten, body-parser, content-disposition...
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
- 📏 **Total install size** — estimated total size including all transitive deps
- 🔗 **Dependency count** — know what you're pulling in
- 📊 **Compare & sort** — side-by-side comparison with `--sort` (largest first)
- 🚨 **CI gate** — `--warn=SIZE` exits with code 1 if threshold exceeded
- 🤖 **JSON output** — pipe into scripts and CI pipelines
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

- **Choosing alternatives:** `dep-size axios got node-fetch --sort` to compare sizes
- **Auditing bloat:** Check each dep in your `package.json`
- **CI pipeline gate:** `dep-size my-lib --warn=1MB --json` to prevent oversized deps
- **Understanding transitive deps:** `dep-size express --tree` to see the full picture

## GitHub Actions Example

```yaml
- name: Check dependency size
  run: npx dep-size-cli my-package --warn=2MB
```

## License

MIT © [kszongic](https://github.com/kszongic)

## Support

If this saved you time, consider [sponsoring](https://github.com/sponsors/kszongic) ❤️
