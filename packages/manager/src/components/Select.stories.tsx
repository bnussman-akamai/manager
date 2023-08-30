import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { MenuItem } from './MenuItem';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  component: Select,
  title: 'Components/Select',
};

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    children: [
      <MenuItem key="10" value={10}>
        Ten
      </MenuItem>,
      <MenuItem key="20" value={20}>
        Twenty
      </MenuItem>,
      <MenuItem key="30" value={30}>
        Thirty
      </MenuItem>,
    ],
    label: 'Select',
  },
  render: (args) => <Select {...args} />,
};

export default meta;
