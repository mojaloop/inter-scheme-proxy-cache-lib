# @mojaloop/inter-scheme-proxy-cache-lib

`inter-scheme-proxy-cache-lib` is a common component that provides proxy caching mapping.
It helps reliably integrate proxy functionality throughout the all involved services.

### Use cases:
 - Proxy caching. (see [details](https://github.com/infitx-org/uml_diagrams/blob/main/Proxy/Proxy%20pattern%20-%20happy%20path.png))
 - Failure count cache with max failure count per {Id}. (see [details](https://github.com/infitx-org/uml_diagrams/blob/main/Proxy/Proxy%20pattern%20-%20Lazy%20Discovery%20-%20No%20Oracles.png))


### Install dependencies

```bash
npm install
```

## Build

Command to transpile Typescript into JS:

```bash
npm run build
```

## Run

```bash
npm start
```

## Tests

```bash
npm test
```

## Collaborators

- [Eugen Klymniuk](https://github.com/geka-evk)
