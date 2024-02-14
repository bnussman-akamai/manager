import { Filter } from '@linode/api-v4';
import React, { useState } from 'react';
import { Waypoint } from 'react-waypoint';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Stack } from 'src/components/Stack';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { useInfiniteTagsQuery } from 'src/queries/tags';

import { LinodeRow } from './LinodeRow/LinodeRow';

export const LinodesLandingNew = () => {
  const [groupByTag, setGroupByTag] = useState(false);

  return (
    <Stack>
      <Box>
        <Button
          buttonType="primary"
          onClick={() => setGroupByTag((prev) => !prev)}
        >
          Toggle Group By Tag
        </Button>
      </Box>
      {groupByTag ? <LinodesLandingGroupByTag /> : <LinodesTable />}
    </Stack>
  );
};

const LinodesLandingGroupByTag = () => {
  const { data, fetchNextPage, hasNextPage } = useInfiniteTagsQuery();

  const tags = data?.pages.flatMap((page) => page.data);

  return (
    <Stack spacing={2}>
      {tags?.map((tag) => (
        <LinodesTable key={tag.label} tag={tag.label} />
      ))}
      {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
    </Stack>
  );
};

const LinodesTable = ({ tag }: { tag?: string }) => {
  const pagination = usePagination();
  const { handleOrderChange, order, orderBy } = useOrder();

  const filter: Filter = {
    '+order': order,
    '+order_by': orderBy,
  };

  if (tag) {
    filter['tags'] = tag;
  }

  const { data, error, isLoading } = useLinodesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  if (data?.results === 0 || error || isLoading) {
    return null;
  }

  return (
    <Stack>
      <Typography variant="h2">{tag}</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            <TableCell>Plan</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>Region</TableCell>
            <TableCell>Last Backup</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((linode) => (
            <LinodeRow
              handlers={{
                onOpenDeleteDialog: () => null,
                onOpenMigrateDialog: () => null,
                onOpenPowerDialog: () => null,
                onOpenRebuildDialog: () => null,
                onOpenRescueDialog: () => null,
                onOpenResizeDialog: () => null,
              }}
              key={linode.id}
              {...linode}
            />
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
};
