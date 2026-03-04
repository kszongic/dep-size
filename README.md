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

# Compare multiple packages
dep-size axios got node-fetch undici

# JSON output for scripts/CI
dep-size react --json
```

### Example output

```
  express@4.21.0
    Size:    214.0 KB (unpacked)
    Files:   72
    Deps:    31 → accepts, array-flatten, body-parser, content-disposition...
    License: MIT

  fastify@5.1.0
    Size:    542.8 KB (unpacked)
    Files:   148
    Deps:    15 → @fastify/ajv-compiler, @fastify/error, @fastify/fast-json-stringify-compiler...
    License: MIT
```

## Features

- ⚡ **Fast** — queries npm registry directly, zero overhead
- 📦 **Size check** — see unpacked size before installing
- 🔗 **Dependency count** — know what you're pulling in
- 📊 **Compare packages** — side-by-side comparison of alternatives
- 🤖 **JSON output** — pipe into scripts and CI pipelines
- 🪶 **Zero dependencies** — just Node.js built-ins

## Use Cases

- Choosing between `axios` vs `got` vs `node-fetch`? Compare sizes.
- Auditing your `package.json` for bloat? Check each dep.
- CI gate to prevent oversized dependencies? Use `--json`.

## API

```js
// Also usable programmatically
const { getPackageInfo } = require('dep-size-cli');
```

## License

MIT © [kszongic](https://github.com/kszongic)

## Support

If this saved you time, consider [sponsoring](https://github.com/sponsors/kszongic) ❤️
