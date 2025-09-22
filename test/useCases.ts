/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/
import { setTimeout as sleep } from 'node:timers/promises';
import { IProxyCache } from '#src/types';
import * as fixtures from '#test/fixtures';
import * as testUtils from '#test/utils';

/*
  Use cases to check any IProxyCache implementations.
  So don't add here any particular class or details of implementation, use only interface methods/props.
  Is supposed to be used in unit/integration tests.
 */

export const proxyMappingUseCase = async (proxyCache: IProxyCache) => {
  expect(proxyCache.isConnected).toBe(true);

  const dfspId = `dfsp-${testUtils.randomIntSting()}`;
  let noProxyId = await proxyCache.lookupProxyByDfspId(dfspId);
  expect(noProxyId).toBeNull();

  const proxyId = `proxy-${testUtils.randomIntSting()}`;
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

  let isPending = await proxyCache.isPendingCallback(alsReq, 'proxyC');
  expect(isPending).toBe(true);

  isLast = await proxyCache.receivedErrorResponse(alsReq, 'proxyC');
  expect(isLast).toBe(true);

  isPending = await proxyCache.isPendingCallback(alsReq, 'proxyC');
  expect(isPending).toBe(false);

  return true;
};

export const detectLastErrorCallbackWithPrecedingSuccessUseCase = async (proxyCache: IProxyCache) => {
  const alsReq = fixtures.alsRequestDetailsDto();
  const proxyIds = ['proxyAA', 'proxyBB'];

  const isSet = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 10);
  expect(isSet).toBe(true);

  const isOk = await proxyCache.receivedSuccessResponse(alsReq, 'proxyAA');
  expect(isOk).toBe(true);

  let isPending = await proxyCache.isPendingCallback(alsReq, 'proxyBB');
  expect(isPending).toBe(true);

  const isLastWithoutSuccess = await proxyCache.receivedErrorResponse(alsReq, 'proxyBB');
  expect(isLastWithoutSuccess).toBe(false);

  isPending = await proxyCache.isPendingCallback(alsReq, 'proxyBB');
  expect(isPending).toBe(false);

  return true;
};

export const checkIfAlsRequestWaitingForCallbackUseCase = async (proxyCache: IProxyCache) => {
  const alsReq = fixtures.alsRequestDetailsDto();
  const proxyIds = ['proxyA', 'proxyB'];

  const isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 10);
  expect(isOk).toBe(true);

  let isPending = await proxyCache.isPendingCallback(alsReq, 'proxyA');
  expect(isPending).toBe(true);

  isPending = await proxyCache.isPendingCallback(fixtures.alsRequestDetailsDto({ type: 'XXX' }), 'proxyB');
  expect(isPending).toBe(false);

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

export const processExpiredAlsKeysUseCase = async (proxyCache: IProxyCache) => {
  const alsReq = fixtures.alsRequestDetailsDto();
  const proxyIds = [`proxy1-${Date.now()}`, `proxy2-${Date.now()}`];
  const isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 1);
  expect(isOk).toBe(true);

  await sleep(1_000);
  const mockCallback = jest.fn().mockResolvedValue(true);
  await proxyCache.processExpiredAlsKeys(mockCallback, 10);

  expect(mockCallback).toHaveBeenCalled();
  return true;
};

export const processSuccessAlsResponseUseCase = async (proxyCache: IProxyCache) => {
  const alsReq = fixtures.alsRequestDetailsDto();
  const proxyIds = ['proxyAA', `proxyBB`];

  const isSet = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 5);
  expect(isSet).toBe(true);

  let isOk = await proxyCache.receivedSuccessResponse(alsReq, 'wrongProxy');
  expect(isOk).toBe(false);

  isOk = await proxyCache.receivedSuccessResponse(alsReq, 'proxyAA');
  expect(isOk).toBe(true);

  let isPending = await proxyCache.isPendingCallback(alsReq, 'proxyAA');
  expect(isPending).toBe(false);

  isPending = await proxyCache.isPendingCallback(alsReq, 'proxyBB');
  expect(isPending).toBe(true);

  return true;
};
