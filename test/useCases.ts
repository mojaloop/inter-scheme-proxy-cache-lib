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

import { IProxyCache } from '#src/types';
import * as fixtures from '#test/fixtures';

/*
  Use cases to check any IProxyCache implementations.
  So don't add here any particular class or details of implementation, use only interface methods/props.
  Is supposed to be used in unit/integration tests.
 */

export const proxyMappingUseCase = async (proxyCache: IProxyCache) => {
  expect(proxyCache.isConnected).toBe(true);

  const dfspId = `dfsp-${randomIntSting()}`;
  let noProxyId = await proxyCache.lookupProxyByDfspId(dfspId);
  expect(noProxyId).toBeNull();

  const proxyId = `proxy-${randomIntSting()}`;
  const isAdded = await proxyCache.addDfspIdToProxyMapping(dfspId, proxyId);
  expect(isAdded).toBe(true);

  const found = await proxyCache.lookupProxyByDfspId(dfspId);
  expect(found).toBe(proxyId);

  const isRemoved = await proxyCache.removeDfspIdFromProxyMapping(dfspId);
  expect(isRemoved).toBe(true);

  noProxyId = await proxyCache.lookupProxyByDfspId(dfspId);
  expect(noProxyId).toBeNull();

  return true;
};

export const detectFinalErrorCallbackUseCase = async (proxyCache: IProxyCache) => {
  const alsReq = fixtures.alsRequestDetailsDto();
  const proxyIds = ['proxyA', 'proxyB', 'proxyC'];

  const isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 10);
  expect(isOk).toBe(true);

  let isLast = await proxyCache.receivedErrorResponse(alsReq, 'proxyA');
  expect(isLast).toBe(false);

  isLast = await proxyCache.receivedErrorResponse(alsReq, 'proxyB');
  expect(isLast).toBe(false);
  isLast = await proxyCache.receivedErrorResponse(alsReq, 'proxyB');
  expect(isLast).toBe(false);

  isLast = await proxyCache.receivedErrorResponse(alsReq, 'proxyC');
  expect(isLast).toBe(true);

  return true;
};

export const setSendToProxiesListOnceUseCase = async (proxyCache: IProxyCache) => {
  const alsReq = fixtures.alsRequestDetailsDto();
  const proxyIds = [`proxy1-${Date.now()}`, `proxy2-${Date.now()}`];
  let isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 1);
  expect(isOk).toBe(true);
  isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 1);
  expect(isOk).toBe(false);
  return true;
};

export const notSetSendToProxiesListForTheSameAlsRequestUseCase = async (proxyCache: IProxyCache) => {
  const alsReq = fixtures.alsRequestDetailsDto();
  const proxyIds = ['proxy123', 'proxy098'];
  let isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 1);
  expect(isOk).toBe(true);
  isOk = await proxyCache.setSendToProxiesList(alsReq, ['proxyAB'], 1);
  expect(isOk).toBe(false);
  return true;
};

export const shareDbInfoForAllConnectedInstances = async (proxyCache: IProxyCache, anotherProxyCache: IProxyCache) => {
  const alsReq = fixtures.alsRequestDetailsDto();
  const proxyId = 'proxyXZ';

  const isOk = await proxyCache.setSendToProxiesList(alsReq, [proxyId], 1);
  expect(isOk).toBe(true);

  const isLast = await anotherProxyCache.receivedErrorResponse(alsReq, proxyId);
  expect(isLast).toBe(true);
  return true;
};

function randomIntSting(): string {
  return String(Date.now()).substring(9);
}
