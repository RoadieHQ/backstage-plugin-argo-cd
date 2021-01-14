import { createApiRef, DiscoveryApi } from "@backstage/core";
import fetch from "cross-fetch";
import { ArgoCDAppDetails, ArgoCDAppList } from "../types";

export const argoCDApiRef = createApiRef<ArgoCDApi>({
  id: "plugin.argocd.service",
  description: "Used by the ArgoCD plugin to make requests",
});

export interface ArgoCDApi {
  listApps(options: { appSelector: string }): Promise<ArgoCDAppList>
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

  async listApps(options: { appSelector: string }) {
    let ApiUrl = await this.getApiUrl();
    const request = await fetch(`${ApiUrl}/applications?selector=${options.appSelector}`);
    return request.json() as Promise<ArgoCDAppList>;
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
  async listApps(options: { appSelector: string }) {
    return {
      items: [
        {
          metadata: {
            name: "guestbook-prod",
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
        },
        {
          metadata: {
            name: "guestbook-staging",
          },
          status: {
            sync: {
              status: "OutOfSync",
            },
            health: {
              status: "Healthy",
            },
            operationState: {
              finishedAt: "2020-11-18T16:47:04Z",
            },
          },
        }
      ]
    }
  }

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
