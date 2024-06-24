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
import { createProxyCache } from '@mojaloop/inter-scheme-proxy-cache-lib';
// CJS
const { createProxyCache } = require('@mojaloop/inter-scheme-proxy-cache-lib');

const proxyCache = createProxyCache({ type: 'redis', ... });
// todo: define usefull example
await proxyCache.addDfspIdToProxyMapping('proxyId_1', { url: 'https://hab-a/proxy' });
```

### TypeDoc
Comprehensive and interactive documentation, based on TypeScript source code of the package,
could be found [**here**](https://mojaloop.github.io/inter-scheme-proxy-cache-lib)


### API
```typescript
 addDfspIdToProxyMapping: (dfspId: string, details: PoxyDetails) => Promise<boolean>;
 // Add the proxyAdapter details of a particular DFSP to proxy mapping

 ...
 // todo: add all methods
```

### Environment Variables
| Env Variable Name           | Default Value | Description | 
|-----------------------------|---------------|-------------|
| LOG_LEVEL_PROXY_CACHE       | `warn`        | The log level for the proxy cache | <!-- white -->
| todo: add required env vars |  |  | 



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

## Collaborators

- [Eugen Klymniuk](https://github.com/geka-evk)
