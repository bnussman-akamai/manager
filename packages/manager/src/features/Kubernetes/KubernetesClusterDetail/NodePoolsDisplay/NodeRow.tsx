import styled from '@emotion/styled';
import { usePreferences } from '@linode/queries';
import { Box, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { LinodeStatus } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeStatus';

import NodeActionMenu from './NodeActionMenu';

import type { APIError, Linode } from '@linode/api-v4/lib/types';

export interface NodeRow {
  instanceId?: number;
  instanceStatus?: Linode['status'];
  ip?: string;
  label?: string;
  nodeId: string;
  nodeStatus: string;
}

interface NodeRowProps extends NodeRow {
  isLkeClusterRestricted: boolean;
  linodeError?: APIError[];
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  typeLabel: string;
}

export const NodeRow = React.memo((props: NodeRowProps) => {
  const {
    instanceId,
    instanceStatus,
    ip,
    isLkeClusterRestricted,
    label,
    linodeError,
    nodeId,
    openRecycleNodeDialog,
    typeLabel,
  } = props;

  const { data: maskSensitiveDataPreference } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
  );

  const linodeLink = instanceId ? `/linodes/${instanceId}` : undefined;

  const displayLabel = label ?? typeLabel;

  const displayIP = ip ?? '';

  return (
    <TableRow data-qa-node-row={nodeId}>
      <TableCell>
        <Grid
          container
          sx={{
            alignItems: 'center',
          }}
          wrap="nowrap"
        >
          <Grid>
            <Typography>
              {linodeLink ? (
                <Link to={linodeLink}>{displayLabel}</Link>
              ) : (
                displayLabel
              )}
            </Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell statusCell={!linodeError}>
        {linodeError ? (
          <Typography
            sx={(theme) => ({
              color: theme.color.red,
            })}
          >
            Error retrieving status
          </Typography>
        ) : instanceId && instanceStatus ? (
          <LinodeStatus id={instanceId} status={instanceStatus} />
        ): null}
      </TableCell>
      <TableCell noWrap>
        {linodeError ? (
          <Typography
            sx={(theme) => ({
              color: theme.color.red,
            })}
          >
            Error retrieving IP
          </Typography>
        ) : displayIP.length > 0 ? (
          <Box alignItems="center" display="flex" gap={0.5}>
            <CopyTooltip
              copyableText
              masked={Boolean(maskSensitiveDataPreference)}
              maskedTextLength="ipv4"
              text={displayIP}
            />
            <StyledCopyTooltip text={displayIP} />
          </Box>
        ) : null}
      </TableCell>
      <TableCell>
        <NodeActionMenu
          instanceLabel={label}
          isLkeClusterRestricted={isLkeClusterRestricted}
          nodeId={nodeId}
          openRecycleNodeDialog={openRecycleNodeDialog}
        />
      </TableCell>
    </TableRow>
  );
});

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})({
  '& svg': {
    height: `12px`,
    width: `12px`,
  },
});
