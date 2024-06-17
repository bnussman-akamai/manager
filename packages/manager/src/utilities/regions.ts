import type { Region } from '@linode/api-v4/lib/regions';

/**
 * This utility function takes an array of regions data and transforms it into a lookup object.
 * Each key in the resulting object corresponds to the ID of a region, and its value is the region object itself.
 * This is useful for quickly accessing region data by ID.
 *
 * @returns {Object} A lookup object where each key is a region ID and its value is the corresponding region object.
 */
export const getRegionsByRegionId = (
  regionsData: Region[] | undefined
): Record<string, Region> => {
  if (!Array.isArray(regionsData)) {
    return {};
  }
  return regionsData.reduce<Record<string, Region>>((regions, region) => {
    regions[region.id] = region;
    return regions;
  }, {});
};
