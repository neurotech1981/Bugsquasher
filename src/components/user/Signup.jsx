import React, { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Icon from '@mui/material/Icon'
import { makeStyles } from '@mui/styles'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import DialogContent from '@mui/material/DialogContent'
import Dialog from '@mui/material/Dialog'
import { Link } from 'react-router-dom'
import { registerUser } from '../utils/api-user'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: 600,
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(15),
    paddingBottom: theme.spacing(2),
  },
  error: {
    verticalAlign: 'middle',
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.openTitle,
  },
  textField: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: 300,
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
  },
}))

export default function Signup() {
  const initialState = {
    name: '',
    password: '',
    passwordConfirmation: '',
    email: '',
    open: false,
    error: '',
  }

  const [values, setValues] = useState(initialState)

  const history = useHistory()
  const goHome = () => {
    history.push('/signin')
  }

  const handleChange = (name) => (event) => {
    setValues({
      ...values,
      [name]: event.target.value,
    })
  }

  const clickSubmit = () => {
    const user = {
      name: values.name || undefined,
      email: values.email || undefined,
      password: values.password || undefined,
      passwordConfirmation: values.passwordConfirmation || undefined,
    }
    registerUser(user).then((data) => {
      if (data.error) {
        setValues({ error: data.error })
      } else {
        setValues({ error: '', open: true })
      }
    })
  }

  const classes = useStyles()

  return (
    <div>
      <Card className={classes.card}>
        <CardContent>
          <Typography type="headline" variant="h3" gutterBottom className={classes.title}>
            Registrer bruker
          </Typography>
          <TextField
            autoComplete="off"
            id="name"
            type="text"
            label="Navn"
            className={classes.textField}
            value={values.name}
            onChange={handleChange('name')}
            margin="normal"
            variant="outlined"
          />
          <br />
          <TextField
            autoComplete="off"
            id="email"
            type="email"
            label="E-Post"
            className={classes.textField}
            value={values.email}
            onChange={handleChange('email')}
            margin="normal"
            variant="outlined"
          />
          <br />
          <TextField
            id="password"
            type="password"
            label="Passord"
            className={classes.textField}
            value={values.password}
            onChange={handleChange('password')}
            margin="normal"
            autocomplete="new-password"
            variant="outlined"
          />
          <TextField
            autoComplete="new-password"
            id="passwordConfirmation"
            type="password"
            label="Gjenta passord"
            className={classes.textField}
            value={values.passwordConfirmation}
            onChange={handleChange('passwordConfirmation')}
            margin="normal"
            variant="outlined"
          />
          <br />{' '}
          {values.error && (
            <Typography component="p" color="error">
              <Icon color="error" className={classes.error}>
                error
              </Icon>
              {values.error}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <Button color="primary" variant="contained" onClick={() => clickSubmit()} className={classes.submit}>
            Registrer bruker
          </Button>
          <Button variant="contained" onClick={goHome} className={classes.submit}>
            Gå tilbake
          </Button>
        </CardActions>
      </Card>
      <Dialog open={values.open}>
        <DialogTitle>Ny bruker</DialogTitle>
        <DialogContent>
          <DialogContentText>Ny bruker lagt til.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Link to="/signin">
            <Button color="primary" variant="contained" autoFocus="autoFocus">
              Logg inn
            </Button>
          </Link>
        </DialogActions>
      </Dialog>
    </div>
  )
}
