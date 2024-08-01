import React from 'react';
import { Waypoint } from 'react-waypoint';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { useStackScriptsInfiniteQuery } from 'src/queries/stackscripts';

import { StackScriptTableRow } from './StackScriptTableRow';

import type { Filter } from '@linode/api-v4';

interface Props {
  type: 'account' | 'community';
}

export const StackScriptsLandingTable = (props: Props) => {
  const { type } = props;
  const { handleOrderChange, order, orderBy } = useOrder({
    order: 'desc',
    orderBy: 'deployments_total',
  });

  const filter: Filter = {
    ...(type === 'community' && {
      '+and': [
        { username: { '+neq': 'linode' } },
        { username: { '+neq': 'linode-stackscripts' } },
      ],
    }),
    '+order': order,
    '+order_by': orderBy,
    mine: type === 'account',
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStackScriptsInfiniteQuery(filter);

  const stackscripts = data?.pages.flatMap((page) => page.data);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableSortCell
            active={orderBy === 'label'}
            direction={order}
            handleClick={handleOrderChange}
            label="label"
          >
            StackScript
          </TableSortCell>
          <TableSortCell
            active={orderBy === 'deployments_total'}
            direction={order}
            handleClick={handleOrderChange}
            label="deployments_total"
          >
            Deploys
          </TableSortCell>
          <TableSortCell
            active={orderBy === 'updated'}
            direction={order}
            handleClick={handleOrderChange}
            label="updated"
            noWrap
          >
            Last Revision
          </TableSortCell>
          <TableCell>Compatible Images</TableCell>
          {type === 'account' && <TableCell>Status</TableCell>}
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {stackscripts?.length === 0 && (
          <TableRowEmpty colSpan={6} message="No StackScripts found" />
        )}
        {stackscripts?.map((stackscript) => (
          <StackScriptTableRow
            key={stackscript.id}
            stackscript={stackscript}
            type={type}
          />
        ))}
        {(hasNextPage || isFetchingNextPage) && (
          <TableRowLoading columns={type === 'account' ? 6 : 5} />
        )}
        {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
      </TableBody>
    </Table>
  );
};
