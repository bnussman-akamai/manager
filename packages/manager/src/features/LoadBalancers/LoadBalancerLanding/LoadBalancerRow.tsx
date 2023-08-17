import { Loadbalancer } from '@linode/api-v4';
import Stack from '@mui/material/Stack';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerConfigurationsQuery } from 'src/queries/aglb/configurations';

import { LoadBalancerActionsMenu } from './LoadBalancerActionsMenu';
import { RegionsCell } from './RegionsCell';

interface Props {
  loadBalancer: Loadbalancer;
}

export const LoadBalancerRow = ({ loadBalancer }: Props) => {
  const { id, label, regions } = loadBalancer;
  const { data: configurations } = useLoadBalancerConfigurationsQuery(id);
  const ports = configurations?.data.map((config) => config.port);

  return (
    <TableRow
      ariaLabel={`Load Balancer ${label}`}
      key={`loadbalancer-row-${id}`}
    >
      <TableCell>
        <Link to={`/loadbalancers/${id}`}>{label}</Link>
      </TableCell>
      <Hidden mdDown>
        <TableCell>
          {/* TODO: AGLB - These are stub values for now*/}
          <Stack alignItems="center" direction="row" spacing={1}>
            <StatusIcon status="active" />
            <Typography>4 up</Typography>
            <Typography>&mdash;</Typography>
            <StatusIcon status="error" />
            <Typography>6 down</Typography>
          </Stack>
        </TableCell>
      </Hidden>
      <TableCell>{ports?.join(', ')}</TableCell>
      <TableCell>
        {regions.map((region) => (
          <RegionsCell key={region} region={region} />
        ))}
      </TableCell>
      <TableCell actionCell>
        <LoadBalancerActionsMenu loadBalancerId={id} />
      </TableCell>
    </TableRow>
  );
};
