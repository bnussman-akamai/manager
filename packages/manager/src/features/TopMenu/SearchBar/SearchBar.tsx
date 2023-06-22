import Close from '@mui/icons-material/Close';
import Search from '@mui/icons-material/Search';
import { take } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { components } from 'react-select';
import { compose } from 'recompose';
import { IconButton } from 'src/components/IconButton';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import useAPISearch from 'src/features/Search/useAPISearch';
import withStoreSearch, {
  SearchProps,
} from 'src/features/Search/withStoreSearch';
import useAccountManagement from 'src/hooks/useAccountManagement';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllImagesQuery } from 'src/queries/images';
import {
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';
import { useAllVolumesQuery } from 'src/queries/volumes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { isNilOrEmpty } from 'src/utilities/isNilOrEmpty';
import { debounce } from 'throttle-debounce';
import styled, { StyleProps } from './SearchBar.styles';
import SearchSuggestion from './SearchSuggestion';
import { formatLinode } from 'src/store/selectors/getSearchEntities';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';
import { useRegionsQuery } from 'src/queries/regions';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import { getImageLabelForLinode } from 'src/features/Images/utils';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';

type CombinedProps = SearchProps & StyleProps;

const Control = (props: any) => <components.Control {...props} />;

/* The final option in the list will be the "go to search results page" link.
 * This doesn't share the same shape as the rest of the results, so should use
 * the default styling. */
const Option = (props: any) => {
  return ['redirect', 'info', 'error'].includes(props.value) ? (
    <components.Option {...props} />
  ) : (
    <SearchSuggestion {...props} />
  );
};

// Style overrides for React Select
export const selectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: '#f4f4f4',
    margin: 0,
    width: '100%',
    border: 0,
  }),
  input: (base: any) => ({ ...base, margin: 0, width: '100%', border: 0 }),
  selectContainer: (base: any) => ({
    ...base,
    width: '100%',
    margin: 0,
    border: 0,
  }),
  dropdownIndicator: () => ({ display: 'none' }),
  placeholder: (base: any) => ({
    ...base,
    fontSize: '0.875rem',
    color: base?.palette?.text?.primary,
  }),
  menu: (base: any) => ({ ...base, maxWidth: '100% !important' }),
};

export const SearchBar = (props: CombinedProps) => {
  const { classes, combinedResults, entitiesLoading, search } = props;

  const [searchText, setSearchText] = React.useState<string>('');
  const [searchActive, setSearchActive] = React.useState<boolean>(false);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);

  const [apiResults, setAPIResults] = React.useState<any[]>([]);
  const [apiError, setAPIError] = React.useState<string | null>(null);
  const [apiSearchLoading, setAPILoading] = React.useState<boolean>(false);

  const history = useHistory();

  const { _isLargeAccount } = useAccountManagement();

  // Only request things if the search bar is open/active.
  const shouldMakeRequests = searchActive && !_isLargeAccount;

  const { data: objectStorageClusters } = useObjectStorageClusters(
    shouldMakeRequests
  );

  const { data: objectStorageBuckets } = useObjectStorageBuckets(
    objectStorageClusters,
    shouldMakeRequests
  );

  const { data: domains } = useAllDomainsQuery(shouldMakeRequests);

  const { data: clusters } = useAllKubernetesClustersQuery(shouldMakeRequests);

  const { data: volumes } = useAllVolumesQuery({}, {}, shouldMakeRequests);

  const { data: nodebalancers } = useAllNodeBalancersQuery(shouldMakeRequests);

  const { data: _privateImages, isLoading: imagesLoading } = useAllImagesQuery(
    {},
    { is_public: false }, // We want to display private images (i.e., not Debian, Ubuntu, etc. distros)
    shouldMakeRequests
  );

  const { data: publicImages } = useAllImagesQuery(
    {},
    { is_public: true },
    searchActive
  );

  const { data: linodes, isLoading: linodesLoading } = useAllLinodesQuery(
    {},
    {},
    shouldMakeRequests
  );

  const { data: regions } = useRegionsQuery();

  const typesQuery = useSpecificTypes(
    (linodes ?? []).map((linode) => linode.type).filter(isNotNullOrUndefined),
    shouldMakeRequests
  );

  const types = extendTypesQueryResult(typesQuery);

  const searchableLinodes = (linodes ?? []).map((linode) => {
    const imageLabel = getImageLabelForLinode(linode, publicImages ?? []);
    return formatLinode(linode, types, imageLabel);
  });

  const { searchAPI } = useAPISearch(!isNilOrEmpty(searchText));

  const _searchAPI = React.useRef(
    debounce(500, false, (_searchText: string) => {
      setAPILoading(true);
      searchAPI(_searchText)
        .then((searchResults) => {
          setAPIResults(searchResults.combinedResults);
          setAPILoading(false);
          setAPIError(null);
        })
        .catch((error) => {
          setAPIError(
            getAPIErrorOrDefault(error, 'Error loading search results')[0]
              .reason
          );
          setAPILoading(false);
        });
    })
  ).current;

  const buckets = objectStorageBuckets?.buckets || [];

  React.useEffect(() => {
    // We can't store all data for large accounts for client side search,
    // so use the API's filtering instead.
    if (_isLargeAccount) {
      _searchAPI(searchText);
    } else {
      search(
        searchText,
        buckets,
        domains ?? [],
        volumes ?? [],
        clusters ?? [],
        _privateImages ?? [],
        regions ?? [],
        searchableLinodes ?? [],
        nodebalancers ?? []
      );
    }
  }, [
    imagesLoading,
    search,
    searchText,
    _searchAPI,
    _isLargeAccount,
    objectStorageBuckets,
    domains,
    volumes,
    _privateImages,
    regions,
    nodebalancers,
  ]);

  const handleSearchChange = (_searchText: string): void => {
    setSearchText(_searchText);
  };

  const toggleSearch = () => {
    setSearchActive(!searchActive);
    setMenuOpen(!menuOpen);
  };

  const onClose = () => {
    document.body.classList.remove('searchOverlay');
    setSearchActive(false);
    setMenuOpen(false);
  };

  const onOpen = () => {
    document.body.classList.add('searchOverlay');
    setSearchActive(true);
    setMenuOpen(true);
  };

  const onSelect = (item: Item) => {
    if (!item || item.label === '') {
      return;
    }

    if (item.value === 'info' || item.value === 'error') {
      return;
    }

    const text = item?.data?.searchText ?? '';

    if (item.value === 'redirect') {
      history.push({
        pathname: `/search`,
        search: `?query=${encodeURIComponent(text)}`,
      });
      return;
    }
    history.push(item.data.path);
  };

  const onKeyDown = (e: any) => {
    if (
      e.keyCode === 13 &&
      searchText !== '' &&
      (!combinedResults || combinedResults.length < 1)
    ) {
      history.push({
        pathname: `/search`,
        search: `?query=${encodeURIComponent(searchText)}`,
      });
      onClose();
    }
  };

  const guidanceText = () => {
    if (_isLargeAccount) {
      // This fancy stuff won't work if we're using API
      // based search; don't confuse users by displaying this.
      return undefined;
    }
    return (
      <>
        <b>By field:</b> “tag:my-app” “label:my-linode” &nbsp;&nbsp;
        <b>With operators</b>: “tag:my-app AND is:domain”
      </>
    );
  };

  /* Need to override the default RS filtering; otherwise entities whose label
   * doesn't match the search term will be automatically filtered, meaning that
   * searching by tag won't work. */
  const filterResults = () => {
    return true;
  };

  const finalOptions = createFinalOptions(
    _isLargeAccount ? apiResults : combinedResults,
    searchText,
    apiSearchLoading || linodesLoading || imagesLoading,
    // Ignore "Unauthorized" errors, since these will always happen on LKE
    // endpoints for restricted users. It's not really an "error" in this case.
    // We still want these users to be able to use the search feature.
    Boolean(apiError) && apiError !== 'Unauthorized'
  );

  return (
    <React.Fragment>
      <IconButton
        color="inherit"
        aria-label="open menu"
        onClick={toggleSearch}
        className={classes.navIconHide}
        size="large"
      >
        <Search />
      </IconButton>
      <div
        className={`
          ${classes.root}
          ${searchActive ? 'active' : ''}
        `}
      >
        <Search className={classes.icon} data-qa-search-icon />
        <label htmlFor="main-search" className="visually-hidden">
          Main search
        </label>
        <EnhancedSelect
          label="Main search"
          hideLabel
          blurInputOnSelect
          options={finalOptions}
          onChange={onSelect}
          onInputChange={handleSearchChange}
          onKeyDown={onKeyDown}
          placeholder={
            searchActive
              ? 'Search'
              : 'Search for Linodes, Volumes, NodeBalancers, Domains, Buckets, Tags...'
          }
          components={{ Control, Option }}
          styles={selectStyles}
          openMenuOnFocus={false}
          openMenuOnClick={false}
          filterOption={filterResults}
          isLoading={entitiesLoading}
          isClearable={false}
          isMulti={false}
          onMenuClose={onClose}
          onMenuOpen={onOpen}
          menuIsOpen={menuOpen}
          guidance={guidanceText()}
        />
        <IconButton
          color="inherit"
          aria-label="close menu"
          onClick={toggleSearch}
          className={classes.navIconHide}
          size="large"
        >
          <Close className={classes.close} />
        </IconButton>
      </div>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  withStoreSearch(),
  styled
)(SearchBar) as React.ComponentType<{}>;

export const createFinalOptions = (
  results: Item[],
  searchText: string = '',
  loading: boolean = false,
  error: boolean = false
) => {
  const redirectOption = {
    value: 'redirect',
    data: {
      searchText,
    },
    label: `View search results page for "${searchText}"`,
  };

  const loadingResults = {
    value: 'info',
    label: 'Loading results...',
  };

  const searchError = {
    value: 'error',
    label: 'Error retrieving search results',
  };

  // Results aren't final as we're loading data

  if (loading) {
    return [redirectOption, loadingResults];
  }

  if (error) {
    return [searchError];
  }

  // NO RESULTS:
  if (!results || results.length === 0) {
    return [];
  }

  // LESS THAN 20 RESULTS:
  if (results.length <= 20) {
    return [redirectOption, ...results];
  }

  // MORE THAN 20 RESULTS:
  const lastOption = {
    value: 'redirect',
    data: {
      searchText,
    },
    label: `View all ${results.length} results for "${searchText}"`,
  };

  const first20Results = take(20, results);
  return [redirectOption, ...first20Results, lastOption];
};
