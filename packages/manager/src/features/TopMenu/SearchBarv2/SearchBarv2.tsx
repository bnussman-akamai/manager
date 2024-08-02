import React, { useState } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Stack } from 'src/components/Stack';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

import { useSearch } from './search';
import { EntityIcon, EntityVariants } from 'src/components/EntityIcon/EntityIcon';

export const SearchBarv2 = () => {
  const [query, setQuery] = useState('');

  const {
    data,
    entitiesThatCouldBeAPIFiltered,
    entitiesThatErroredWhenAPIFiltering,
    isLoading,
    parsingError,
  } = useSearch(query);

  return (
    <Autocomplete
      renderOption={(props, option) => (
        <li {...props} style={{ width: '100%' }}>
          <Stack alignItems="center" direction="row" spacing={2} width="100%">
            <Typography>
              <EntityIcon
                size={16}
                variant={option.entity.toLowerCase() as EntityVariants}
              />
            </Typography>
            <Typography>{option.label}</Typography>
            <Box flexGrow={1} />
            <Typography>({option.id})</Typography>
          </Stack>
        </li>
      )}
      textFieldProps={{
        InputProps: {
          endAdornment: (
            <>
              {parsingError && (
                <TooltipIcon
                  status="error"
                  sxTooltipIcon={{ p: 0 }}
                  text={parsingError.message}
                />
              )}
              {entitiesThatErroredWhenAPIFiltering.length > 0 && (
                <TooltipIcon
                  text={
                    <Stack>
                      {entitiesThatCouldBeAPIFiltered.length > 0 && (
                        <Typography mb={2}>
                          You are seeing results for{' '}
                          {entitiesThatCouldBeAPIFiltered
                            .map((e) => `${e}s`)
                            .join(', ')}
                        </Typography>
                      )}
                      {entitiesThatErroredWhenAPIFiltering.map((entity) => (
                        <Typography key={entity.name}>
                          {entity.name}s: {entity.error}
                        </Typography>
                      ))}
                    </Stack>
                  }
                  status="warning"
                  sxTooltipIcon={{ p: 0 }}
                  width={500}
                />
              )}
            </>
          ),
        },
        hideLabel: true,
      }}
      filterOptions={(x) => x}
      fullWidth
      inputValue={query}
      label="Search"
      loading={isLoading}
      noOptionsText={!query ? 'Type to search' : 'No results'}
      onInputChange={(e, value) => setQuery(value)}
      options={data}
      placeholder="Search"
    />
  );
};
