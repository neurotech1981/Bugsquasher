import React, { Fragment, useState } from "react";
import auth from "../auth/auth-helper";
import { Link, useLocation } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useReactRouter from "use-react-router";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Badge from "@material-ui/core/Badge";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import MenuIcon from "@material-ui/icons/MenuTwoTone";
import AccountCircle from "@material-ui/icons/AccountCircleTwoTone";
import NotificationsIcon from "@material-ui/icons/NotificationsTwoTone";
import MoreIcon from "@material-ui/icons/MoreVertTwoTone";
import MailIcon from "@material-ui/icons/MailTwoTone";
import Dashboard from "@material-ui/icons/DashboardTwoTone";
import Settings from "@material-ui/icons/SettingsTwoTone";
import CssBaseline from "@material-ui/core/CssBaseline";
import BugIcon from "../../images/bug.svg";
import ExitToAppRoundedIcon from "@material-ui/icons/ExitToAppTwoTone";
import NoteAddRoundedIcon from "@material-ui/icons/NoteAddTwoTone";
import PageviewRoundedIcon from "@material-ui/icons/PageviewTwoTone";
import GroupRoundedIcon from "@material-ui/icons/GroupTwoTone";
//import LogRocket from 'logrocket';
//import setupLogRocketReact from 'logrocket-react';

const drawerWidth = 260;

//const isActive = (history, path) => {
// if (history.location.pathname === path) return { color: '#F44336' }
//  else return { color: '#ffffff' }
//}

const useStyles = makeStyles((theme) => ({
  palette: {
    type: "dark",
  },
  colorPrimary: {
    backgroundColor: "#05386B",
  },
  buttons: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(2),
    alignItems: "center",
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: "0px",
      width: "auto",
    },
  },
  root: {
    display: "flex",
  },
  grow: {
    flexGrow: 1,
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    justifyContent: "flex-end",
  },
  flexContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  hide: {
    display: "none",
  },
  appBar: {
    backgroundColor: "#3B2044",
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      backgroundColor: "#3B2044",
    },
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  fab: {
    margin: theme.spacing(1),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  button: {
    margin: theme.spacing(1),
    "&:hover": {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      backgroundColor: "#FFF00",
      color: "white",
    },
  },
  title: {
    display: "none",
    textShadow: "0 1px 1px rgba(0,0,0,0.25)",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: 200,
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  toolbar: theme.mixins.toolbar,
}));

function NavBar(props) {
  const items = [
    { label: "Dashboard", icon: <Dashboard />, path: !auth.isAuthenticated()
      ? "/landing/"
      : "/landing/" + auth.isAuthenticated().user._id,
    },
    {
      label: "Prosjekt oversikt",
      icon: <PageviewRoundedIcon />,
      /*eslint operator-linebreak: [2, "after", { "overrides": { "?": "ignore", ":": "ignore"} }]*/
      path: !auth.isAuthenticated()
        ? "/prosjekt-oversikt/"
        : "/prosjekt-oversikt/" + auth.isAuthenticated().user._id,
    },
    {
      label: "Opprett prosjekt",
      icon: <NoteAddRoundedIcon />,
      path: !auth.isAuthenticated()
        ? "/opprett-prosjekt/"
        : "/opprett-prosjekt/" + auth.isAuthenticated().user._id,
    },
    {
      label: "Legg til sak",
      icon: <NoteAddRoundedIcon />,
      path: !auth.isAuthenticated()
        ? "/legg-til-sak/"
        : "/legg-til-sak/" + auth.isAuthenticated().user._id,
    },
    {
      label: "Vis saker",
      icon: <PageviewRoundedIcon />,
      path: !auth.isAuthenticated()
        ? "/saker/"
        : "/saker/" + auth.isAuthenticated().user._id,
    },
    {
      label: "Bruker administrasjon",
      icon: <GroupRoundedIcon />,
      path: !auth.isAuthenticated()
        ? "/bruker-admin/"
        : "/bruker-admin/" + auth.isAuthenticated().user._id,
    },
    { label: "Innstillinger", icon: <Settings />, path: "/innstillinger" },
  ];

  const { history } = useReactRouter();
  const location = useLocation()
  const { container } = props;
  //const [mobileOpen, setMobileOpen] = React.useState(false)
  const [open, setOpen] = useState(false);
  //const isActive = (value) => (location.pathname + "/" + auth.isAuthenticated().user._id == value ? true : false)


  // This is an example script - don't forget to change it!
  //LogRocket.init('w0hnhq/bugsquasher')
  //setupLogRocketReact(LogRocket)
  /*LogRocket.identify('5f856c24f8a3b2531facddf9', {
  name: 'Bjørn-Are Jakobsen',
  email: 'ba.jakobsen@gmail.com',

  // Add your own custom user variables here, ie:
  subscriptionType: 'admin'
});*/

  const classes = useStyles();
  const theme = useTheme();
  function handleDrawerToggle() {
    setOpen(!open);
  }

  // function handleDrawerOpen () {
  //   setOpen(true)
  // }

  // function handleDrawerClose () {
  //   setOpen(false)
  // }

  const drawer = (
    <div>
      {auth.isAuthenticated() && (
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.toolbar} />
          <Divider />
          <List>
            {items.map((items, index) => (
              <Link to={items.path} key={index}>
                <ListItem selected={items.path === location.pathname} button key={items.key} to={items.path}>
                  <ListItemIcon>{items.icon}</ListItemIcon>
                  <ListItemText primary={items.label} />
                  {console.log(items.path)}
                </ListItem>
              </Link>
            ))}
          </List>
          <Divider />
        </Drawer>
      )}
    </div>
  );

  const [anchorEl, setAnchorEl] = useState(false);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(false);

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

  const renderMenu = auth.isAuthenticated() && (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem>
        <IconButton color="inherit">
          <Badge badgeContent={4} color="secondary">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem
        component={Link}
        to={"/user/" + auth.isAuthenticated().user._id}
      >
        <IconButton color="inherit">
          <AccountCircle />
        </IconButton>
        <p>Min profil</p>
      </MenuItem>

      <MenuItem
        onClick={() => {
          auth.signout(() => history.push("/signin"));
        }}
      >
        <IconButton color="inherit">
          <ExitToAppRoundedIcon />
        </IconButton>
        <p>Logg ut</p>
      </MenuItem>
    </Menu>
  );

  const renderMobileMenu = auth.isAuthenticated() && (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
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
      <MenuItem onClick={handleMenuClose}>
        <IconButton color="inherit">
          <AccountCircle />
        </IconButton>
        <p>Min profil</p>
      </MenuItem>
      {auth.isAuthenticated() && (
        <MenuItem
          onClose={handleMobileMenuClose}
          onClick={() => {
            auth.signout(() => history.push("/signin"));
          }}
        >
          <IconButton color="inherit">
            <ExitToAppRoundedIcon />
          </IconButton>
          <p>Logg ut</p>
        </MenuItem>
      )}
    </Menu>
  );

  return (
    auth.isAuthenticated() && (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            {auth.isAuthenticated() && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                className={classes.menuButton}
              >
                <MenuIcon />
              </IconButton>
            )}

            <img
              className="svgLogoIcon"
              alt="Logo"
              src={BugIcon}
              type="image/svg+xml"
            />
            <Typography
              className={classes.title}
              variant="h6"
              noWrap
              style={{ fontFamily: "Poppins" }}
            >
              BugSquasher
            </Typography>
            <div className={classes.buttons}>
              {auth.isAuthenticated() && (
                <Fragment>
                  <div className={classes.grow}>
                    <nav className={classes.drawer} aria-label="Issues">
                      <Hidden smUp implementation="css">
                        <Drawer
                          container={container}
                          variant="temporary"
                          anchor={theme.direction === "rtl" ? "right" : "left"}
                          open={open}
                          edge="start"
                          onClose={handleDrawerToggle}
                          classes={{
                            paper: classes.drawerPaper,
                          }}
                          ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                          }}
                        >
                          {drawer}
                        </Drawer>
                      </Hidden>
                      <Hidden xsDown implementation="css">
                        <Drawer
                          classes={{
                            paper: classes.drawerPaper,
                          }}
                          variant="permanent"
                          open
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
    )
  );
}

export default NavBar;
