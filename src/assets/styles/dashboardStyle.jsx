import { successColor, whiteColor, grayColor, hexToRgb } from '../js/material-dashboard-react.js'

const drawerWidth = 240

const dashboardStyle = (theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        margin: '0 auto',
        top: '75px',
        /*left: '42px',*/
        position: 'relative',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    container: {
        display: 'grid',
        flexWrap: 'wrap',
        height: '100%',
        [theme.breakpoints.up('sm')]: {
            maxWidth: '100%',
            width: '100%',
        },
    },
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        height: 140,
        width: 140,
        color: theme.palette.text.secondary,
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
        },
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    successText: {
        color: successColor[0],
    },
    upArrowCardCategory: {
        width: '16px',
        height: '16px',
    },
    stats: {
        color: grayColor[0],
        display: 'inline-flex',
        fontSize: '12px',
        lineHeight: '22px',
        '& svg': {
            top: '4px',
            width: '16px',
            height: '16px',
            position: 'relative',
            marginRight: '3px',
            marginLeft: '3px',
        },
        '& .fab,& .fas,& .far,& .fal,& .material-icons': {
            top: '4px',
            fontSize: '16px',
            position: 'relative',
            marginRight: '3px',
            marginLeft: '3px',
        },
    },
    cardCategory: {
        color: grayColor[0],
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        paddingTop: '10px',
        marginBottom: '0',
    },
    cardCategoryWhite: {
        color: 'rgba(' + hexToRgb(whiteColor) + ',.62)',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
    cardTitle: {
        color: grayColor[2],
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
        '& small': {
            color: grayColor[1],
            fontWeight: '400',
            lineHeight: '1',
        },
    },
    cardTitleWhite: {
        color: whiteColor,
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
        '& small': {
            color: grayColor[1],
            fontWeight: '400',
            lineHeight: '1',
        },
    },
})

export default dashboardStyle
