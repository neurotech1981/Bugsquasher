/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import { useParams, useNavigate } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Person from '@mui/icons-material/Person'
import Divider from '@mui/material/Divider'
import auth from '../auth/auth-helper'
import { findUserProfile, changePasswordProfile } from '../utils/api-user'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import SaveIcon from '@mui/icons-material/Save'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import DeleteUser from './DeleteUser'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const useStyles = makeStyles((theme) => ({
    root: theme.mixins.gutters({
        maxWidth: '80vh',
        margin: '0 auto',
        padding: theme.spacing(3),
        marginTop: theme.spacing(15),
        borderRadius: '10px',
    }),
    title: {
        margin: `${theme.spacing(3)} 0 ${theme.spacing(1)}`,
        fontWeight: 500,
    },
    userInfo: {
        color: 'black !important',
    },
}))

export default function Profile(props) {
    const { id } = useParams()
    const navigate = useNavigate()
    const state = {
        redirectToSignin: false,
    }
    const [open, setOpen] = useState(false)
    const [values, setValues] = useState(state)
    const [users, setUsers] = useState([])

    const [show, setShow] = React.useState({
        password: '',
        repeatPassword: '',
        showPassword: false,
    })

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }

        setOpen(false)
        setValues(state)
    }

    const handleClickShowPassword = () => {
        setShow({ ...show, showPassword: !show.showPassword })
    }

    const handleChange = (prop) => (event) => {
        setShow({ ...show, [prop]: event.target.value })
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault()
    }

    const init = () => {
        const jwt = auth.isAuthenticated()
        let userId = auth.isAuthenticated().user._id

        findUserProfile(
            {
                userId,
            },
            { t: jwt.token }
        ).then((data) => {
            if (data.error) {
                setValues({ redirectToSignin: true })
            } else {
                setUsers(data)
            }
        })
    }

    const onSubmit = () => {
        const user = {
            credentials: auth.isAuthenticated().token || undefined,
            _id: auth.isAuthenticated().user._id || undefined,
            password: show.password || undefined,
            passwordConfirm: show.repeatPassword || undefined,
        }

        changePasswordProfile(user).then((data) => {
            if (data.error) {
                setValues({ error: data.error })
            } else {
                setValues({ message: data.message })
                setOpen(true)
            }
        })
    }

    useEffect(() => {
        init()
    }, [id])

    const classes = useStyles()

    if (!auth.isAuthenticated().user || values.redirectToSignin) {
        navigate('/signin')
    }
    return (
        <Paper className={classes.root} elevation={1}>
            <Typography type="title" className={classes.title}>
                Profile info
            </Typography>
            <Divider />
            <List>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar>
                            <Person />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText className={classes.userInfo} primary={users.name} secondary={users.email} />
                    <ListItemText className={classes.userInfo} primary="Rolle" secondary={users.role} />
                    {auth.isAuthenticated().user && auth.isAuthenticated().user._id === users._id && (
                        <ListItemSecondaryAction>
                            <DeleteUser userId={users._id} />
                        </ListItemSecondaryAction>
                    )}
                </ListItem>
            </List>
            <Typography type="title" className={classes.title}>
                Bytt passord
            </Typography>
            <Divider />
            <br />
            <Grid container align="center" xs={12} sm={12} spacing={2}>
                <Grid item align="left" xs={12} sm={6}>
                    <InputLabel style={{ margin: '5px' }} htmlFor="new-password">
                        Nytt passord
                    </InputLabel>
                    <OutlinedInput
                        style={{ width: '100%' }}
                        id="new-password"
                        type={show.showPassword ? 'text' : 'password'}
                        variant="outlined"
                        pattern="[0-9a-fA-F]{4,8}"
                        onChange={handleChange('password')}
                        autoComplete="new-password"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="password-label"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    size="large"
                                >
                                    {show.showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </Grid>
                <Grid item align="left" xs={12} sm={6}>
                    <InputLabel style={{ margin: '5px' }} htmlFor="repeat-password">
                        Gjenta passord
                    </InputLabel>
                    <OutlinedInput
                        style={{ width: '100%' }}
                        id="repeat-password"
                        type={show.showPassword ? 'text' : 'password'}
                        variant="outlined"
                        pattern="[0-9a-fA-F]{4,8}"
                        onChange={handleChange('repeatPassword')}
                        autoComplete="new-password"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="password-label"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    size="large"
                                >
                                    {show.showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </Grid>
                <Grid align="right" item xs={12} sm={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={show.password.length > 0 && show.repeatPassword.length > 0 ? false : true}
                        onClick={onSubmit}
                        className={classes.button}
                        startIcon={<SaveIcon />}
                    >
                        Oppdater passord
                    </Button>
                </Grid>
            </Grid>
            <Snackbar open={open} autohideduration={3000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success">
                    {values.message}
                </Alert>
            </Snackbar>
        </Paper>
    )
}
