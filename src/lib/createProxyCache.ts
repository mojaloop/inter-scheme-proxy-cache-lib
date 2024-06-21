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

import { ProxyCacheFactory, ProxyCacheConfig } from '../types';
import { loggerFactory } from '../utils';
import { STORAGE_TYPE_VALUES } from '../constants';
import { ProxyCacheError } from './errors';

export const createProxyCache: ProxyCacheFactory = (proxyConfig: ProxyCacheConfig) => {
  if (!proxyConfig || typeof proxyConfig !== 'object') {
    throw ProxyCacheError.invalidProxyCacheConfig();
  }
  const logger = proxyConfig.logger || loggerFactory('ProxyCache');

  if (!STORAGE_TYPE_VALUES.includes(proxyConfig.type)) {
    const error = ProxyCacheError.unsupportedProxyCacheType();
    logger.verbose(error.message, proxyConfig);
    throw error;
  }

  // todo: - check if the rest options are valid (or need to be created from env vars)
  //       - instantiate the proxy-cache (based on the proxyConfig)
  return {
    async get(key: string) {
      logger.info('get', key);
      return 'Not implemented';
    },
  };
};
