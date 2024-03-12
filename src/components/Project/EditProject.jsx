import React, { useState, useEffect } from 'react'
import moment from 'moment'
import axios from 'axios'
import { useHistory, useParams } from 'react-router-dom'
import { Box, TextField, Button, Container, Paper, Grid, Typography, Autocomplete } from '@mui/material'
import { getProject } from '../../services/projectService'
import { getUsers } from '../utils/api-user'
import auth from '../auth/auth-helper'
const statusOptions = ['Todo', 'In progress', 'Done']
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const EditProject = () => {
    const { id } = useParams()
    const history = useHistory()
    const jwt = auth.isAuthenticated()

    const [project, setProject] = useState({
        name: '',
        description: '',
        teamMembers: [],
        status: '',
        startDate: '',
        endDate: '',
    })
    const [setValues] = useState(project)

    const [users, setUsers] = useState([])
    const [teamMembers, setTeamMembers] = useState([])

    const getIssueByID = async (id, token) => {
        getProject({ t: token }, id).then((data) => {
            console.log('Data', data)
            if (data.error) {
                setValues({ redirectToSignin: true })
            } else {
                setProject(data)
                setTeamMembers(data.teamMembers)
            }
        })
    }

    useEffect(() => {
        getIssueByID(id, jwt.token)

        getUsers({ t: jwt.token }).then((data) => {
            if (data.error) {
                setValues({ redirectToSignin: true })
            } else {
                setUsers(data.data)
            }
        })
    }, [id])

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setProject({ ...project, [name]: value })
    }

    const handleTeamMembersChange = (event, value) => {
        setTeamMembers(value)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        axios.put(`/api/projects/${id}`, project).then(() => {
            history.push(`/projects/${id}`)
        })
    }

    return (
        <Container maxWidth="sm">
            <Paper sx={{ p: 3, minWidth: 400, mt: 14 }}>
                <Typography variant="h5" sx={{ mb: 2, p: 3 }}>
                    Edit Project
                </Typography>{' '}
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                name="name"
                                label="Name"
                                variant="outlined"
                                value={project.name}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Description"
                                variant="outlined"
                                value={project.description}
                                onChange={handleInputChange}
                                multiline
                                minRows={4}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                id="team-members"
                                options={users}
                                getOptionLabel={(option) => option.name}
                                value={teamMembers}
                                onChange={handleTeamMembersChange}
                                renderInput={(params) => (
                                    <TextField {...params} label="Team Members" margin="normal" fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DesktopDatePicker
                                    label="Start Date"
                                    inputFormat="DD/MM/YYYY"
                                    value={project.startDate}
                                    onChange={handleInputChange}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DesktopDatePicker
                                    label="End Date"
                                    inputFormat="DD/MM/YYYY"
                                    value={project.endDate}
                                    onChange={handleInputChange}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                id="status"
                                options={statusOptions}
                                value={project.status}
                                onChange={handleInputChange}
                                renderInput={(params) => <TextField {...params} label="Status" />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary">
                                Save
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    )
}

export default EditProject
