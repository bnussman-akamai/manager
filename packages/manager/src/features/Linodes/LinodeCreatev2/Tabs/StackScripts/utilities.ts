export type StackScriptTabType = 'Account' | 'Community';

export const getStackScriptTabIndex = (tab: StackScriptTabType | undefined) => {
  if (tab === undefined) {
    return 0;
  }

  const tabIndex = tabs.indexOf(tab);

  if (tabIndex === -1) {
    return 0;
  }

  return tabIndex;
};

export const tabs = ['Account', 'Community'] as const;

export const communityStackScriptFilter = {
  '+and': [
    { username: { '+neq': 'linode' } },
    { username: { '+neq': 'linode-stackscripts' } },
  ],
  mine: false,
};

export const accountStackScriptFilter = { mine: true };
