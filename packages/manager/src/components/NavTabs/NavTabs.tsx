import * as React from 'react';
import { matchPath, Redirect, useHistory, useLocation } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';
import Tabs from '@mui/material/Tabs';
import { Tab } from '@mui/material';

export interface NavTab {
  title: string;
  routeName: string;
  component?:
    | React.ComponentType
    | React.LazyExoticComponent<React.ComponentType>;
  render?: JSX.Element;
  // Whether or not this tab should be rendered in the background (even when
  // not on screen). Consumers should consider performance implications,
  // especially when a component behind a tab performs network requests.
  backgroundRendering?: boolean;
}

export interface NavTabsProps {
  tabs: NavTab[];
  navToTabRouteOnChange?: boolean;
}

export const NavTabs = React.memo((props: NavTabsProps) => {
  const history = useHistory();
  const reactRouterLocation = useLocation();

  const { tabs, navToTabRouteOnChange } = props;

  // Defaults to `true`.
  const _navToTabRouteOnChange = navToTabRouteOnChange ?? true;

  const navToURL = (index: number) => {
    if (tabs[index]) {
      history.push(tabs[index].routeName);
    }
  };

  const tabMatch = getTabMatch(tabs, reactRouterLocation.pathname);

  // Redirect to the first tab's route name if the pathname is unknown.
  if (tabMatch.idx === -1) {
    return <Redirect to={tabs[0].routeName} />;
  }

  // Redirect to the exact route name if the pathname doesn't match precisely.
  if (!tabMatch.isExact) {
    return <Redirect to={tabs[tabMatch.idx].routeName} />;
  }

  return (
    <>
      <Tabs
        value={Math.max(tabMatch.idx, 0)}
        onChange={(_, i) => (_navToTabRouteOnChange ? navToURL(i) : undefined)}
        aria-label="basic tabs example"
      >
        {tabs.map((tab) => (
          <Tab key={tab.title} label={tab.title} />
        ))}
      </Tabs>
      <React.Suspense fallback={<SuspenseLoader />}>
        {tabs.map((thisTab, i) => {
          if (!thisTab.render && !thisTab.component) {
            return null;
          }
          if (i !== Math.max(tabMatch.idx, 0)) {
            return null;
          }
          if (thisTab.component) {
            return <thisTab.component key={`tab-body-${i}-${thisTab.title}`} />;
          }
          if (thisTab.render) {
            return thisTab.render;
          }
          return null;
        })}
      </React.Suspense>
    </>
  );
});

// Given tabs and a pathname, return the index of the matched tab, and whether
// or not it's an exact match. If no match is found, the returned index is -1.
export const getTabMatch = (tabs: NavTab[], pathname: string) => {
  return tabs.reduce(
    (acc, thisTab, i) => {
      const match = matchPath(pathname, {
        path: thisTab.routeName,
        exact: false,
      });

      if (match) {
        acc.idx = i;
        acc.isExact = match.isExact;
      }

      return acc;
    },
    { idx: -1, isExact: false }
  );
};
