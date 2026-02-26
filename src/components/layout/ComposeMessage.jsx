import React, { useState, useEffect } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'
import auth from '../auth/auth-helper'
import { getUsers } from '../utils/api-user'
import messageService from '../../services/messageService'

export default function ComposeMessage({ open, onClose, onSent }) {
  const [users, setUsers] = useState([])
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const jwt = auth.isAuthenticated()
  const currentUserId = jwt ? jwt.user._id : null

  useEffect(() => {
    if (open) {
      getUsers({ t: jwt.token }).then((data) => {
        if (data && data.data) {
          setUsers(data.data.filter((u) => u._id !== currentUserId))
        }
      })
      setRecipient('')
      setSubject('')
      setContent('')
      setError('')
    }
  }, [open])

  const handleSend = async () => {
    if (!recipient || !subject.trim() || !content.trim()) {
      setError('Alle felt må fylles ut')
      return
    }

    setSending(true)
    setError('')

    try {
      await messageService.sendMessage(
        { sender: currentUserId, recipient, subject: subject.trim(), content: content.trim() },
        jwt.token
      )
      setSending(false)
      onSent()
    } catch (e) {
      setSending(false)
      setError(e.response?.data?.error || 'Kunne ikke sende melding')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ny melding</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          label="Mottaker"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          margin="normal"
          variant="outlined"
        >
          {users.map((u) => (
            <MenuItem key={u._id} value={u._id}>
              {u.name} ({u.email})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Emne"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          multiline
          minRows={5}
          label="Melding"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          margin="normal"
          variant="outlined"
        />
        {error && (
          <Typography color="error" variant="body2" style={{ marginTop: 8 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>
          Avbryt
        </Button>
        <Button onClick={handleSend} color="primary" variant="contained" disabled={sending}>
          {sending ? 'Sender...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
