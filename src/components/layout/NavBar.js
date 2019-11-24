import React, { Fragment, useState, useEffect } from 'react';
import auth from '../auth/auth-helper';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useReactRouter from 'use-react-router';
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import List from "@material-ui/core/List";
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { fade } from '@material-ui/core/styles/colorManipulator';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MailIcon from "@material-ui/icons/Mail";
import { BugReport, Dashboard, Settings } from "@material-ui/icons";
import PersonAddRoundedIcon from '@material-ui/icons/PersonAddRounded';

import AddIssue from "@material-ui/icons/NoteAdd";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import VpnKeyRoundedIcon from '@material-ui/icons/VpnKeyRounded';
import ViewListTwoToneIcon from '@material-ui/icons/ViewListTwoTone';

const drawerWidth = 240;

const isActive = (history, path) => {
	if (history.location.pathname == path) return { color: '#F44336' };
	else return { color: '#ffffff' };
};

const useStyles = makeStyles(theme => ({
  palette: {
    type: "dark",
  },
  buttons: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(2),
    alignItems: "center",
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: "20px",
      width: 'auto',
    },
  },
  root: {
    display: "flex"
  },
  grow: {
    flexGrow: 1,
  },
    drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  flexContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hide: {
    display: 'none',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  fab: {
    margin: theme.spacing(1)
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "inline"
    }
  },
  button: {
    margin: theme.spacing(1),
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block"
    }
  },
  inputRoot: {
    color: "inherit"
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: 200
    }
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex"
    }
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  },
  toolbar: theme.mixins.toolbar
}));

const items = [
  { label: "Min oversikt", icon: <Dashboard />, path: "/" },
  { label: "Vis saker", icon: <BugReport />, path: "/saker" },
  { label: "Brukere", icon: <MailIcon />, path: "/brukere" },
  { label: "Innstillinger", icon: <Settings />, path: "/innstillinger" }
];

function NavBar(props) {
    const { history, location, match } = useReactRouter();
    const { container } = props;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    
    const classes = useStyles();
    const theme = useTheme();
    function handleDrawerToggle() {
      setOpen(!open);
    }
   
  function handleDrawerOpen() {
    setOpen(true);
  }

  function handleDrawerClose() {
    setOpen(false);
  }

    const drawer = (
      <div>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper
          }}
        >
          <div className={classes.toolbar} />
          <Divider />
          <List>
            {items.map((items, index) => (
              <Link to={items.path} key={index}>
                <ListItem button key={items.key} to={items.path}>
                  <ListItemIcon>{items.icon}</ListItemIcon>
                  <ListItemText primary={items.label} />
                </ListItem>
              </Link>
            ))}
          </List>
          <Divider />
        </Drawer>
      </div>
    );


  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  
  function handleProfileMenuOpen(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleMobileMenuClose() {
    setMobileMoreAnchorEl(null);
  }

  function handleMenuClose() {
    setAnchorEl(null);
    handleMobileMenuClose();
  }

  function handleMobileMenuOpen(event) {
    setMobileMoreAnchorEl(event.currentTarget);
  }

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton color="inherit">
          <Badge badgeContent={4} color="secondary">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton color="inherit">
          <Badge badgeContent={11} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton color="inherit">
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar
        position="fixed"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(124, 47, 99) 0%, rgb(31, 39, 57) 100%)"
        }}
      >
        <Toolbar>
          {auth.isAuthenticated() && (
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={clsx(classes.menuButton, open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="svgLogoIcon"
          >
            <path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z" />
          </svg>{" "}
          <Typography
            className={classes.title}
            variant="h6"
            noWrap
            style={{ fontFamily: "Lobster" }}
          >
            Bug Squasher
          </Typography>
          <div className={classes.buttons}>
            {!auth.isAuthenticated() && (
              <span>
                <Link to="/signup">
                  <Button
                    color="primary"
                    variant="outlined"
                    style={{ color: "white" }}
                    aria-label="Registrer bruker"
                    className={classes.button}
                  >
                    <PersonAddRoundedIcon className={classes.extendedIcon} />
                    Registrer bruker
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button
                    color="primary"
                    variant="outlined"
                    style={{ color: "white" }}
                    aria-label="Logg inn"
                    className={classes.button}
                  >
                    <VpnKeyRoundedIcon className={classes.extendedIcon} />
                    Logg inn
                  </Button>
                </Link>
              </span>
            )}
            {auth.isAuthenticated() && (
              <Fragment>
                <div className={classes.grow}>
                  <Link to={"/legg-til-sak/" + auth.isAuthenticated().user._id}>
                    <Button
                      color="primary"
                      variant="contained"
                      aria-label="Legg til sak"
                      className={classes.button}
                    >
                      <AddIssue className={classes.extendedIcon} />
                      Legg til sak
                    </Button>
                  </Link>
                  <Link to={"/saker/" + auth.isAuthenticated().user._id}>
                    <Button
                      color="primary"
                      variant="contained"
                      aria-label="Bruker Profil"
                      className={classes.button}
                    >
                      <ViewListTwoToneIcon className={classes.extendedIcon} />
                      Vis saker
                    </Button>
                  </Link>
                  <Link to={"/user/" + auth.isAuthenticated().user._id}>
                    <Button
                      color="primary"
                      variant="contained"
                      aria-label="Bruker Profil"
                      className={classes.button}
                    >
                      <AccountCircle className={classes.extendedIcon} />
                      Min profil
                    </Button>
                  </Link>
                  <Link to={"/"}>
                    <Button
                      color="secondary"
                      variant="contained"
                      aria-label="Legg til sak"
                      className={classes.button}
                      onClick={() => {
                        auth.signout(() => history.push("/"));
                      }}
                    >
                      <ExitToAppIcon className={classes.extendedIcon} />
                      Logg ut
                    </Button>
                  </Link>
                  <nav className={classes.drawer} aria-label="Issues">
                    {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                    <Hidden smUp implementation="css">
                      <Drawer
                        container={container}
                        variant="temporary"
                        anchor={theme.direction === "rtl" ? "right" : "left"}
                        open={open}
                        onClose={handleDrawerToggle}
                        classes={{
                          paper: classes.drawerPaper
                        }}
                        ModalProps={{
                          keepMounted: true // Better open performance on mobile.
                        }}
                      >
                        {drawer}
                      </Drawer>
                    </Hidden>
                  </nav>
                </div>
              </Fragment>
            )}
          </div>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton color="inherit">
              <Badge badgeContent={0} color="secondary">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <Badge badgeContent={0} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              edge="end"
              aria-owns={isMenuOpen ? "material-appbar" : undefined}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMenu}
      {renderMobileMenu}
    </div>
  );
}

export default NavBar;
