import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Chip from '@material-ui/core/Chip'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'
import { useHistory } from 'react-router-dom'
import auth from '../auth/auth-helper'
import { getUsers } from '../utils/api-user'
import projectService from '../../services/projectService'

function Alert(props) {
  return <MuiAlert elevation={1} variant="filled" {...props} />
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    paddingTop: '80px',
  },
  paper: {
    maxWidth: 700,
    margin: '0 auto',
    padding: theme.spacing(3),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  dateRow: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
}))

export default function CreateProject() {
  const classes = useStyles()
  const history = useHistory()
  const jwt = auth.isAuthenticated()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('Active')
  const [teamMembers, setTeamMembers] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    getUsers({ t: jwt.token }).then((data) => {
      if (data && data.data) setUsers(data.data)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !description.trim() || !startDate || !endDate) {
      setError('Alle felt må fylles ut')
      return
    }

    setSaving(true)
    setError('')

    try {
      await projectService.create(
        {
          name: name.trim(),
          description: description.trim(),
          startDate,
          endDate,
          status,
          teamMembers,
        },
        jwt.token
      )
      setSnackbar({ open: true, message: 'Prosjekt opprettet!', severity: 'success' })
      setTimeout(() => {
        history.push('/prosjekt-oversikt/' + jwt.user._id)
      }, 1000)
    } catch (err) {
      setSaving(false)
      setError(err.response?.data || 'Kunne ikke opprette prosjekt')
    }
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav style={{ width: 260, flexShrink: 0 }} />
      <Paper className={classes.paper} elevation={2}>
        <Typography variant="h5" gutterBottom>
          Opprett prosjekt
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Prosjektnavn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Beskrivelse"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            required
          />
          <div className={classes.dateRow}>
            <TextField
              fullWidth
              type="date"
              label="Startdato"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              type="date"
              label="Sluttdato"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              required
            />
          </div>
          <TextField
            select
            fullWidth
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            variant="outlined"
          >
            <MenuItem value="Active">Aktiv</MenuItem>
            <MenuItem value="Inactive">Inaktiv</MenuItem>
            <MenuItem value="Completed">Fullført</MenuItem>
          </TextField>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="team-label">Teammedlemmer</InputLabel>
            <Select
              labelId="team-label"
              multiple
              value={teamMembers}
              onChange={(e) => setTeamMembers(e.target.value)}
              input={<Input />}
              renderValue={(selected) => (
                <div className={classes.chips}>
                  {selected.map((id) => {
                    const user = users.find((u) => u._id === id)
                    return <Chip key={id} size="small" label={user ? user.name : id} />
                  })}
                </div>
              )}
            >
              {users.map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <div className={classes.actions}>
            <Button variant="outlined" onClick={() => history.goBack()} disabled={saving}>
              Avbryt
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={saving}>
              {saving ? 'Oppretter...' : 'Opprett prosjekt'}
            </Button>
          </div>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}
