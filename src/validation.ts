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

/**
 * We need a separate validation, coz the library might be used in JS projects, where TS type checks are not available
 */
import Ajv, { JSONSchemaType } from 'ajv';
import { RedisProxyCacheConfig, AlsRequestDetails } from './types';
import { ValidationError } from '#src/lib';

const ajv = new Ajv();

const RedisProxyCacheConfigSchema: JSONSchemaType<RedisProxyCacheConfig> = {
  type: 'object',
  properties: {
    host: { type: 'string' },
    port: { type: 'integer' },
    username: { type: 'string', nullable: true },
    password: { type: 'string', nullable: true },
    lazyConnect: { type: 'boolean', nullable: true },
    db: { type: 'number', nullable: true },
    // todo: find a better way to define optional params (without nullable: true)
  },
  required: ['host', 'port'],
  additionalProperties: true,
};
const redisProxyCacheConfigValidatingFn = ajv.compile<RedisProxyCacheConfig>(RedisProxyCacheConfigSchema);

export const validateRedisProxyCacheConfig = (data: unknown): true => {
  const isValid = redisProxyCacheConfigValidatingFn(data);
  if (!isValid) {
    const errDetails = `redisProxyCacheConfig: ${redisProxyCacheConfigValidatingFn.errors![0]!.message}`;
    throw ValidationError.invalidFormat(errDetails);
    // todo: think, if we need to throw or just return false?
  }
  return true;
};

const AlsRequestSchema: JSONSchemaType<AlsRequestDetails> = {
  type: 'object',
  properties: {
    sourceId: { type: 'string' },
    type: { type: 'string' },
    partyId: { type: 'string' },
  },
  required: ['sourceId', 'type', 'partyId'],
  additionalProperties: false,
};
const alsRequestValidatingFn = ajv.compile<AlsRequestDetails>(AlsRequestSchema);

export const validateAlsRequestDetails = (data: unknown): true => {
  const isValid = alsRequestValidatingFn(data);
  if (!isValid) {
    const errDetails = `alsRequest: ${alsRequestValidatingFn.errors![0]!.message}`;
    throw ValidationError.invalidFormat(errDetails);
    // think, if we need to throw or just return false?
  }
  return true;
};

const DfspIdSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 32,
};
const dfspIdValidatingFn = ajv.compile<string>(DfspIdSchema);

export const validateDfspId = (data: unknown): true => {
  const isValid = dfspIdValidatingFn(data);
  if (!isValid) {
    const errDetails = `dfspId: ${dfspIdValidatingFn.errors![0]!.message}`;
    throw ValidationError.invalidFormat(errDetails);
    // think, if we need to throw or just return false?
  }
  return true;
};
