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
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  LinearProgress,
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from '@material-ui/core';
import { Entity } from '@backstage/catalog-model';
import moment from 'moment';
import { ARGOCD_ANNOTATION_APP_NAME, useArgoCDAppData } from './useArgoCDAppData';
import { MissingAnnotationEmptyState } from '@backstage/core';
import ErrorBoundary from './ErrorBoundary';
import { isPluginApplicableToEntity } from '../Router';
import { ArgoCDAppDetails, ArgoCDAppList } from '../types';
import { useListAppDetails } from "./useListAppDetails";
import { useAppDetails } from "./useAppDetails";

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
  return (
    <Card>
      <CardHeader
        title={<Typography variant="h5">ArgoCD overview</Typography>}
      />
      <CardContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Sync Status</TableCell>
              <TableCell>Health Status</TableCell>
              <TableCell>Last Synced</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.items.map((data: ArgoCDAppDetails) => (
              <TableRow key={data.metadata.name}>
              <TableCell component="th" scope="row">{data.metadata.name}</TableCell>
              <TableCell component="th" scope="row"><State value={data.status.sync.status}/></TableCell>
              <TableCell component="th" scope="row"><State value={data.status.health.status}/></TableCell>
              <TableCell component="th" scope="row">{getElapsedTime(data.status.operationState.finishedAt!)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const ArgoCDDetailsWidget = ({ entity }: { entity: Entity }) => {
  return !isPluginApplicableToEntity(entity) ? (
    <MissingAnnotationEmptyState annotation={ARGOCD_ANNOTATION_APP_NAME} />
  ) : (
    <ErrorBoundary>
      <ArgoCDDetails entity={entity} />
    </ErrorBoundary>
  );
};

const ArgoCDDetails = ({ entity }: { entity: Entity }) => {
  const { appName, appSelector } = useArgoCDAppData({ entity });

  const { loading, value, error } = !!appName ? useAppDetails({ appName }) : useListAppDetails({
    appSelector
  });
  if (loading) {
    return (
      <Card>
        <CardHeader
          title={<Typography variant="h5">ArgoCD overview</Typography>}
        />
        <LinearProgress />
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardHeader
          title={<Typography variant="h5">ArgoCD overview</Typography>}
        />
        Error occurred while fetching data. {error.name}: {error.message}
      </Card>
    );
  }
  if (value) {
    if ((value as ArgoCDAppList).items !== undefined) {
      return <OverviewComponent data={value as ArgoCDAppList} />
    } else {
      const wrapped: ArgoCDAppList = {
        items: [value as ArgoCDAppDetails]
      }
      return <OverviewComponent data={wrapped} />
    }
  } else {
    return null
  }
};
