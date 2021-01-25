import { createApiRef, DiscoveryApi } from '@backstage/core';
import {
  argoCDAppDetails,
  ArgoCDAppDetails,
  argoCDAppList,
  ArgoCDAppList,
} from '../types';
import * as tPromise from 'io-ts-promise';

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
    let response;
    try {
      response = await fetch(
        `${ApiUrl}/applications?selector=${options.appSelector}`,
      );
    } catch (e) {
      throw new Error(e);
    }
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    try {
      return await tPromise.decode(argoCDAppList, await response.json());
    } catch (e) {
      if (tPromise.isDecodeError(e)) {
        throw new Error('remote data decode error');
      } else {
        throw e;
      }
    }
  }

  async getAppDetails(options: { appName: string }) {
    const ApiUrl = await this.getApiUrl();
    let response;
    try {
      response = await fetch(`${ApiUrl}/applications/${options.appName}`);
    } catch (e) {
      throw new Error(e);
    }
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    try {
      return await tPromise.decode(argoCDAppDetails, await response.json());
    } catch (e) {
      if (tPromise.isDecodeError(e)) {
        throw new Error('remote data decode error');
      } else {
        throw e;
      }
    }
  }
}
