# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Testing
- `npm run build` - Build the library using tsup (outputs CJS and ESM formats to dist/)
- `npm run test` or `npm run test:unit` - Run unit tests using Jest
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:integration` - Run integration tests with Redis cluster via Docker
- `npm run test:int` - Run integration tests only (requires Docker services to be running)

### Code Quality
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Auto-fix linting issues
- `npm run audit:check` - Check for security vulnerabilities
- `npm run dep:check` - Check for dependency updates

### Docker Integration Tests
- `npm run dc:build` - Build Docker Compose services (Redis cluster)
- `npm run dc:up` - Start Redis cluster for integration testing
- `npm run dc:down` - Stop and remove Docker services
- `npm run wait-4-docker` - Wait for Docker containers to be ready

### Documentation
- `npm run docs` - Generate TypeDoc documentation

## Project Architecture

### Core Components

**ProxyCache Factory Pattern**: The main entry point is `createProxyCache()` which implements a factory pattern to create different storage implementations based on the storage type.

**Storage Layer**: Currently supports Redis (single instance and cluster) with the `RedisProxyCache` class. MySQL support is planned but not implemented.

**Main Interface**: `IProxyCache` defines the contract for all proxy cache implementations, providing methods for:
- DFSP to proxy mapping management
- Proxy timeout handling
- Failure tracking and response processing
- Expired key processing

### Key Modules

- `src/lib/createProxyCache.ts` - Factory function for creating proxy cache instances
- `src/lib/storages/RedisProxyCache.ts` - Redis implementation of IProxyCache
- `src/types/lib.ts` - Core TypeScript interfaces and types
- `src/validation.ts` - Configuration validation using Convict
- `src/config.ts` - Application configuration management

### Directory Structure

```
src/
├── lib/           # Core implementation
│   └── storages/  # Storage implementations (Redis, future MySQL)
├── types/         # TypeScript type definitions
├── utils/         # Utility functions and logger
├── config.ts      # Configuration management
├── validation.ts  # Config validation schemas
└── constants.ts   # Application constants
```

## Testing Strategy

- **Unit Tests**: Located in `test/unit/` - test individual components in isolation
- **Integration Tests**: Located in `test/integration/` - test against real Redis cluster using Docker
- **Test Environment**: Uses Jest with ts-jest for TypeScript support
- **Mocking**: Uses `ioredis-mock` for unit testing Redis interactions

## Configuration

The library uses environment variables for configuration:
- `PROXY_CACHE_LOG_LEVEL` - Controls logging verbosity (default: warn)
- `PROXY_CACHE_DEFAULT_TTL_SEC` - Default cache TTL (default: 30 seconds)

## Code Style

- **TypeScript**: Strict mode enabled with noUncheckedIndexedAccess
- **ESLint**: Custom configuration with TypeScript rules, 2-space indentation
- **Prettier**: Code formatting (configured via .prettierrc.js)
- **Path Aliases**: Uses `#src/*` for internal imports
- **Exports**: Dual CJS/ESM support via tsup build configuration

## Dependencies

- **Runtime**: ioredis (Redis client), convict (configuration), ajv (validation)
- **Development**: Jest, TypeScript, ESLint, Docker Compose for integration testing
- **Node Version**: Requires Node.js >=22.15.0
