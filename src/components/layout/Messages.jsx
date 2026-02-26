import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
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
import DraftsIcon from '@material-ui/icons/Drafts'
import MailIcon from '@material-ui/icons/Mail'
import Chip from '@material-ui/core/Chip'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import moment from 'moment'
import auth from '../auth/auth-helper'
import messageService from '../../services/messageService'
import ComposeMessage from './ComposeMessage'

function Alert(props) {
  return <MuiAlert elevation={1} variant="filled" {...props} />
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
  unread: {
    fontWeight: 700,
    backgroundColor: '#f5f5ff',
  },
  read: {
    fontWeight: 400,
  },
  subjectCell: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  dialogContent: {
    minWidth: 400,
    minHeight: 150,
  },
  messageContent: {
    whiteSpace: 'pre-wrap',
    padding: theme.spacing(2),
    backgroundColor: '#fafafa',
    borderRadius: 4,
    marginTop: theme.spacing(1),
  },
  messageMeta: {
    color: '#666',
    marginBottom: theme.spacing(1),
  },
}))

export default function Messages() {
  const classes = useStyles()
  const [tab, setTab] = useState(0)
  const [inbox, setInbox] = useState([])
  const [sent, setSent] = useState([])
  const [composeOpen, setComposeOpen] = useState(false)
  const [viewMessage, setViewMessage] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const jwt = auth.isAuthenticated()
  const userId = jwt ? jwt.user._id : null

  const loadInbox = async () => {
    if (!userId) return
    try {
      const data = await messageService.getInbox(userId, jwt.token)
      if (data.success) setInbox(data.data)
    } catch (e) {
      console.error('Failed to load inbox:', e)
    }
  }

  const loadSent = async () => {
    if (!userId) return
    try {
      const data = await messageService.getSent(userId, jwt.token)
      if (data.success) setSent(data.data)
    } catch (e) {
      console.error('Failed to load sent:', e)
    }
  }

  useEffect(() => {
    loadInbox()
    loadSent()
  }, [])

  const handleOpenMessage = async (msg) => {
    setViewMessage(msg)
    if (!msg.read && msg.recipient._id === userId) {
      try {
        await messageService.markAsRead(msg._id, jwt.token)
        setInbox((prev) => prev.map((m) => (m._id === msg._id ? { ...m, read: true } : m)))
      } catch (e) {
        console.error('Failed to mark as read:', e)
      }
    }
  }

  const handleDelete = async (msgId) => {
    try {
      await messageService.deleteMessage(msgId, userId, jwt.token)
      setInbox((prev) => prev.filter((m) => m._id !== msgId))
      setSent((prev) => prev.filter((m) => m._id !== msgId))
      setViewMessage(null)
      setSnackbar({ open: true, message: 'Melding slettet', severity: 'success' })
    } catch (e) {
      console.error('Failed to delete:', e)
      setSnackbar({ open: true, message: 'Kunne ikke slette melding', severity: 'error' })
    }
  }

  const handleSent = () => {
    setComposeOpen(false)
    setSnackbar({ open: true, message: 'Melding sendt!', severity: 'success' })
    loadInbox()
    loadSent()
  }

  const messages = tab === 0 ? inbox : sent

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav style={{ width: 260, flexShrink: 0 }} />
      <Paper className={classes.paper} elevation={2}>
        <div className={classes.header}>
          <Typography variant="h5">Meldinger</Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setComposeOpen(true)}>
            Ny melding
          </Button>
        </div>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} indicatorColor="primary" textColor="primary">
          <Tab label={`Innboks (${inbox.filter((m) => !m.read).length})`} />
          <Tab label={`Sendt (${sent.length})`} />
        </Tabs>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={30}></TableCell>
                <TableCell>{tab === 0 ? 'Fra' : 'Til'}</TableCell>
                <TableCell>Emne</TableCell>
                <TableCell>Dato</TableCell>
                <TableCell width={50}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="textSecondary" style={{ padding: 24 }}>
                      {tab === 0 ? 'Ingen meldinger i innboksen' : 'Ingen sendte meldinger'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow key={msg._id} className={!msg.read && tab === 0 ? classes.unread : classes.read} hover>
                    <TableCell>
                      {!msg.read && tab === 0 ? (
                        <MailIcon fontSize="small" color="primary" />
                      ) : (
                        <DraftsIcon fontSize="small" color="disabled" />
                      )}
                    </TableCell>
                    <TableCell>{tab === 0 ? msg.sender?.name : msg.recipient?.name}</TableCell>
                    <TableCell className={classes.subjectCell} onClick={() => handleOpenMessage(msg)}>
                      {msg.subject}
                      {!msg.read && tab === 0 && (
                        <Chip size="small" label="Ny" color="primary" style={{ marginLeft: 8, height: 20 }} />
                      )}
                    </TableCell>
                    <TableCell>{moment(msg.createdAt).format('DD.MM.YYYY HH:mm')}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleDelete(msg._id)}>
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

      <Dialog open={!!viewMessage} onClose={() => setViewMessage(null)} maxWidth="sm" fullWidth>
        {viewMessage && (
          <>
            <DialogTitle>{viewMessage.subject}</DialogTitle>
            <DialogContent className={classes.dialogContent}>
              <Typography variant="body2" className={classes.messageMeta}>
                <strong>Fra:</strong> {viewMessage.sender?.name} ({viewMessage.sender?.email})
              </Typography>
              <Typography variant="body2" className={classes.messageMeta}>
                <strong>Til:</strong> {viewMessage.recipient?.name} ({viewMessage.recipient?.email})
              </Typography>
              <Typography variant="body2" className={classes.messageMeta}>
                <strong>Dato:</strong> {moment(viewMessage.createdAt).format('DD.MM.YYYY HH:mm')}
              </Typography>
              <div className={classes.messageContent}>
                <Typography variant="body1">{viewMessage.content}</Typography>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleDelete(viewMessage._id)} color="secondary">
                Slett
              </Button>
              <Button onClick={() => setViewMessage(null)} color="primary">
                Lukk
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ComposeMessage open={composeOpen} onClose={() => setComposeOpen(false)} onSent={handleSent} />

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
