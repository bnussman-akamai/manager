import * as React from 'react';

import { ListItem } from 'src/components/ListItem';
import { Notice } from 'src/components/Notice/Notice';
import { getCapabilityFromPlanType } from 'src/utilities/planNotices';
import { formatPlanTypes } from 'src/utilities/planNotices';

import type { LinodeTypeClass, Region } from '@linode/api-v4';

import { styled } from '@mui/material/styles';

import { List } from 'src/components/List';
import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';

import type { Theme } from '@mui/material/styles';

export const StyledNoticeTypography = styled(Typography, {
  label: 'StyledNoticeTypography',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
}));

export const StyledTextTooltip = styled(TextTooltip, {
  label: 'StyledTextTooltip',
})(() => ({}));

export const StyledFormattedRegionList = styled(List, {
  label: 'StyledFormattedRegionList',
})(({ theme }) => ({
  '& li': {
    padding: `4px 0`,
  },
  padding: `${theme.spacing(0.5)} ${theme.spacing()}`,
}));

StyledTextTooltip.defaultProps = {
  minWidth: 225,
  placement: 'bottom-start',
  sxTypography: {
    fontFamily: (theme: Theme) => theme.font.bold,
  },
  variant: 'body2',
};

StyledNoticeTypography.defaultProps = {
  variant: 'body2',
};

export interface PlansAvailabilityNoticeProps {
  hasSelectedRegion: boolean;
  isSelectedRegionEligibleForPlan: boolean;
  planType: LinodeTypeClass;
  regionsData: Region[];
}

export const PlansAvailabilityNotice = React.memo(
  (props: PlansAvailabilityNoticeProps) => {
    const {
      hasSelectedRegion,
      isSelectedRegionEligibleForPlan,
      planType,
      regionsData,
    } = props;
    const capability = getCapabilityFromPlanType(planType);

    const getEligibleRegionList = React.useCallback(() => {
      return (
        regionsData?.filter((region: Region) =>
          region.capabilities.includes(capability)
        ) || []
      );
    }, [capability, regionsData]);

    return (
      <PlansAvailabilityNoticeMessage
        hasSelectedRegion={hasSelectedRegion}
        isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
        planType={planType}
        regionList={getEligibleRegionList()}
      />
    );
  }
);

interface PlansAvailabilityNoticeMessageProps {
  hasSelectedRegion: boolean;
  isSelectedRegionEligibleForPlan: boolean;
  planType: LinodeTypeClass;
  regionList: Region[];
}

const PlansAvailabilityNoticeMessage = (
  props: PlansAvailabilityNoticeMessageProps
) => {
  const {
    hasSelectedRegion,
    isSelectedRegionEligibleForPlan,
    planType,
    regionList,
  } = props;

  const FormattedRegionList = () => (
    <StyledFormattedRegionList>
      {regionList?.map((region: Region) => {
        return (
          <ListItem
            disablePadding
            key={region.id}
          >{`${region.label} (${region.id})`}</ListItem>
        );
      })}
    </StyledFormattedRegionList>
  );

  const formattedPlanType = formatPlanTypes(planType);

  if (!hasSelectedRegion) {
    return (
      <Notice dataTestId={`${planType}-notice-warning`} variant="warning">
        <StyledNoticeTypography>
          {formattedPlanType} Plans are currently available in&nbsp;
          <StyledTextTooltip
            displayText="select regions"
            tooltipText={<FormattedRegionList />}
          />
          .
        </StyledNoticeTypography>
      </Notice>
    );
  }

  if (hasSelectedRegion && !isSelectedRegionEligibleForPlan) {
    return (
      <Notice
        bypassValidation={true}
        dataTestId={`${planType}-notice-error`}
        variant="error"
      >
        <StyledNoticeTypography>
          {formattedPlanType} Plans are not currently available in this
          region.&nbsp;
          <StyledTextTooltip
            tooltipText={
              regionList.length > 0 ? (
                <FormattedRegionList />
              ) : (
                'There are no regions available for this plan.'
              )
            }
            displayText="See global availability"
          />
          .
        </StyledNoticeTypography>
      </Notice>
    );
  }

  return null;
};
