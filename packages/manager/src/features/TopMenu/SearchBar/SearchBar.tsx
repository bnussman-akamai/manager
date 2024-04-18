import React, { useState } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';

import { useSearch } from './search';

export const SearchBar = () => {
  const [query, setQuery] = useState('');

  const {
    data,
    hasMorePages,
    isLoading,
    isQueryInvalid,
    loadNextPages,
    queryParseError,
  } = useSearch(query);

  return (
    <Autocomplete
      ListboxProps={{
        onScroll: (event: React.SyntheticEvent) => {
          const listboxNode = event.currentTarget;
          if (
            listboxNode.scrollTop + listboxNode.clientHeight >=
              listboxNode.scrollHeight &&
            hasMorePages
          ) {
            loadNextPages();
          }
        },
      }}
      textFieldProps={{
        InputProps: {
          endAdornment:
            query && isQueryInvalid ? (
              <Tooltip title={queryParseError}>
                <Typography>⛔️</Typography>
              </Tooltip>
            ) : undefined,
        },
        error: Boolean(query) && isQueryInvalid,
      }}
      filterOptions={(x) => x}
      fullWidth
      inputValue={query}
      label=""
      loading={isLoading}
      noMarginTop
      onInputChange={(e, value) => setQuery(value)}
      options={data}
      placeholder="Search 🔎"
      sx={{ flexGrow: 1, mt: -1 }}
      value={null}
    />
  );
};
