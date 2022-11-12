/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useReactRouter from 'use-react-router'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Person from '@material-ui/icons/Person'
import Divider from '@material-ui/core/Divider'
import { Redirect } from 'react-router-dom'
import auth from '../auth/auth-helper'
import { findUserProfile, changePasswordProfile } from '../utils/api-user'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import DeleteUser from './DeleteUser'
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: theme.mixins.gutters({
    maxWidth: '80vh',
    margin: "0 auto",
    padding: theme.spacing(3),
    marginTop: theme.spacing(15),
    borderRadius: '10px',
  }),
  title: {
    margin: `${theme.spacing(3)}px 0 ${theme.spacing(1)}px`,
    fontWeight: 500,
  },
  userInfo: {
    color: 'black !important'
  }
}))

export default function Profile () {
  const { match } = useReactRouter()
  const state = {
    redirectToSignin: false
  }
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(state)
  const [users, setUsers] = useState([])

  const [show, setShow] = React.useState({
    password: '',
    repeatPassword: '',
    showPassword: false,
  });

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
    setValues(state);
  };

  const handleClickShowPassword = () => {
    setShow({ ...show, showPassword: !show.showPassword });
  };

  const handleChange = (prop) => (event) => {
    setShow({ ...show, [prop]: event.target.value });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const init = (userId) => {
    const jwt = auth.isAuthenticated()
    findUserProfile(
      {
        userId
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
    console.log(auth.isAuthenticated().user._id)
    const user = {
      credentials: auth.isAuthenticated().token || undefined,
      _id: auth.isAuthenticated().user._id || undefined,
      password: show.password || undefined,
      passwordConfirm: show.repeatPassword || undefined
    }

    changePasswordProfile(user).then(data => {
      if (data.error) {
        setValues({ error: data.error })
      } else {
        console.log(JSON.stringify(data.message))
        setValues({ message: data.message })
        setOpen(true);
      }
    })
  }

  useEffect(() => {
    init(match.params.userId)
  }, [match.params.userId])

  const classes = useStyles()

  if (!auth.isAuthenticated().user || values.redirectToSignin) {
    return <Redirect to="/signin" />
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
          {auth.isAuthenticated().user &&
            auth.isAuthenticated().user._id === users._id && (
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
<br/>
      <Grid container align="center" xs={12} sm={12} spacing={2}>
        <Grid item align="left" xs={12} sm={6}>
        <InputLabel style={{ margin: "5px" }} htmlFor="new-password">Nytt passord</InputLabel>
          <OutlinedInput
              style={{ width: "100%" }}
              id="new-password"
              type={show.showPassword ? 'text' : 'password'}
              variant="outlined"
              pattern="[0-9a-fA-F]{4,8}"
              onChange={handleChange('password')}
              autocomplete="new-password"
              endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="password-label"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {show.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            />
          </Grid>
          <Grid item align="left" xs={12} sm={6}>
          <InputLabel style={{ margin: "5px" }} htmlFor="repeat-password">Gjenta passord</InputLabel>
          <OutlinedInput
              style={{ width: "100%" }}
              id="repeat-password"
              type={show.showPassword ? 'text' : 'password'}
              variant="outlined"
              pattern="[0-9a-fA-F]{4,8}"
              onChange={handleChange('repeatPassword')}
              autocomplete="new-password"
              endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="password-label"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {show.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            />
          </Grid>
            <Grid  align="right" item xs={12} sm={12}>
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
        <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {values.message}
        </Alert>
      </Snackbar>
    </Paper>
  )
}
