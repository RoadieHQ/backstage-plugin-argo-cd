import { createApiRef, DiscoveryApi } from '@backstage/core';
import { ArgoCDAppDetails, ArgoCDAppList } from '../types';

export const argoCDApiRef = createApiRef<ArgoCDApi>({
  id: 'plugin.argocd.service',
  description: 'Used by the ArgoCD plugin to make requests',
});

export interface ArgoCDApi {
  listApps(options: { appSelector: string }): Promise<ArgoCDAppList>;
  getAppDetails(options: { appName: string }): Promise<ArgoCDAppDetails>;
}
const DEFAULT_PROXY_PATH = '/argocd/api';

export type Options = {
  discoveryApi: DiscoveryApi;
  proxyPath?: string;
};

export class ArgoCDApiClient implements ArgoCDApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.proxyPath = options.proxyPath ?? DEFAULT_PROXY_PATH;
  }

  private async getApiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyUrl}${this.proxyPath}`;
  }

  async listApps(options: { appSelector: string }) {
    const ApiUrl = await this.getApiUrl();
    const request = await fetch(
      `${ApiUrl}/applications?selector=${options.appSelector}`
    );
    return request.json() as Promise<ArgoCDAppList>;
  }

  async getAppDetails(options: { appName: string }) {
    const ApiUrl = await this.getApiUrl();
    const request = await fetch(`${ApiUrl}/applications/${options.appName}`);
    return request.json() as Promise<ArgoCDAppDetails>;
  }
}
