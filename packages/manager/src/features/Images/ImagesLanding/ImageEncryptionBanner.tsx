import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';

export const ImageEncryptionBanner = () => {
  return (
    <DismissibleBanner
      preferenceKey="image-encryption"
      spacingBottom={4}
      variant="info"
    >
      Image encryption is now standard.
    </DismissibleBanner>
  );
};
