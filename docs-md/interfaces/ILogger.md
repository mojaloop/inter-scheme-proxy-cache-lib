[**@mojaloop/inter-scheme-proxy-cache-lib**](../README.md) • **Docs**

***

[@mojaloop/inter-scheme-proxy-cache-lib](../README.md) / ILogger

# Interface: ILogger

## Extends

- `LogMethods`

## Properties

### audit

> **audit**: `LogMethod`

#### Inherited from

`LogMethods.audit`

***

### debug

> **debug**: `LogMethod`

#### Inherited from

`LogMethods.debug`

***

### error

> **error**: `LogMethod`

#### Inherited from

`LogMethods.error`

***

### info

> **info**: `LogMethod`

#### Inherited from

`LogMethods.info`

***

### isAuditEnabled

> **isAuditEnabled**: `boolean`

#### Inherited from

`LogMethods.isAuditEnabled`

***

### isDebugEnabled

> **isDebugEnabled**: `boolean`

#### Inherited from

`LogMethods.isDebugEnabled`

***

### isErrorEnabled

> **isErrorEnabled**: `boolean`

#### Inherited from

`LogMethods.isErrorEnabled`

***

### isInfoEnabled

> **isInfoEnabled**: `boolean`

#### Inherited from

`LogMethods.isInfoEnabled`

***

### isPerfEnabled

> **isPerfEnabled**: `boolean`

#### Inherited from

`LogMethods.isPerfEnabled`

***

### isSillyEnabled

> **isSillyEnabled**: `boolean`

#### Inherited from

`LogMethods.isSillyEnabled`

***

### isTraceEnabled

> **isTraceEnabled**: `boolean`

#### Inherited from

`LogMethods.isTraceEnabled`

***

### isVerboseEnabled

> **isVerboseEnabled**: `boolean`

#### Inherited from

`LogMethods.isVerboseEnabled`

***

### isWarnEnabled

> **isWarnEnabled**: `boolean`

#### Inherited from

`LogMethods.isWarnEnabled`

***

### perf

> **perf**: `LogMethod`

#### Inherited from

`LogMethods.perf`

***

### silly

> **silly**: `LogMethod`

#### Inherited from

`LogMethods.silly`

***

### trace

> **trace**: `LogMethod`

#### Inherited from

`LogMethods.trace`

***

### verbose

> **verbose**: `LogMethod`

#### Inherited from

`LogMethods.verbose`

***

### warn

> **warn**: `LogMethod`

#### Inherited from

`LogMethods.warn`

## Methods

### child()

> **child**(`context`?): [`ILogger`](ILogger.md)

#### Parameters

• **context?**: `LogContext`

#### Returns

[`ILogger`](ILogger.md)

#### Defined in

[types.ts:43](https://github.com/mojaloop/inter-scheme-proxy-cache-lib/blob/5b23cc633970a23f1400be0e698c6c3652fe9cb0/src/types.ts#L43)
