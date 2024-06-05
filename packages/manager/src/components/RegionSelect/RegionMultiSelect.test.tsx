import { Region } from '@linode/api-v4';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { regionFactory } from 'src/factories/regions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RegionMultiSelect } from './RegionMultiSelect';

const regions = regionFactory.buildList(1, {
  id: 'us-east',
  label: 'Newark, NJ',
});

const regionsNewark = regionFactory.buildList(1, {
  id: 'us-east',
  label: 'Newark, NJ',
});
const regionsAtlanta = regionFactory.buildList(1, {
  id: 'us-southeast',
  label: 'Atlanta, GA',
});
interface SelectedRegionsProps {
  onRemove: (region: string) => void;
  selectedRegions: Region[];
}
const SelectedRegionsList = ({
  onRemove,
  selectedRegions,
}: SelectedRegionsProps) => (
  <ul>
    {selectedRegions.map((region, index) => (
      <li aria-label={region.label} key={index}>
        {region.label}
        <button onClick={() => onRemove(region.id)}>Remove</button>
      </li>
    ))}
  </ul>
);

const mockHandleSelection = vi.fn();

describe('RegionMultiSelect', () => {
  it('renders correctly with initial props', () => {
    renderWithTheme(
      <RegionMultiSelect
        currentCapability="Block Storage"
        onChange={mockHandleSelection}
        regions={regions}
        selectedIds={[]}
      />
    );

    screen.getByRole('combobox', { name: 'Regions' });
  });

  // Re-enable if we allow RegionMultiSelect to be uncontrolled
  it.skip('should be able to select all the regions correctly', () => {
    renderWithTheme(
      <RegionMultiSelect
        currentCapability="Block Storage"
        onChange={mockHandleSelection}
        regions={[...regionsNewark, ...regionsAtlanta]}
        selectedIds={[]}
      />
    );

    // Open the dropdown
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    fireEvent.click(screen.getByRole('option', { name: 'Select All' }));

    // Check if all the option is selected
    expect(
      screen.getByRole('option', {
        name: 'Newark, NJ (us-east)',
      })
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('option', {
        name: 'Newark, NJ (us-east)',
      })
    ).toHaveAttribute('aria-selected', 'true');
  });

  // Re-enable if we allow RegionMultiSelect to be uncontrolled
  it.skip('should be able to deselect all the regions', () => {
    renderWithTheme(
      <RegionMultiSelect
        currentCapability="Block Storage"
        onChange={mockHandleSelection}
        regions={[...regionsNewark, ...regionsAtlanta]}
        selectedIds={['us-east', 'us-southeast']}
      />
    );

    // Open the dropdown
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    fireEvent.click(screen.getByRole('option', { name: 'Deselect All' }));

    // Check if all the option is deselected selected
    expect(
      screen.getByRole('option', {
        name: 'Newark, NJ (us-east)',
      })
    ).toHaveAttribute('aria-selected', 'false');
    expect(
      screen.getByRole('option', {
        name: 'Newark, NJ (us-east)',
      })
    ).toHaveAttribute('aria-selected', 'false');
  });

  // Re-enable if we allow RegionMultiSelect to be uncontrolled
  it.skip('should render selected regions correctly', () => {
    renderWithTheme(
      <RegionMultiSelect
        SelectedRegionsList={({ onRemove, selectedRegions }) => (
          <SelectedRegionsList
            onRemove={onRemove}
            selectedRegions={selectedRegions}
          />
        )}
        currentCapability="Block Storage"
        onChange={mockHandleSelection}
        regions={[...regionsNewark, ...regionsAtlanta]}
        selectedIds={[]}
      />
    );

    // Open the dropdown
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    fireEvent.click(screen.getByRole('option', { name: 'Select All' }));

    // Close the dropdown
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    // Check if all the options are rendered
    expect(
      screen.getByRole('listitem', {
        name: 'Newark, NJ (us-east)',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', {
        name: 'Newark, NJ (us-east)',
      })
    ).toBeInTheDocument();
  });
});
