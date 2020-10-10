/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useReactRouter from 'use-react-router'
import Paper from '@material-ui/core/Paper'
import MaterialTable from 'material-table'
import axios from 'axios'
import TextField from '@material-ui/core/TextField'
import { registerUser, getUsers, findUserProfile } from '../utils/api-user'
import auth from '../auth/auth-helper'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '70%',
    marginTop: theme.spacing(12),
    marginLeft: 290,
    overflowX: 'auto',
    borderRadius: 14
  },
  table: {
    minWidth: 500
  },
  tableWrapper: {
    maxHeight: 900,
    overflow: 'auto'
  },
  label: {
    display: 'inline',
    padding: '.2em .6em .3em',
    fontSize: '75%',
    fontWeight: 700,
    lineHeight: 1,
    backgroundColor: 'lightblue',
    color: '#000',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'baseline',
    borderRadius: '.25em'
  }
}))

export default function Users (props) {
  const [userList] = useState({
    columns: [
      { title: 'ID', field: '_id', editable: 'never' },
      {
        title: 'Navn',
        field: 'name',
        editable: 'always',
        editComponent: (props) => (
          <TextField
            type="text"
            variant="outlined"
            // eslint-disable-next-line react/destructuring-assignment
            value={props.value}
            size="small"
            onChange={(e) => props.onChange(e.target.value)}
          />
        )
      },
      {
        title: 'Rolle',
        field: 'role',
        editable: 'always',
        lookup: { bruker: 'bruker', admin: 'admin' }
      },
      {
        title: 'Rettigheter',
        field: 'rights',
        editable: 'always',
        lookup: { les: 'les', Skriv: 'skriv' }
      },
      {
        title: 'E-Post',
        field: 'email',
        editable: 'always',
        editComponent: (props) => (
          <TextField
            type="text"
            variant="outlined"
            // eslint-disable-next-line react/destructuring-assignment
            value={props.value}
            size="small"
            onChange={(e) => props.onChange(e.target.value)}
          />
        )
      },
      {
        title: 'Endre passord',
        field: 'password',
        editable: 'always',
        editComponent: (props) => (
          <TextField
            type="password"
            variant="outlined"
            size="small"
            onChange={(e) => props.onChange(e.target.value)}
          />
        )
      }
    ]
  })

  const { match } = useReactRouter()
  const state = {
    redirectToSignin: false
  }

  // eslint-disable-next-line no-unused-vars
  const [values, setValues] = useState(state)
  const [users, setUsers] = useState([])
  const [myself, setMyself] = useState([])

  const init = (userId) => {
    const jwt = auth.isAuthenticated();
    findUserProfile(
      {
        userId: userId,
      },
      { t: jwt.token }
    ).then((myself) => {
      if (myself.error) {
        setValues({ redirectToSignin: true });
      } else {
        setMyself(myself);
      }
    });

    getUsers({ t: jwt.token }).then((data) => {
      if (data.error) {
        setValues({ redirectToSignin: true })
      } else {
        setUsers(data.data)
      }
    });
  }

  useEffect(() => {
    if (!users.length) {
      init(match.params.userId)
    }
  }, [match.params.userId])

  // Slett bruker
  const deleteFromDB = (idTodelete) => {
    axios.delete('/api/removeUser', {
      data: {
        _id: idTodelete
      },
    })
    init(match.params.userId)
  }

  // Rediger bruker
  const updateUser = (idToBeUpdated, _name, _role, _rights, _email) => {
    console.log('Role bruker: ', myself.role)
    axios.post('/api/edituser', {
      _id: idToBeUpdated,
      role: myself.role,
      update: {
        name: _name,
        role: _role,
        rights: _rights,
        email: _email
      }
    })
  }

  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <React.Fragment key="key">
          <MaterialTable
            options={{
              headerStyle: {
                backgroundColor: '#48305F',
                color: '#FFF'
              },
              rowStyle: {
                boxShadow: '0 3px 5px rgba(51, 51, 51, 0.1)'
              }
            }}
            title="Bruker administrasjon"
            columns={userList.columns}
            data={users}
            editable={{
              onRowAdd: (newData) => new Promise((resolve, reject) => {
                setTimeout(() => {
                  {
                    const user = {
                      name: newData.name || undefined,
                      email: newData.email || undefined,
                      password: newData.password || undefined
                    }
                    registerUser(user).then((data) => {
                      if (data.error) {
                        setValues({ error: data.error })
                      } else {
                        setValues({ error: '', open: true })
                      }
                    })
                  }
                  init()
                  resolve(newData)
                  reject(new Error('Noe gikk galt!'))
                }, 1000)
              }),
              onRowUpdate: (newData, oldData) => new Promise((resolve, reject) => {
                setTimeout(() => {
                  {
                    const data = users
                    console.log('Users: ', data)
                    const index = data.indexOf(oldData)
                    data[index] = newData
                    console.log('data: ', data[index])
                    setUsers(data)
                    updateUser(
                      data[index]._id,
                      data[index].name,
                      data[index].role,
                      data[index].rights,
                      data[index].email
                    )
                  }
                  init(match.params.userId)
                  console.log('Update user: ', newData)
                  resolve(newData)
                  reject(new Error('Noe gikk galt!'))
                }, 1000)
              }),
              onRowDelete: (oldData) => new Promise((resolve) => {
                setTimeout(() => {
                  {
                    const data = users
                    const index = data.indexOf(oldData)
                    deleteFromDB(data[index]._id)
                  }
                  init(match.params.userId)
                  resolve()
                }, 1000)
              })
            }}
          />
        </React.Fragment>
      </div>
    </Paper>
  )
}
