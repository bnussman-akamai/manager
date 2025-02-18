import { keyframes } from 'tss-react';

export const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const fadeIn = keyframes`
  from {
    opacity: 0;
  },
  to {
    opacity: 1;
  }
`;

export const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0px red;
  }
  100% {
    box-shadow: 0 0 0 10px red;
  }
`;
