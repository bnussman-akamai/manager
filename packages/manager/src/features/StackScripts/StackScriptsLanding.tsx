import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { NavTabs } from 'src/components/NavTabs/NavTabs';

import { StackScriptsLandingTable } from './StackScriptsLandingTable';

import type { NavTab } from 'src/components/NavTabs/NavTabs';

export const StackScriptsLanding = () => {
  const history = useHistory();

  const tabs: NavTab[] = [
    {
      render: <StackScriptsLandingTable type="account" />,
      routeName: '/stackscripts/account',
      title: 'Account StackScripts',
    },
    {
      render: <StackScriptsLandingTable type="community" />,
      routeName: '/stackscripts/community',
      title: 'Community StackScripts',
    },
  ];

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="StackScripts" />
      <LandingHeader
        docsLink="https://www.linode.com/docs/platform/stackscripts"
        entity="StackScript"
        onButtonClick={() => history.push('/stackscripts/create')}
        removeCrumbX={1}
        title="StackScripts"
      />
      <NavTabs tabs={tabs} />
    </React.Fragment>
  );
};
