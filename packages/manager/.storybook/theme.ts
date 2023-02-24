import { create } from '@storybook/theming';
import Logo from '../src/assets/logo/akamai-logo.svg';

export default create({
  base: 'light',
  brandTitle: 'Akamai',
  brandUrl: 'https://www.linode.com',
  brandImage: Logo,
});
