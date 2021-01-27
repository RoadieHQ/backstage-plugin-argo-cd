import { createApiRef, DiscoveryApi } from '@backstage/core';
import {
  argoCDAppDetails,
  ArgoCDAppDetails,
  argoCDAppList,
  ArgoCDAppList,
} from '../types';
import * as t from 'io-ts';
import * as tPromise from 'io-ts-promise';
import reporter from 'io-ts-reporters';

export const argoCDApiRef = createApiRef<ArgoCDApi>({
  id: 'plugin.argocd.service',
  description: 'Used by the ArgoCD plugin to make requests',
});

export interface ArgoCDApi {
  listApps(options: { appSelector?: string, projectName?: string }): Promise<ArgoCDAppList>;
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

  private async fetchDecode<A, O, I>(url: string, typeCodec: t.Type<A, O, I>) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    const json = await response.json();
    try {
      return await tPromise.decode(typeCodec, json);
    } catch (e) {
      if (tPromise.isDecodeError(e)) {
        throw new Error(
          `remote data validation failed: ${reporter
            .report(typeCodec.decode(json))
            .join('; ')}`,
        );
      } else {
        throw e;
      }
    }
  }

  async listApps(options: { appSelector?: string, projectName?: string }) {
    const ApiUrl = await this.getApiUrl();
    const params = {
      selector: options.appSelector,
      project: options.projectName
    }
    const query = Object.keys(params)
        .filter((key) => params[key])
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');
    return this.fetchDecode(
      `${ApiUrl}/applications?${query}`,
      argoCDAppList,
    );
  }

  async getAppDetails(options: { appName: string }) {
    const ApiUrl = await this.getApiUrl();
    return this.fetchDecode(
      `${ApiUrl}/applications/${options.appName}`,
      argoCDAppDetails,
    );
  }
}
