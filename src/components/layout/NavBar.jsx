import React, { Fragment, useState } from 'react'
import auth from '../auth/auth-helper'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { makeStyles, useTheme } from '@mui/styles'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Hidden from '@mui/material/Hidden'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Badge from '@mui/material/Badge'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/MenuTwoTone'
import AccountCircle from '@mui/icons-material/AccountCircleTwoTone'
import NotificationsIcon from '@mui/icons-material/NotificationsTwoTone'
import MoreIcon from '@mui/icons-material/MoreVertTwoTone'
import MailIcon from '@mui/icons-material/MailTwoTone'
import Dashboard from '@mui/icons-material/DashboardTwoTone'
import Settings from '@mui/icons-material/SettingsTwoTone'
import CssBaseline from '@mui/material/CssBaseline'
import BugIcon from '../../images/bug.svg'
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppTwoTone'
import NoteAddRoundedIcon from '@mui/icons-material/NoteAddTwoTone'
import PageviewRoundedIcon from '@mui/icons-material/PageviewTwoTone'
import GroupRoundedIcon from '@mui/icons-material/GroupTwoTone'

const drawerWidth = 260

const useStyles = makeStyles((theme) => ({
    palette: {
        mode: 'dark',
    },
    colorPrimary: {
        backgroundColor: '#05386B',
    },
    buttons: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        marginRight: theme.spacing(2),
        alignItems: 'center',
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: '0px',
            width: 'auto',
        },
    },
    root: {
        display: 'flex',
    },
    grow: {
        flexGrow: 1,
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    drawerPaper: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
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
        backgroundColor: '#3B2044',
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
            backgroundColor: '#3B2044',
        },
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
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    button: {
        margin: theme.spacing(1),
        '&:hover': {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            backgroundColor: '#FFF00',
            color: 'white',
        },
    },
    title: {
        display: 'none',
        textShadow: '0 1px 1px rgba(0,0,0,0.25)',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 7),
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: 200,
        },
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
}))

function NavBar(props) {
    const items = [
        {
            label: 'Dashboard',
            icon: <Dashboard />,
            path: !auth.isAuthenticated() ? '/landing/' : '/landing/',
        },
        {
            label: 'Vis saker',
            icon: <PageviewRoundedIcon />,
            path: !auth.isAuthenticated() ? '/saker/' : '/saker/' + auth.isAuthenticated().user._id,
        },
        {
            label: 'Prosjekt oversikt',
            icon: <PageviewRoundedIcon />,
            path: !auth.isAuthenticated()
                ? '/prosjekt-oversikt/'
                : '/prosjekt-oversikt/' + auth.isAuthenticated().user._id,
        },
        {
            label: 'Opprett prosjekt',
            icon: <NoteAddRoundedIcon />,
            path: !auth.isAuthenticated()
                ? '/opprett-prosjekt/'
                : '/opprett-prosjekt/' + auth.isAuthenticated().user._id,
        },
        {
            label: 'Legg til sak',
            icon: <NoteAddRoundedIcon />,
            path: !auth.isAuthenticated() ? '/legg-til-sak/' : '/legg-til-sak/' + auth.isAuthenticated().user._id,
        },
        {
            label: 'Bruker administrasjon',
            icon: <GroupRoundedIcon />,
            path: !auth.isAuthenticated() ? '/bruker-admin/' : '/bruker-admin/' + auth.isAuthenticated().user._id,
        },
        { label: 'Innstillinger', icon: <Settings />, path: '/innstillinger' },
    ]

    const location = useLocation()
    const navigate = useNavigate()
    const { container } = props
    const [open, setOpen] = useState(false)

    const classes = useStyles()
    const theme = useTheme()

    function handleDrawerToggle() {
        setOpen(!open)
    }

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
                        {items.map((item, index) => (
                            <Link to={item.path} key={index}>
                                <ListItem selected={item.path === location.pathname} button key={index} to={item.path}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItem>
                            </Link>
                        ))}
                    </List>
                    <Divider />
                </Drawer>
            )}
        </div>
    )

    const [anchorEl, setAnchorEl] = useState(null)
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null)

    const isMenuOpen = Boolean(anchorEl)
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

    function handleProfileMenuOpen(event) {
        setAnchorEl(event.currentTarget)
    }

    function handleMobileMenuClose() {
        setMobileMoreAnchorEl(null)
    }

    function handleMenuClose() {
        setAnchorEl(null)
        handleMobileMenuClose()
    }

    function handleMobileMenuOpen(event) {
        setMobileMoreAnchorEl(event.currentTarget)
    }

    const renderMenu = auth.isAuthenticated() && (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem>
                <IconButton color="inherit" size="large">
                    <Badge overlap="rectangular" badgeContent={4} color="secondary">
                        <MailIcon />
                    </Badge>
                </IconButton>
                <p>Messages</p>
            </MenuItem>
            <MenuItem component={Link} to={'/user/' + auth.isAuthenticated().user._id}>
                <IconButton color="inherit" size="large">
                    <AccountCircle />
                </IconButton>
                <p>Min profil</p>
            </MenuItem>

            <MenuItem
                onClick={() => {
                    auth.signout(() => navigate('/signin'))
                }}
            >
                <IconButton color="inherit" size="large">
                    <ExitToAppRoundedIcon />
                </IconButton>
                <p>Logg ut</p>
            </MenuItem>
        </Menu>
    )

    const renderMobileMenu = auth.isAuthenticated() && (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem>
                <IconButton color="inherit" size="large">
                    <Badge overlap="rectangular" badgeContent={4} color="secondary">
                        <MailIcon />
                    </Badge>
                </IconButton>
                <p>Messages</p>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
                <IconButton color="inherit" size="large">
                    <AccountCircle />
                </IconButton>
                <p>Min profil</p>
            </MenuItem>
            {auth.isAuthenticated() && (
                <MenuItem
                    onClose={handleMobileMenuClose}
                    onClick={() => {
                        auth.signout(() => navigate('/signin'))
                    }}
                >
                    <IconButton color="inherit" size="large">
                        <ExitToAppRoundedIcon />
                    </IconButton>
                    <p>Logg ut</p>
                </MenuItem>
            )}
        </Menu>
    )

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
                                size="large"
                            >
                                <MenuIcon />
                            </IconButton>
                        )}

                        <img className="svgLogoIcon" alt="Logo" src={BugIcon} type="image/svg+xml" />
                        <Typography className={classes.title} variant="h6" noWrap style={{ fontFamily: 'Poppins' }}>
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
                                                    anchor={theme.direction === 'rtl' ? 'right' : 'left'}
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
                                            <Hidden xlDown implementation="css">
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
                            <IconButton color="inherit" size="large">
                                <Badge overlap="rectangular" badgeContent={0} color="secondary">
                                    <MailIcon />
                                </Badge>
                            </IconButton>
                            <IconButton color="inherit" size="large">
                                <Badge overlap="rectangular" badgeContent={0} color="secondary">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                            <IconButton
                                edge="end"
                                aria-owns={isMenuOpen ? 'material-appbar' : undefined}
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                color="inherit"
                                size="large"
                            >
                                <AccountCircle />
                            </IconButton>
                        </div>
                        <div className={classes.sectionMobile}>
                            <IconButton
                                aria-haspopup="true"
                                onClick={handleMobileMenuOpen}
                                color="inherit"
                                size="large"
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
    )
}

export default NavBar
