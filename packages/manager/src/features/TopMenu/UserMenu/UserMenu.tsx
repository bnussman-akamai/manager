import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import { GravatarByEmail } from 'src/components/GravatarByEmail';
import useAccountManagement from 'src/hooks/useAccountManagement';
import { useGrants } from 'src/queries/profile';
import Popover from '@mui/material/Popover';
import Button from 'src/components/Button/Button';
import Stack from '@mui/material/Stack';
import Box from 'src/components/core/Box';

interface MenuLink {
  display: string;
  href: string;
  hide?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    height: '100%',
    order: 4,
    '&:hover, &.active': {
      '& $username': {
        color: theme.palette.primary.main,
      },
      '& $userWrapper': {
        boxShadow: '0 0 10px #bbb',
      },
    },
    '&:focus': {
      '& $username': {
        color: theme.palette.primary.main,
      },
    },
  },
  userWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: theme.transitions.create(['box-shadow']),
    height: 30,
    width: 30,
    '& svg': {
      color: '#c9c7c7',
      width: 30,
      height: 30,
    },
    [theme.breakpoints.down('lg')]: {
      width: '28px',
      height: '28px',
    },
  },
  leftIcon: {
    borderRadius: '50%',
    height: 30,
    width: 30,
  },
  username: {
    maxWidth: '135px',
    overflow: 'hidden',
    paddingRight: 15,
    textOverflow: 'ellipsis',
    transition: theme.transitions.create(['color']),
    whiteSpace: 'nowrap',
  },
  menuItem: {
    fontFamily: 'LatoWeb',
    fontSize: '.9rem',
    '&:hover, &:focus': {
      backgroundColor: theme.name === 'light' ? '#3a3f46' : '#23262a',
      color: 'white',
    },
  },
  hidden: {
    ...theme.visually.hidden,
  },
  menuButton: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    [theme.breakpoints.up('sm')]: {
      paddingLeft: 12,
    },
    [theme.breakpoints.down(360)]: {
      paddingLeft: 3,
    },
  },
  gravatar: {
    height: 30,
    width: 30,
    borderRadius: '50%',
  },
  caret: {
    color: '#9ea4ae',
    fontSize: 26,
    marginTop: 2,
    marginLeft: 2,
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  inlineUserName: {
    paddingLeft: theme.spacing(),
    fontSize: '0.875rem',
  },
  menuHeader: {
    borderBottom: '1px solid #9ea4ae',
    color: theme.textColors.headlineStatic,
    fontSize: '.75rem',
    letterSpacing: 1.875,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(),
    lineHeight: 2,
  },
  profileWrapper: {
    '& > div': {
      whiteSpace: 'normal',
    },
  },
  accountColumn: {
    whiteSpace: 'normal',
    width: '100%',
  },
  menuItemLink: {
    ...theme.applyLinkStyles,
    fontSize: '0.875rem',
  },
  userName: {
    color: theme.textColors.headlineStatic,
    fontSize: '1.1rem',
  },
}));

const profileLinks: MenuLink[] = [
  {
    display: 'Display',
    href: '/profile/display',
  },
  { display: 'Login & Authentication', href: '/profile/auth' },
  { display: 'SSH Keys', href: '/profile/keys' },
  { display: 'LISH Console Settings', href: '/profile/lish' },
  {
    display: 'API Tokens',
    href: '/profile/tokens',
  },
  { display: 'OAuth Apps', href: '/profile/clients' },
  { display: 'Referrals', href: '/profile/referrals' },
  { display: 'My Settings', href: '/profile/settings' },
  { display: 'Log Out', href: '/logout' },
];

export const UserMenu = () => {
  const classes = useStyles();

  const {
    profile,
    _hasAccountAccess,
    _isRestrictedUser,
  } = useAccountManagement();

  const { data: grants } = useGrants();

  const hasFullAccountAccess =
    grants?.global?.account_access === 'read_write' || !_isRestrictedUser;

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const accountLinks: MenuLink[] = React.useMemo(
    () => [
      {
        display: 'Billing & Contact Information',
        href: '/account/billing',
      },
      // Restricted users can't view the Users tab regardless of their grants
      {
        display: 'Users & Grants',
        href: '/account/users',
        hide: _isRestrictedUser,
      },
      // Restricted users can't view the Transfers tab regardless of their grants
      {
        display: 'Service Transfers',
        href: '/account/service-transfers',
        hide: _isRestrictedUser,
      },
      {
        display: 'Maintenance',
        href: '/account/maintenance',
      },
      // Restricted users with read_write account access can view Settings.
      {
        display: 'Account Settings',
        href: '/account/settings',
        hide: !hasFullAccountAccess,
      },
    ],
    [hasFullAccountAccess, _isRestrictedUser]
  );

  const userName = profile?.username ?? '';

  const renderLink = (menuLink: MenuLink) =>
    menuLink.hide ? null : (
      <Grid xs={12} key={menuLink.display}>
        <Link
          to={menuLink.href}
          className={classes.menuItemLink}
          data-testid={`menu-item-${menuLink.display}`}
          style={{
            display: 'flex',
            paddingTop: 6,
            paddingBottom: 6,
          }}
        >
          {menuLink.display}
        </Link>
      </Grid>
    );

  return (
    <>
      <Tooltip
        title="Profile & Account"
        disableTouchListener
        enterDelay={500}
        leaveDelay={0}
      >
        <Button
          aria-describedby={id}
          variant="contained"
          onClick={handleClick}
          className={classes.menuButton}
        >
          <GravatarByEmail
            email={profile?.email ?? ''}
            className={classes.userWrapper}
          />
          <Hidden mdDown>
            <Typography className={classes.inlineUserName}>
              {userName}
            </Typography>
          </Hidden>
          {open ? (
            <KeyboardArrowUp className={classes.caret} />
          ) : (
            <KeyboardArrowDown className={classes.caret} />
          )}
        </Button>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        data-qa-user-menu
      >
        <Stack spacing={2} paddingY={2} paddingX={3}>
          <Box>
            <div className={classes.userName}>
              <strong>{userName}</strong>
            </div>
          </Box>
          <Box>
            <div className={classes.menuHeader}>My Profile</div>
            <Grid container columnGap={3} flexWrap="nowrap">
              <Grid
                xs={6}
                wrap="nowrap"
                direction="column"
                className={classes.profileWrapper}
              >
                {profileLinks.slice(0, 4).map(renderLink)}
              </Grid>
              <Grid
                xs={6}
                wrap="nowrap"
                direction="column"
                className={classes.profileWrapper}
              >
                {profileLinks.slice(4).map(renderLink)}
              </Grid>
            </Grid>
          </Box>
          <Box>
            {_hasAccountAccess ? (
              <>
                <div className={classes.menuHeader}>Account</div>
                <Stack spacing={1.5} paddingTop={1}>
                  {accountLinks.map((menuLink) =>
                    menuLink.hide ? null : (
                      <Link
                        key={menuLink.display}
                        to={menuLink.href}
                        className={classes.menuItemLink}
                        data-testid={`menu-item-${menuLink.display}`}
                      >
                        {menuLink.display}
                      </Link>
                    )
                  )}
                </Stack>
              </>
            ) : null}
          </Box>
        </Stack>
      </Popover>
    </>
  );
};

export default React.memo(UserMenu);
