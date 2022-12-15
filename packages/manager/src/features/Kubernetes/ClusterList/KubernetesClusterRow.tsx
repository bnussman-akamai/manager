import { KubeNodePoolResponse, KubernetesCluster } from '@linode/api-v4';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { dcDisplayNames } from 'src/constants';
import { useAllKubernetesNodePoolQuery } from 'src/queries/kubernetes';
import { useKubernetesVersionQuery } from 'src/queries/kubernetesVersion';
import { useAllLinodeTypesQuery } from 'src/queries/linodes';
import {
  getNextVersion,
  getTotalClusterMemoryCPUAndStorage,
} from '../kubeUtils';
import ActionMenu from './ClusterActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    color: theme.textColors.linkActiveLight,
    fontSize: '.875rem',
    lineHeight: '1.125rem',
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  clusterRow: {
    '&:before': {
      display: 'none',
    },
  },
  version: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
}));

export interface Props {
  cluster: KubernetesCluster;
  openDeleteDialog: (
    clusterID: number,
    clusterLabel: string,
    clusterNodePools: KubeNodePoolResponse[]
  ) => void;
  openUpgradeDialog: () => void;
}

export const KubernetesClusterRow = (props: Props) => {
  const { cluster, openDeleteDialog, openUpgradeDialog } = props;
  const classes = useStyles();

  const { data: versions } = useKubernetesVersionQuery();
  const { data: pools } = useAllKubernetesNodePoolQuery(cluster.id);
  const { data: types } = useAllLinodeTypesQuery();

  const nextVersion = getNextVersion(cluster.k8s_version, versions ?? []);

  const hasUpgrade = nextVersion !== null;

  const { RAM, CPU } = getTotalClusterMemoryCPUAndStorage(
    pools ?? [],
    types ?? []
  );

  return (
    <TableRow
      key={cluster.id}
      data-qa-cluster-cell={cluster.id}
      data-testid={'cluster-row'}
      className={classes.clusterRow}
      ariaLabel={`Cluster ${cluster.label}`}
    >
      <TableCell data-qa-cluster-label>
        <Grid
          container
          wrap="nowrap"
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item className="py0">
            <div className={classes.labelStatusWrapper}>
              <Link
                className={classes.link}
                to={`/kubernetes/clusters/${cluster.id}/summary`}
                tabIndex={0}
              >
                {cluster.label}
              </Link>
            </div>
          </Grid>
          {cluster.control_plane.high_availability ? (
            <Grid item>
              <Chip
                label="HA"
                variant="outlined"
                outlineColor="green"
                size="small"
                data-testid={'ha-chip'}
              />
            </Grid>
          ) : null}
        </Grid>
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-cluster-version>
          <div className={classes.version}>
            {cluster.k8s_version}
            {hasUpgrade ? (
              <Chip
                onClick={openUpgradeDialog}
                label="UPGRADE"
                size="small"
                clickable
                inTable
              />
            ) : null}
          </div>
        </TableCell>
      </Hidden>

      <Hidden smDown>
        <TableCell data-qa-cluster-date>
          <DateTimeDisplay value={cluster.created} />
        </TableCell>
      </Hidden>
      <TableCell data-qa-cluster-region>
        {dcDisplayNames[cluster.region] ?? cluster.region}
      </TableCell>
      <Hidden xsDown>
        <TableCell data-qa-cluster-memory>{`${RAM / 1024} GB`}</TableCell>
      </Hidden>
      <Hidden xsDown>
        <TableCell data-qa-cluster-cpu>
          {`${CPU} ${CPU === 1 ? 'CPU' : 'CPUs'}`}
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <ActionMenu
          clusterId={cluster.id}
          clusterLabel={cluster.label}
          openDialog={() =>
            openDeleteDialog(cluster.id, cluster.label, pools ?? [])
          }
        />
      </TableCell>
    </TableRow>
  );
};
