/*
 * Copyright 2020 RoadieHQ
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import {
  ApiProvider,
  ApiRegistry,
  errorApiRef,
  UrlPatternDiscovery,
} from '@backstage/core';
import { render } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ArgoCDApiClient, argoCDApiRef } from './api';
import { argocdPlugin } from './plugin';
import { ArgoCDDetailsWidget } from './components/ArgoCDDetailsWidget';
import {
  getEntityStub,
  getResponseStub,
  getResponseStubMissingData,
} from './mocks/mocks';

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');
const errorApiMock = { post: jest.fn(), error$: jest.fn() };

const apis = ApiRegistry.from([
  [errorApiRef, errorApiMock],
  [argoCDApiRef, new ArgoCDApiClient({ discoveryApi })],
]);

describe('argo-cd', () => {
  const worker = setupServer();
  beforeAll(() => worker.listen());
  afterAll(() => worker.close());
  afterEach(() => worker.resetHandlers());

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('export-plugin', () => {
    it('should export plugin', () => {
      expect(argocdPlugin).toBeDefined();
    });
  });

  describe('widget', () => {
    it('should display fetched data', async () => {
      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(getResponseStub)))
      );
      const rendered = render(
        <ApiProvider apis={apis}>
          <ArgoCDDetailsWidget entity={getEntityStub} />
        </ApiProvider>
      );
      expect(await rendered.findByText('guestbook')).toBeInTheDocument();
      expect(await rendered.findByText('Synced')).toBeInTheDocument();
      expect(await rendered.findByText('Healthy')).toBeInTheDocument();
    });

    it('should display properly failure status codes', async () => {
      worker.use(rest.get('*', (_, res, ctx) => res(ctx.status(403))));
      const rendered = render(
        <ApiProvider apis={apis}>
          <ArgoCDDetailsWidget entity={getEntityStub} />
        </ApiProvider>
      );
      expect(await rendered.findByText(/403/)).toBeInTheDocument();
    });

    it('should display data validation errors', async () => {
      worker.use(
        rest.get('*', (_, res, ctx) =>
          res(ctx.json(getResponseStubMissingData))
        )
      );
      const rendered = render(
        <ApiProvider apis={apis}>
          <ArgoCDDetailsWidget entity={getEntityStub} />
        </ApiProvider>
      );
      expect(
        await rendered.findByText(/remote data validation failed: /)
      ).toBeInTheDocument();
    });
  });
});
