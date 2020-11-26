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
  Grid,
  Card,
  CardHeader,
  Divider,
  CardContent,
  makeStyles,
  Link,
  LinearProgress,
  Tooltip,
} from '@material-ui/core';
import { Entity } from '@backstage/catalog-model';
import moment from 'moment';
import { ARGOCD_ANNOTATION, useArgoCDAppData } from './useArgoCDAppData';
import { MissingAnnotationEmptyState } from '@backstage/core';
import ErrorBoundary from './ErrorBoundary';
import { isPluginApplicableToEntity } from '../Router';
import { useAppDetails } from './useAppDetails';
import { ArgoCDAppDetails } from '../types';

type States = 'Pending' | 'Active' | 'Inactive' | 'Failed';

const useStyles = makeStyles(theme => ({
  links: {
    margin: theme.spacing(2, 0),
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'min-content',
    gridGap: theme.spacing(3),
  },
  label: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  value: {
    fontWeight: 'bold',
    overflow: 'hidden',
    lineHeight: '24px',
    wordBreak: 'break-word',
  },
  description: {
    wordBreak: 'break-word',
  },
}));

const getElapsedTime = (start: string) => {
  return moment(start).fromNow();
};

const AboutField = ({
  label,
  value,
  gridSizes,
  children,
}: {
  label: string;
  value?: string | JSX.Element;
  gridSizes?: Record<string, number>;
  children?: React.ReactNode;
}) => {
  const classes = useStyles();

  // Content is either children or a string prop `value`
  const content = React.Children.count(children) ? (
    children
  ) : (
    <Typography variant="body2" className={classes.value}>
      {value || `unknown`}
    </Typography>
  );
  return (
    <Grid item {...gridSizes}>
      <Typography variant="subtitle2" className={classes.label}>
        {label}
      </Typography>
      {content}
    </Grid>
  );
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
const OverviewComponent = ({ data }: { data: ArgoCDAppDetails }) => {
  const classes = useStyles();
  return (
    <Card>
      <CardHeader
        title={<Typography variant="h5">ArgoCD</Typography>}
        subheader={<Typography variant="h6">{data.metadata.name}</Typography>}
      />
      <Divider />
      <CardContent>
        <Grid container>
          <AboutField label="Sync" gridSizes={{ xs: 12, sm: 6, lg: 4 }}>
            <State value={data.status.sync.status} />
          </AboutField>
          <AboutField label="Health" gridSizes={{ xs: 12, sm: 6, lg: 4 }}>
            <State value={data.status.health.status} />
          </AboutField>
          <AboutField
            label="Last deploy"
            value={getElapsedTime(data.status.operationState.finishedAt!)}
            gridSizes={{ xs: 12, sm: 6, lg: 4 }}
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

export const ArgoCDDetailsWidget = ({ entity }: { entity: Entity }) => {
  return !isPluginApplicableToEntity(entity) ? (
    <MissingAnnotationEmptyState annotation={ARGOCD_ANNOTATION} />
  ) : (
    <ErrorBoundary>
      <ArgoCDDetails entity={entity} />
    </ErrorBoundary>
  );
};

const ArgoCDDetails = ({ entity }: { entity: Entity }) => {
  const appName = useArgoCDAppData({ entity });

  const { loading, value, error } = useAppDetails({
    appName,
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
        Error occured while fetching data. {error.name}: {error.message}
      </Card>
    );
  }
  return value ? <OverviewComponent data={value} /> : null;
};
