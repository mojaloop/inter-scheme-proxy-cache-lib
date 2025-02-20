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

import RedisMock, { RedisClusterOptions, RedisOptions } from 'ioredis-mock';
import { BasicConnectionConfig } from '../../src/types';

/*
  ioredis-mock doesn't provide a status-field, so we need to override it here
 */
export class IoRedisMock extends RedisMock {
  private readonly lazyConnect: boolean;
  public connected: boolean = false;

  constructor(opts: RedisOptions) {
    super(opts);
    this.lazyConnect = Boolean(opts?.lazyConnect);
  }

  // @ts-expect-error TS2611: status is defined as a property in class Redis, but is overridden here in IoRedisMock as an accessor
  get status() {
    return this.connected ? 'ready' : this.lazyConnect ? 'wait' : 'end';
  }

  // For some reason, ioredis-mock is not updating the status field
  async disconnect() {
    super.disconnect();
    this.connected = false;
  }
}

class IoRedisMockCluster extends IoRedisMock {
  _nodes: IoRedisMock[] = [];

  constructor(nodesOpts: BasicConnectionConfig[], redisOptions: RedisClusterOptions) {
    super(redisOptions);
    nodesOpts.forEach((connOpts) => this._nodes.push(new IoRedisMock({ ...connOpts, ...redisOptions })));
  }

  nodes () {
    return this._nodes;
  }
}

// @ts-expect-error TS2322: Type typeof IoRedisMockCluster is not assignable to type ClusterConstructo
IoRedisMock.Cluster = IoRedisMockCluster;
