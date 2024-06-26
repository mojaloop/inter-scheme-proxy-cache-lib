# @mojaloop/inter-scheme-proxy-cache-lib

`inter-scheme-proxy-cache-lib` is a common component that provides proxy caching mapping.
It helps reliably integrate proxy functionality throughout the all involved services.

## Use cases:
 - Proxy caching. (see [details](https://github.com/infitx-org/uml_diagrams/blob/main/Proxy/Proxy%20pattern%20-%20happy%20path.png))
 - Failure count cache with max failure count per {Id}. (see [details](https://github.com/infitx-org/uml_diagrams/blob/main/Proxy/Proxy%20pattern%20-%20Lazy%20Discovery%20-%20No%20Oracles.png))

## Quick Start

### Installation

```bash
npm install @mojaloop/inter-scheme-proxy-cache-lib
```

### Basic Usage

```typescript
// ESM
import { createProxyCache, STORAGE_TYPES } from '@mojaloop/inter-scheme-proxy-cache-lib';
// CJS
const { createProxyCache } = require('@mojaloop/inter-scheme-proxy-cache-lib');

const proxyCache = createProxyCache(STORAGE_TYPES.redis, { 
  host: 'localhost',
  port: 6379,
  ...
});
await proxyCache.addDfspIdToProxyMapping('dfsp_1', 'proxyAB');
```

---
### API docs
Check [_IProxyCache_](https://mojaloop.github.io/inter-scheme-proxy-cache-lib/interfaces/IProxyCache.html) interface docs to get more details.

Comprehensive and interactive API documentation, based on TypeScript source code of the package,
could be found [**here**](https://mojaloop.github.io/inter-scheme-proxy-cache-lib)


### Environment Variables
| Env Variable Name           | Default Value | Description                        | 
|-----------------------------|---------------|------------------------------------|
| PROXY_CACHE_LOG_LEVEL       | `warn`        | The log level for the proxyCache |
| PROXY_CACHE_DEFAULT_TTL_SEC | `30`          | Default cache TTL for sendToProxiesList keys |


---
## Development

### Build

Command to transpile Typescript into JS:

```bash
npm run build
```

### Tests

```bash
npm test
```

### Generate Typedoc documentation

```bash
npm run docs
```

## Collaborators

- [Eugen Klymniuk](https://github.com/geka-evk)
