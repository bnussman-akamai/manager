import { getAPIFilterFromQuery } from '@linode/search';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Waypoint } from 'react-waypoint';
import { debounce } from 'throttle-debounce';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { IconButton } from 'src/components/IconButton';
import { InputAdornment } from 'src/components/InputAdornment';
import { Stack } from 'src/components/Stack';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useOrder } from 'src/hooks/useOrder';
import {
  useStackScriptQuery,
  useStackScriptsInfiniteQuery,
} from 'src/queries/stackscripts';

import { useLinodeCreateQueryParams } from '../../utilities';
import { StackScriptDetailsDialog } from './StackScriptDetailsDialog';
import { StackScriptSelectionRow } from './StackScriptSelectionRow';
import { getDefaultUDFData } from './UserDefinedFields/utilities';
import {
  accountStackScriptFilter,
  communityStackScriptFilter,
} from './utilities';

import type { StackScriptTabType } from './utilities';
import type { CreateLinodeRequest } from '@linode/api-v4';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

interface Props {
  type: StackScriptTabType;
}

export const StackScriptSelectionList = ({ type }: Props) => {
  const [query, setQuery] = useState<string>();

  const { handleOrderChange, order, orderBy } = useOrder({
    order: 'desc',
    orderBy: 'deployments_total',
  });

  const { control, setValue } = useFormContext<CreateLinodeRequest>();

  const { field } = useController({
    control,
    name: 'stackscript_id',
  });

  const [selectedStackScriptId, setSelectedStackScriptId] = useState<number>();

  const { params, updateParams } = useLinodeCreateQueryParams();

  const hasPreselectedStackScript = Boolean(params.stackScriptID);

  const { data: stackscript } = useStackScriptQuery(
    params.stackScriptID ?? -1,
    hasPreselectedStackScript
  );

  const filter =
    type === 'Community'
      ? communityStackScriptFilter
      : accountStackScriptFilter;

  const {
    error: searchParseError,
    filter: searchFilter,
  } = getAPIFilterFromQuery(query, {
    defaultSearchKeys: ['username', 'label', 'description'],
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useStackScriptsInfiniteQuery(
    {
      ['+order']: order,
      ['+order_by']: orderBy,
      ...searchFilter,
      ...filter,
    },
    !hasPreselectedStackScript
  );

  const stackscripts = data?.pages.flatMap((page) => page.data);

  if (hasPreselectedStackScript) {
    return (
      <Stack spacing={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 20 }}></TableCell>
              <TableCell>StackScript</TableCell>
              <TableCell sx={{ minWidth: 120 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stackscript && (
              <StackScriptSelectionRow
                disabled
                isSelected={field.value === stackscript.id}
                onOpenDetails={() => setSelectedStackScriptId(stackscript.id)}
                stackscript={stackscript}
              />
            )}
          </TableBody>
        </Table>
        <Box display="flex" justifyContent="flex-end">
          <Button
            onClick={() => {
              field.onChange(null);
              setValue('image', null);
              updateParams({ stackScriptID: undefined });
            }}
          >
            Choose Another StackScript
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Box sx={{ height: 500, overflow: 'auto' }}>
      <TextField
        InputProps={{
          endAdornment: query && (
            <InputAdornment position="end">
              {isFetching && <CircleProgress size="sm" />}
              {searchParseError && (
                <TooltipIcon status="error" text={searchParseError.message} />
              )}
              <IconButton
                aria-label="Clear"
                onClick={() => setQuery('')}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        tooltipText={
          type === 'Community'
            ? 'Hint: try searching for a specific item by prepending your search term with "username:", "label:", or "description:"'
            : undefined
        }
        hideLabel
        label="Search"
        onChange={debounce(400, (e) => setQuery(e.target.value))}
        placeholder="Search StackScripts"
        value={query}
      />
      <Table sx={{ mt: 1 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 20 }}></TableCell>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              StackScript
            </TableSortCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stackscripts?.map((stackscript) => (
            <StackScriptSelectionRow
              onSelect={() => {
                setValue('image', null);
                setValue(
                  'stackscript_data',
                  getDefaultUDFData(stackscript.user_defined_fields)
                );
                field.onChange(stackscript.id);
              }}
              isSelected={field.value === stackscript.id}
              key={stackscript.id}
              onOpenDetails={() => setSelectedStackScriptId(stackscript.id)}
              stackscript={stackscript}
            />
          ))}
          {data?.pages[0].results === 0 && <TableRowEmpty colSpan={3} />}
          {error && <TableRowError colSpan={3} message={error[0].reason} />}
          {isLoading && <TableRowLoading columns={3} rows={25} />}
          {(isFetchingNextPage || hasNextPage) && (
            <TableRowLoading columns={3} rows={1} />
          )}
        </TableBody>
      </Table>
      {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
      <StackScriptDetailsDialog
        id={selectedStackScriptId}
        onClose={() => setSelectedStackScriptId(undefined)}
        open={selectedStackScriptId !== undefined}
      />
    </Box>
  );
};
