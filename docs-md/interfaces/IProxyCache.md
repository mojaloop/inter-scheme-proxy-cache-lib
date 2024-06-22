[**@mojaloop/inter-scheme-proxy-cache-lib**](../README.md) • **Docs**

***

[@mojaloop/inter-scheme-proxy-cache-lib](../README.md) / IProxyCache

# Interface: IProxyCache

## Properties

### get()

> **get**: (`key`) => `Promise`\<`null` \| `string`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`null` \| `string`\>

#### Defined in

[types.ts:7](https://github.com/mojaloop/inter-scheme-proxy-cache-lib/blob/5b23cc633970a23f1400be0e698c6c3652fe9cb0/src/types.ts#L7)

***

### ~~getOldestKey()?~~

> `optional` **getOldestKey**: () => `Promise`\<`null` \| `string`\>

#### Deprecated

Use [IProxyCache.get](IProxyCache.md#get) instead.

#### Returns

`Promise`\<`null` \| `string`\>

#### Defined in

[types.ts:11](https://github.com/mojaloop/inter-scheme-proxy-cache-lib/blob/5b23cc633970a23f1400be0e698c6c3652fe9cb0/src/types.ts#L11)
