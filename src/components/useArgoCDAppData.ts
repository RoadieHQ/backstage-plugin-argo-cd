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

import { Entity } from '@backstage/catalog-model';

export const ARGOCD_ANNOTATION_APP_NAME = 'argocd/app-name';
export const ARGOCD_ANNOTATION_APP_SELECTOR = 'argocd/app-selector';

export const useArgoCDAppData = ({ entity }: { entity: Entity }) => {
  const appName = entity?.metadata.annotations?.[ARGOCD_ANNOTATION_APP_NAME] ?? '';
  const appSelector = entity?.metadata.annotations?.[ARGOCD_ANNOTATION_APP_SELECTOR] ?? '';
  if (!(appName || appSelector)) {
    throw new Error("'argocd' annotation is missing");
  } else if (appName && appSelector) {
    throw new Error("Cannot provide both 'argocd/app-name' and 'argocd-app' annotations")
  }
  return { appName, appSelector }

};
