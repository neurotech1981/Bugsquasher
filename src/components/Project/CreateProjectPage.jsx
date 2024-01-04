import React, { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Autocomplete,
} from '@mui/material'
import { createProject } from '../../services/projectService'
import { Redirect } from 'react-router-dom'
import { getUsers } from '../utils/api-user'
import auth from '../auth/auth-helper'

const CreateProjectPage = () => {
  const jwt = auth.isAuthenticated()

  const state = {
    redirectToSignin: false,
  }
  const [values, setValues] = useState(state)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [teamMembers, setTeamMembers] = useState([])
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNameChange = (event) => {
    setName(event.target.value)
  }

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
  }

  const handleTeamMembersChange = (event, newTeamMembers) => {
    setTeamMembers(newTeamMembers)
  }

  const handleStatusChange = (event) => {
    setStatus(event.target.value)
  }

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value)
  }

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      console.log('Token: ', jwt.token)
      await createProject({ name, description, teamMembers, status, startDate, endDate }, jwt.token)
      setName('')
      setDescription('')
      setTeamMembers([])
      setStatus('')
      setStartDate('')
      setEndDate('')
      setIsSubmitting(false)
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    getUsers({ t: jwt.token }).then((data) => {
      if (data.error) {
        setValues({ redirectToSignin: true })
      } else {
        setUsers(data.data)
      }
    })
    // fetch users from API or database and set them to state
    //const fetchUsers = async () => {
    //  try {
    //    const response = await fetch('/api/users')
    //    const users = await response.json()
    //    setUsers(users)
    //  } catch (err) {
    //    console.error(err)
    //  }
    //}
    //fetchUsers()
  }, [])

  if (!auth.isAuthenticated().user || values.redirectToSignin) {
    return <Redirect to="/signin" />
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Paper sx={{ p: 3, minWidth: 400, mt: 14 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Create Project
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={handleNameChange}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={description}
            onChange={handleDescriptionChange}
          />
          <Autocomplete
            options={users}
            multiple
            getOptionLabel={(user) => user.name || ''}
            renderInput={(params) => <TextField {...params} label="Team Members" variant="outlined" margin="normal" />}
            value={teamMembers}
            onChange={handleTeamMembersChange}
          />
          <InputLabel id="status-label" sx={{ mt: 2 }}>
            Status
          </InputLabel>
          <Select
            labelId="status-label"
            id="status"
            value={status}
            onChange={handleStatusChange}
            fullWidth
            variant="outlined"
            margin="normal"
          >
            <MenuItem value>
              <em>None</em>
            </MenuItem>
            <MenuItem value="Todo">To do</MenuItem>
            <MenuItem value="In progress">In progress</MenuItem>
            <MenuItem value="Done">Done</MenuItem>
          </Select>
          <TextField
            label="Start Date"
            variant="outlined"
            type="date"
            margin="normal"
            value={startDate}
            onChange={handleStartDateChange}
            sx={{ width: '48%', mr: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="End Date"
            variant="outlined"
            type="date"
            margin="normal"
            value={endDate}
            onChange={handleEndDateChange}
            sx={{ width: '48%' }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting} sx={{ mt: 2 }}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

export default CreateProjectPage
