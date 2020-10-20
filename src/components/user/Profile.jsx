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
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Person from '@material-ui/icons/Person'
import Divider from '@material-ui/core/Divider'
import { Redirect } from 'react-router-dom'
import auth from '../auth/auth-helper'
import { findUserProfile } from '../utils/api-user'

import DeleteUser from './DeleteUser'

const useStyles = makeStyles((theme) => ({
  root: theme.mixins.gutters({
    maxWidth: 600,
    margin: 'auto',
    padding: theme.spacing(3),
    marginTop: theme.spacing(15),
    borderRadius: '15px',
  }),
  title: {
    margin: `${theme.spacing(3)}px 0 ${theme.spacing(2)}px`,
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

  const [values, setValues] = useState(state)
  const [users, setUsers] = useState([])

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

  useEffect(() => {
    init(match.params.userId)
  }, [match.params.userId])

  const classes = useStyles()

  if (!auth.isAuthenticated().user || values.redirectToSignin) {
    return <Redirect to="/signin" />
  }
  return (
    <Paper className={classes.root} elevation={4}>
      <Typography type="title" className={classes.title}>
        Profile
      </Typography>
      <List>
        <ListItem button>
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
        <Divider />
      </List>
    </Paper>
  )
}
