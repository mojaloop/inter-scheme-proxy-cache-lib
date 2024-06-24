import { IProxyCache, RedisProxyCacheConfig, PoxyDetails } from '../../types';

// todo: add complete impl.
export class RedisProxyCache implements IProxyCache {
  constructor(private readonly options: RedisProxyCacheConfig) {}

  async lookupProxyByDfspId(dfspId: string): Promise<PoxyDetails | null> {
    this.options.logger?.warn('Not implemented', { dfspId });
    // todo: think how to avoid logger?...
    return null;
  }

  async addDfspIdToProxyMapping(dfspId: string, details: PoxyDetails): Promise<boolean> {
    this.options.logger?.warn('Not implemented', { dfspId, details });
    return false;
  }

  async removeDfspIdFromProxyMapping(dfspId: string): Promise<boolean> {
    this.options.logger?.warn('Not implemented', { dfspId });
    return false;
  }

  async removeFromSendToProxiesList(partyId: string, proxyId: string): Promise<boolean> {
    this.options.logger?.warn('Not implemented', { partyId, proxyId });
    return false;
  }

  async setSendToProxiesList(partyId: string, proxyIds: string[]): Promise<void> {
    this.options.logger?.warn('Not implemented', { partyId, proxyIds });
  }

  async checkIfLastErrorCallbackFromSendToProxiesList(partyId: string, proxyId: string): Promise<boolean> {
    this.options.logger?.warn('Not implemented', { partyId, proxyId });
    return false;
  }

  async cleanupSendToProxiesList(partyId: string): Promise<boolean> {
    this.options.logger?.warn('Not implemented', { partyId });
    return false;
  }

  async connect(): Promise<boolean> {
    this.options.logger?.warn('Not implemented');
    return false;
  }

  async disconnect(): Promise<boolean> {
    this.options.logger?.warn('Not implemented');
    return false;
  }

  async healthCheck(): Promise<boolean> {
    this.options.logger?.warn('Not implemented');
    return false;
  }
}
