import React, { useState } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

import { useSearch } from './search';

export const SearchBar = () => {
  const [query, setQuery] = useState("");

  const { data, isLoading } = useSearch(query);

  return (
    <Autocomplete
      filterOptions={x => x}
      fullWidth
      inputValue={query}
      label=""
      loading={isLoading}
      noMarginTop
      onInputChange={(e, value) => setQuery(value)}
      options={data?.pages.flatMap((page) => page.data) ?? []}
      placeholder="Search 🔎"
      sx={{ flexGrow: 1, mt: -1 }}
      value={null}
    />
  );
};
