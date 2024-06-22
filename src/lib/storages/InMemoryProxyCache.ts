import { IProxyCache, InMemoryProxyCacheConfig, PoxyDetails } from '../../types';

export class InMemoryProxyCache implements IProxyCache {
  constructor(private readonly options: InMemoryProxyCacheConfig) {}

  async getProxyByDfspId(dfspId: string): Promise<PoxyDetails | null> {
    this.options.logger?.warn('Not implemented', { dfspId });
    // todo: think how to avoid logger?...
    return null;
  }

  async setProxyByDfspId(dfspId: string, details: PoxyDetails): Promise<void> {
    this.options.logger?.warn('Not implemented', { dfspId, details });
    return Promise.resolve(undefined);
  }

  async removeFromSendToProxiesList(partyId: string, proxyId: string): Promise<number | null> {
    this.options.logger?.warn('Not implemented', { partyId, proxyId });
    return 0;
  }

  async setSendToProxiesList(partyId: string, proxyIds: string[]): Promise<void> {
    this.options.logger?.warn('Not implemented', { partyId, proxyIds });
    return Promise.resolve(undefined);
  }
}
