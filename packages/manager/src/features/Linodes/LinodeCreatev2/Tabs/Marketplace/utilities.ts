import { oneClickApps } from 'src/features/OneClickApps/oneClickAppsv2';

import type { StackScript } from '@linode/api-v4';
import type { AppCategory } from 'src/features/OneClickApps/types';

/**
 * Get all categories from our marketplace apps list so
 * we can generate a dynamic list of category options.
 */
const categories = Object.values(oneClickApps).reduce((acc, app) => {
  return [...acc, ...app.categories];
}, []);

export const uniqueCategories = Array.from(new Set(categories));

/**
 * A list of unique categories to be shown in a Select/Autocomplete
 */
export const categoryOptions = uniqueCategories.map((category) => ({
  label: category,
}));

/**
 * Returns an array of Marketplace app sections given an array
 * of Marketplace app StackScripts
 */
export const getAppSections = (stackscripts: StackScript[]) => {
  // To check if an app is 'new', we check our own 'oneClickApps' list for the 'isNew' value
  const newApps = stackscripts.filter(
    (stackscript) => oneClickApps[stackscript.id]?.isNew
  );

  // Items are ordered by popularity already, take the first 10
  const popularApps = stackscripts.slice(0, 10);

  // In the all apps section, show everything in alphabetical order
  const allApps = [...stackscripts].sort((a, b) =>
    a.label.toLowerCase().localeCompare(b.label.toLowerCase())
  );

  return [
    {
      stackscripts: newApps,
      title: 'New apps',
    },
    {
      stackscripts: popularApps,
      title: 'Popular apps',
    },
    {
      stackscripts: allApps,
      title: 'All apps',
    },
  ];
};

interface FilterdAppsOptions {
  category: AppCategory | undefined;
  query: string;
  stackscripts: StackScript[];
}

/**
 * Performs the client side filtering Marketplace Apps on the Linode Create flow
 *
 * Currently, we only allow users to search OR filter by category in the UI.
 * We don't allow both at the same time. If we want to change that, this function
 * will need to be modified.
 *
 * @returns Stackscripts that have been filtered based on the options passed
 */
export const getFilteredApps = (options: FilterdAppsOptions) => {
  const { category, query, stackscripts } = options;

  return stackscripts.filter((stackscript) => {
    const appDetails = oneClickApps[stackscript.id];

    const queryWords = query
      .replace(/[,.-]/g, '')
      .trim()
      .toLocaleLowerCase()
      .split(' ');

    const searchableAppFields = [
      String(stackscript.id),
      stackscript.label,
      appDetails.name,
      appDetails.alt_name,
      appDetails.alt_description,
      ...appDetails.categories,
    ];

    const matchesSearchQuery = searchableAppFields.some((field) =>
      queryWords.some((queryWord) => field.toLowerCase().includes(queryWord))
    );

    if (query && category) {
      const matchesCategory = oneClickApps[stackscript.id].categories.includes(
        category
      );

      return matchesSearchQuery && matchesCategory;
    }

    if (query) {
      return matchesSearchQuery;
    }

    if (category) {
      return oneClickApps[stackscript.id].categories.includes(category);
    }

    return true;
  });
};
