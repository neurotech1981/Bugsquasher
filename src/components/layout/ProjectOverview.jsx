import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import Chip from '@material-ui/core/Chip'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import moment from 'moment'
import { Link } from 'react-router-dom'
import auth from '../auth/auth-helper'
import projectService from '../../services/projectService'

function Alert(props) {
  return <MuiAlert elevation={1} variant="filled" {...props} />
}

const statusColors = {
  Active: 'primary',
  Inactive: 'default',
  Completed: 'secondary',
}

const statusLabels = {
  Active: 'Aktiv',
  Inactive: 'Inaktiv',
  Completed: 'Fullført',
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    paddingTop: '80px',
  },
  paper: {
    maxWidth: 1000,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  nameCell: {
    cursor: 'pointer',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}))

export default function ProjectOverview() {
  const classes = useStyles()
  const [projects, setProjects] = useState([])
  const [deleteId, setDeleteId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const jwt = auth.isAuthenticated()

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll(jwt.token)
      setProjects(data)
    } catch (e) {
      console.error('Failed to load projects:', e)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDelete = async () => {
    try {
      await projectService.remove(deleteId, jwt.token)
      setDeleteId(null)
      setSnackbar({ open: true, message: 'Prosjekt slettet', severity: 'success' })
      loadProjects()
    } catch (e) {
      setSnackbar({ open: true, message: 'Kunne ikke slette prosjekt', severity: 'error' })
    }
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav style={{ width: 260, flexShrink: 0 }} />
      <Paper className={classes.paper} elevation={2}>
        <div className={classes.header}>
          <Typography variant="h5">Prosjekt oversikt</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to={'/opprett-prosjekt/' + jwt.user._id}
          >
            Nytt prosjekt
          </Button>
        </div>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Navn</TableCell>
                <TableCell>Beskrivelse</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>Slutt</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Medlemmer</TableCell>
                <TableCell width={50}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary" style={{ padding: 24 }}>
                      Ingen prosjekter opprettet ennå
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell className={classes.nameCell}>{p.name}</TableCell>
                    <TableCell>
                      {p.description?.substring(0, 60)}
                      {p.description?.length > 60 ? '...' : ''}
                    </TableCell>
                    <TableCell>{moment(p.startDate).format('DD.MM.YYYY')}</TableCell>
                    <TableCell>{moment(p.endDate).format('DD.MM.YYYY')}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={statusLabels[p.status] || p.status}
                        color={statusColors[p.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell>{p.teamMembers?.length || 0}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setDeleteId(p._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Slett prosjekt</DialogTitle>
        <DialogContent>
          <DialogContentText>Er du sikker på at du vil slette dette prosjektet?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color="primary" variant="contained">
            Ja
          </Button>
          <Button onClick={() => setDeleteId(null)} variant="outlined">
            Nei
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}
