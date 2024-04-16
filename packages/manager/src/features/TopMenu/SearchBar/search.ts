import { generate } from 'peggy';

import { useInfiniteVolumesQuery } from "src/queries/volumes";

// @ts-expect-error no type
import grammar from './search.peggy?raw';

const parser = generate(grammar);

export function useSearch(query: string) {

  let apiFilter = {};

  try {
    apiFilter = parser.parse(query);
  } catch (error) {
    console.log(error.message)
  }
  
  const { data, isLoading } = useInfiniteVolumesQuery(apiFilter);

  return { data, isLoading };
};