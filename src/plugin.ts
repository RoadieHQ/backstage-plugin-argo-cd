import {
  createApiFactory,
  createPlugin,
  discoveryApiRef,
} from '@backstage/core';
import { ArgoCDApiClient, argoCDApiRef } from './api';

export const plugin = createPlugin({
  id: 'argocd',
  apis: [
    createApiFactory({
      api: argoCDApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new ArgoCDApiClient({ discoveryApi }),
    }),
  ],
});
