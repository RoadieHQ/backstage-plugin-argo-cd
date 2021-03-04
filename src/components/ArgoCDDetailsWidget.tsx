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
import { Box, LinearProgress, Link } from '@material-ui/core';
import { Entity } from '@backstage/catalog-model';
import moment from 'moment';
import {
  ARGOCD_ANNOTATION_APP_NAME,
  useArgoCDAppData,
} from './useArgoCDAppData';
import {
  configApiRef,
  InfoCard,
  MissingAnnotationEmptyState,
  Table,
  TableColumn,
  useApi,
} from '@backstage/core';
import ErrorBoundary from './ErrorBoundary';
import { isArgocdAvailable } from '../Router';
import { ArgoCDAppDetails, ArgoCDAppList } from '../types';
import { useAppDetails } from './useAppDetails';

const getElapsedTime = (start: string) => {
  return moment(start).fromNow();
};

const State = ({ value }: { value: string }) => {
  const colorMap: Record<string, string> = {
    Pending: '#dcbc21',
    Synced: 'green',
    Healthy: 'green',
    Inactive: 'black',
    Failed: 'red',
  };
  return (
    <Box display="flex" alignItems="center">
      <span
        style={{
          display: 'block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: colorMap[value] || '#dcbc21',
          marginRight: '5px',
        }}
      />
      {value}
    </Box>
  );
};

const OverviewComponent = ({ data }: { data: ArgoCDAppList }) => {
  const configApi = useApi(configApiRef);
  const baseUrl = configApi.getOptionalString('argocd.baseUrl')

  const columns: TableColumn[] = [
    {
      title: 'Name',
      highlight: true,
      render: (row: any): React.ReactNode => (
        baseUrl ? <Link href={`${baseUrl}/applications/${row.metadata.name}`} target="_blank" rel="noopener">{row.metadata.name}</Link> : row.metadata.name
      ),
    },
    {
      title: 'Sync Status',
      render: (row: any): React.ReactNode => (
        <State value={row.status.sync.status} />
      ),
    },
    {
      title: 'Health Status',
      render: (row: any): React.ReactNode => (
        <State value={row.status.health.status} />
      ),
    },
    {
      title: 'Last Synced',
      render: (row: any): React.ReactNode =>
        getElapsedTime(row.status.operationState.finishedAt!),
    },
  ];

  return (
    <Table
      title="ArgoCD overview"
      options={{
        paging: false,
        search: false,
        sorting: false,
        draggable: false,
        padding: 'dense',
      }}
      data={data.items}
      columns={columns}
    />
  );
};

const ArgoCDDetails = ({ entity }: { entity: Entity }) => {
  const { url, appName, appSelector, projectName } = useArgoCDAppData({
    entity,
  });
  const { loading, value, error } = useAppDetails({
    url,
    appName,
    appSelector,
    projectName,
  });
  if (loading) {
    return (
      <InfoCard title="ArgoCD overview">
        <LinearProgress />
      </InfoCard>
    );
  }
  if (error) {
    return (
      <InfoCard title="ArgoCD overview">
        Error occurred while fetching data. {error.name}: {error.message}
      </InfoCard>
    );
  }
  if (value) {
    if ((value as ArgoCDAppList).items !== undefined) {
      return <OverviewComponent data={value as ArgoCDAppList} />;
    }
    const wrapped: ArgoCDAppList = {
      items: [value as ArgoCDAppDetails],
    };
    return <OverviewComponent data={wrapped} />;
  }
  return null;
};

/**
 * @deprecated since v0.3.0 you should use new composability API
 */
export const ArgoCDDetailsWidget = ({ entity }: { entity: Entity }) => {
  return !isArgocdAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={ARGOCD_ANNOTATION_APP_NAME} />
  ) : (
    <ErrorBoundary>
      <ArgoCDDetails entity={entity} />
    </ErrorBoundary>
  );
};
