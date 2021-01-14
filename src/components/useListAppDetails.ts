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
import { errorApiRef, useApi } from '@backstage/core';
import { useAsync } from 'react-use';
import { argoCDApiRef } from '../api';

export const useListAppDetails = ({ appSelector }: { appSelector: string }) => {
  const api = useApi(argoCDApiRef);
  const errorApi = useApi(errorApiRef);

  const { loading, value, error } = useAsync(async () => {
    try {
      return await api.listApps({ appSelector });
    } catch (e) {
      errorApi.post(e);
      return Promise.reject(e);
    }
  });

  return {
    loading,
    value,
    error,
  };
};
