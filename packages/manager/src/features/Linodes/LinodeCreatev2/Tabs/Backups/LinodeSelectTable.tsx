import Grid from '@mui/material/Unstable_Grid2';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Stack } from 'src/components/Stack';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { SelectLinodeCard } from 'src/features/Linodes/LinodesCreate/SelectLinodePanel/SelectLinodeCard';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLinodesQuery } from 'src/queries/linodes/linodes';

import { useLinodeCreateQueryParams } from '../../utilities';
import { LinodeSelectTableRow } from './LinodeSelectTableRow';

import type { Theme } from '@mui/material';

export const LinodeSelectTable = () => {
  const matchesMdUp = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up('md')
  );

  const { params, updateParams } = useLinodeCreateQueryParams();

  const [query, setQuery] = useState('');
  const pagination = usePagination();
  const order = useOrder();

  const filter = {
    '+or': [{ label: { '+contains': query } }],
    '+order': order.order,
    '+order_by': order.orderBy,
    // backups: { enabled: true }, womp womp! We can't filter on values within objects
  };

  const { data, error, isFetching, isLoading } = useLinodesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  return (
    <Stack pt={1} spacing={2}>
      <DebouncedSearchTextField
        clearable
        hideLabel
        isSearching={isFetching}
        label="Search"
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        value={query}
      />
      {matchesMdUp ? (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableSortCell
                  active={order.orderBy === 'label'}
                  direction={order.order}
                  handleClick={order.handleOrderChange}
                  label="label"
                >
                  Linode
                </TableSortCell>
                <TableCell>Status</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Plan</TableCell>
                <TableSortCell
                  active={order.orderBy === 'region'}
                  direction={order.order}
                  handleClick={order.handleOrderChange}
                  label="region"
                >
                  Region
                </TableSortCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && <TableRowLoading columns={5} rows={10} />}
              {error && <TableRowError colSpan={5} message={error[0].reason} />}
              {data?.results === 0 && <TableRowEmpty colSpan={5} />}
              {data?.data.map((linode) => (
                <LinodeSelectTableRow key={linode.id} linode={linode} />
              ))}
            </TableBody>
          </Table>
          <PaginationFooter
            count={data?.results ?? 0}
            handlePageChange={pagination.handlePageChange}
            handleSizeChange={pagination.handlePageSizeChange}
            page={pagination.page}
            pageSize={pagination.pageSize}
          />
        </>
      ) : (
        <Grid container spacing={2}>
          {data?.data.map((linode) => (
            <SelectLinodeCard
              handleSelection={() =>
                updateParams({ linodeID: String(linode.id) })
              }
              key={linode.id}
              linode={linode}
              selected={linode.id === params.linodeID}
            />
          ))}
          {data?.results === 0 && (
            <Typography padding={1}>No results</Typography>
          )}
        </Grid>
      )}
    </Stack>
  );
};
