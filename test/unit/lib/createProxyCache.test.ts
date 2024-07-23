/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/

import { createProxyCache } from '#src/lib';
import { RedisProxyCache } from '#src/lib/storages';
import { ProxyCacheError, ValidationError } from '#src/lib/errors';
import { STORAGE_TYPES } from '#src/constants';
import { ProxyCacheConfig, StorageType, BasicConnectionConfig } from '#src/types';

import * as fixtures from '#test/fixtures';

describe('createProxyCache Tests -->', () => {
  test('should throw error if wrong storageType is passed', () => {
    expect(() => {
      createProxyCache('xxx' as StorageType, {} as ProxyCacheConfig);
    }).toThrow(ProxyCacheError.unsupportedProxyCacheType());
  });

  test('should throw error if no proxyConfig provided', () => {
    // @ts-expect-error TS2554: Expected 2 arguments, but got 1
    expect(() => createProxyCache(STORAGE_TYPES.redis)).toThrow(ValidationError);
  });

  test('should create RedisProxyCache instance', () => {
    const proxyCache = createProxyCache(STORAGE_TYPES.redis, fixtures.redisProxyConfigDto());
    expect(proxyCache).toBeInstanceOf(RedisProxyCache);
  });

  test('should use lazyConnect=true option by default', () => {
    const { cluster } = fixtures.redisProxyConfigDto();
    const proxyCache = createProxyCache(STORAGE_TYPES.redis, { cluster });
    // @ts-expect-error TS7053: Element implicitly has an any type because expression of type 'redisClient' can't be used to index type IProxyCache
    const { options } = proxyCache['redisClient'];
    expect(options.lazyConnect).toBe(true);
  });

  test('should fail if cluster array is empty', () => {
    const cluster: BasicConnectionConfig[] = [];
    // prettier-ignore
    expect(() => createProxyCache(STORAGE_TYPES.redis, { cluster }))
      .toThrow(ValidationError);
  });
});
