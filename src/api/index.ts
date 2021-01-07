import { createApiRef, DiscoveryApi } from "@backstage/core";
import fetch from "cross-fetch";
import { ArgoCDAppDetails } from "../types";

export const argoCDApiRef = createApiRef<ArgoCDApi>({
  id: "plugin.argocd.service",
  description: "Used by the ArgoCD plugin to make requests",
});

export interface ArgoCDApi {
  getAppDetails(options: { appName: string }): Promise<ArgoCDAppDetails>;
}
const DEFAULT_PROXY_PATH = "/argocd/api";

type Options = {
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
    const proxyUrl = await this.discoveryApi.getBaseUrl("proxy");
    return `${proxyUrl}${this.proxyPath}`;
  }

  async getAppDetails(options: { appName: string }) {
    const ApiUrl = await this.getApiUrl();
    const request = await fetch(`${ApiUrl}/applications/${options.appName}`);
    return request.json() as Promise<ArgoCDAppDetails>;
  }
}

export class ArgoCDApiMock implements ArgoCDApi {
  //@ts-ignore
  constructor(options: Options) {}

  //@ts-ignore
  async getAppDetails(options: { appName: string }) {
    return {
      metadata: {
        name: "guestbook",
      },
      status: {
        sync: {
          status: "Synced",
        },
        health: {
          status: "Healthy",
        },
        operationState: {
          finishedAt: "2020-11-18T16:47:04Z",
        },
      },
    };
  }
}
