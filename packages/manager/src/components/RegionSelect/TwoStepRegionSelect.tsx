import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics/customEventAnalytics';

import type {
  RegionFilterValue,
  RegionSelectProps,
} from './RegionSelect.types';

type TwoStepRegionSelectProps = RegionSelectProps<true>;

interface GeographicalAreaOption {
  label: string;
  value: RegionFilterValue;
}

const GEOGRAPHICAL_AREA_OPTIONS: GeographicalAreaOption[] = [
  {
    label: 'All',
    value: 'distributed-ALL',
  },
  {
    label: 'North America',
    value: 'distributed-NA',
  },
  {
    label: 'Africa',
    value: 'distributed-AF',
  },
  {
    label: 'Asia',
    value: 'distributed-AS',
  },
  {
    label: 'Europe',
    value: 'distributed-EU',
  },
  {
    label: 'Oceania',
    value: 'distributed-OC',
  },
  {
    label: 'South America',
    value: 'distributed-SA',
  },
];

export const TwoStepRegionSelect = (props: TwoStepRegionSelectProps) => {
  const [regionFilter, setRegionFilter] = React.useState<RegionFilterValue>(
    'distributed'
  );

  return (
    <Tabs>
      <TabList>
        <Tab>Core</Tab>
        <Tab>Distributed</Tab>
      </TabList>
      <TabPanels>
        <SafeTabPanel index={0}>
          <Box marginTop={2}>
            <RegionHelperText
              onClick={() => sendLinodeCreateDocsEvent('Speedtest')}
            />
          </Box>
          <RegionSelect
            disableClearable
            regionFilter="core"
            showDistributedRegionIconHelperText={false}
            {...props}
          />
        </SafeTabPanel>
        <SafeTabPanel index={1}>
          <Autocomplete
            onChange={(_, selectedOption) => {
              if (selectedOption?.value) {
                setRegionFilter(selectedOption.value);
              }
            }}
            defaultValue={GEOGRAPHICAL_AREA_OPTIONS[0]}
            disableClearable
            label="Geographical Area"
            options={GEOGRAPHICAL_AREA_OPTIONS}
          />
          <RegionSelect
            disableClearable
            regionFilter={regionFilter}
            showDistributedRegionIconHelperText={false}
            {...props}
          />
        </SafeTabPanel>
      </TabPanels>
    </Tabs>
  );
};
