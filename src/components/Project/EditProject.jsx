import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon,
    Edit as EditIcon,
    Group as GroupIcon,
    Save as SaveIcon,
    Settings as SettingsIcon,
    Title as TitleIcon,
} from '@mui/icons-material'
import { getProject } from '../../services/projectService'
import { getUsers } from '../utils/api-user'
import auth from '../auth/auth-helper'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { updateProject } from '../../services/projectService'

const statusOptions = [
    { value: 'Todo', label: '📋 Å gjøre', color: '#F79B72' },
    { value: 'In progress', label: '⚡ Pågår', color: '#e8895f' },
    { value: 'Done', label: '✅ Ferdig', color: '#2A4759' }
]

const EditProject = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const jwt = auth.isAuthenticated()

    const [project, setProject] = useState({
        name: '',
        description: '',
        teamMembers: [],
        status: '',
        startDate: null,
        endDate: null,
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [dataFetched, setDataFetched] = useState(false)

    // Fetch project data - using useCallback to avoid recreation on every render
    const fetchProjectData = useCallback(async () => {
        try {
            const projectData = await getProject({ t: jwt.token }, id)
            if (projectData.error) {
                throw new Error(projectData.error)
            }

            // Extract the actual project data
            const actualProjectData = projectData.data || projectData

            // Convert dates to dayjs objects if they exist
            const formattedProject = {
                ...actualProjectData,
                startDate: actualProjectData.startDate ? dayjs(actualProjectData.startDate) : null,
                endDate: actualProjectData.endDate ? dayjs(actualProjectData.endDate) : null,
            }

            setProject(formattedProject)
            return true
        } catch (err) {
            console.error('Error fetching project:', err)
            setError('Kunne ikke laste prosjektdata')
            return false
        }
    }, [id, jwt.token])

    // Fetch users data - using useCallback to avoid recreation on every render
    const fetchUsersData = useCallback(async () => {
        try {
            const userData = await getUsers({ t: jwt.token })
            if (userData.error) {
                throw new Error(userData.error)
            }

            // Extract the actual users data
            const actualUsersData = userData.data || []
            setUsers(actualUsersData)
            return true
        } catch (err) {
            console.error('Error fetching users:', err)
            setError('Kunne ikke laste brukerdata')
            return false
        }
    }, [jwt.token])

    // Combined data fetching effect - only runs once
    useEffect(() => {
        if (!dataFetched && jwt && jwt.token) {
            const fetchData = async () => {
                setLoading(true)

                try {
                    // Execute both data fetches
                    const [projectSuccess, usersSuccess] = await Promise.all([fetchProjectData(), fetchUsersData()])

                    // Mark data as fetched to prevent refetching
                    setDataFetched(true)

                    // If either fetch failed, redirect to signin
                    if (!projectSuccess || !usersSuccess) {
                        navigate('/signin')
                    }
                } catch (err) {
                    console.error('Error in data fetching:', err)
                    setError('Kunne ikke laste nødvendige data')
                } finally {
                    setLoading(false)
                }
            }

            fetchData()
        }
    }, [dataFetched, fetchProjectData, fetchUsersData, jwt, navigate])

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setProject((prevProject) => ({
            ...prevProject,
            [name]: value,
        }))
    }

    const handleTeamMembersChange = (event, newValue) => {
        setProject((prevProject) => ({
            ...prevProject,
            teamMembers: newValue,
        }))
    }

    const handleStartDateChange = (date) => {
        setProject((prevProject) => ({
            ...prevProject,
            startDate: date,
        }))
    }

    const handleEndDateChange = (date) => {
        setProject((prevProject) => ({
            ...prevProject,
            endDate: date,
        }))
    }

    const handleStatusChange = (event, newValue) => {
        setProject((prevProject) => ({
            ...prevProject,
            status: newValue?.value || newValue,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        try {
            // Prepare data for submission
            const submissionData = {
                name: project.name,
                description: project.description,
                status: project.status,
                startDate: project.startDate ? project.startDate.toISOString() : null,
                endDate: project.endDate ? project.endDate.toISOString() : null,
                teamMembers: project.teamMembers.map((member) =>
                    typeof member === 'object' && member._id ? member._id : member
                ),
            }

            // Preserve existing assignedTeams if it's an array and correctly formatted,
            // otherwise, don't send it or send an empty array if appropriate.
            if (Array.isArray(project.assignedTeams)) {
                submissionData.assignedTeams = project.assignedTeams.map(assignment => {
                    const teamId = assignment.team?._id || assignment.team;
                    if (!teamId) {
                        // Skip assignment if team ID is invalid to prevent errors
                        // Or handle this case more gracefully depending on requirements
                        console.warn('Skipping assignment with invalid team ID:', assignment);
                        return null;
                    }
                    return {
                        team: teamId,
                        role: assignment.role,
                        ...(assignment._id && { _id: assignment._id }),
                        ...(assignment.assignedAt && { assignedAt: assignment.assignedAt }),
                    };
                }).filter(assignment => assignment !== null); // Filter out skipped assignments
            } else if (project.hasOwnProperty('assignedTeams')) {
                // If assignedTeams exists but is not an array (e.g., the corrupted object),
                // send an empty array or handle as an error. Sending empty array might clear existing.
                // Or, choose to not send 'assignedTeams' at all if it's malformed.
                // For now, let's log a warning and not send it if it's not an array but exists.
                console.warn("project.assignedTeams is not an array, not including in update:", project.assignedTeams);
                // delete submissionData.assignedTeams; // Option: omit if malformed
            }
            // If project.assignedTeams was undefined, it won't be in submissionData unless explicitly added above.

            // Submit the update using the project service
            const response = await updateProject(id, submissionData, jwt.token)
            if (response.error) {
                throw new Error(response.error)
            }

            // Navigate to project view page
            navigate('/prosjekt-oversikt')
        } catch (err) {
            console.error('Error updating project:', err)
            setError('Kunne ikke oppdatere prosjektet. Prøv igjen.')
        }
    }

    const goBack = () => {
        navigate('/prosjekt-oversikt')
    }

    // Form field styling
    const fieldStyling = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
                borderColor: '#F79B72',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#F79B72',
                borderWidth: 2,
            },
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: '#F79B72',
        },
    }

    if (loading) {
        return (
            <Box sx={{
                marginLeft: { xs: 0, sm: '288px' },
                marginTop: { xs: '72px', sm: '80px' },
                width: { xs: '100%', sm: 'calc(100% - 288px)' },
                minHeight: { xs: 'calc(100vh - 72px)', sm: 'calc(100vh - 80px)' },
                bgcolor: '#EEEEEE',
                p: { xs: 2, md: 3 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center', maxWidth: 400 }}>
                    <CircularProgress sx={{ color: '#F79B72', mb: 3 }} size={56} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Laster prosjektdata...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vennligst vent mens vi henter prosjektinformasjon
                    </Typography>
                </Paper>
            </Box>
        )
    }

    return (
        <Box sx={{
            marginLeft: { xs: 0, sm: '288px' },
            marginTop: { xs: '72px', sm: '80px' },
            width: { xs: '100%', sm: 'calc(100% - 288px)' },
            minHeight: { xs: 'calc(100vh - 72px)', sm: 'calc(100vh - 80px)' },
            bgcolor: '#EEEEEE',
            p: { xs: 2, md: 3 }
        }}>
            {/* Header Section */}
            <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton
                        size="medium"
                        onClick={goBack}
                        sx={{
                            color: '#F79B72',
                            '&:hover': {
                                bgcolor: 'rgba(247, 155, 114, 0.08)',
                                transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <EditIcon sx={{ color: '#F79B72', fontSize: 28, mr: 1 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography
                            variant="h5"
                            component="h1"
                            fontWeight="600"
                            sx={{
                                color: '#2A4759',
                                fontSize: { xs: '1.5rem', md: '1.75rem' },
                                lineHeight: 1.3,
                                mb: 0.5
                            }}
                        >
                            Rediger prosjekt
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Oppdater prosjektdetaljer og team medlemmer
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ px: 0 }}>
                <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <CardContent sx={{ p: 0 }}>
                        {error && (
                            <Box sx={{ p: 4, pb: 0 }}>
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            </Box>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ p: { xs: 3, md: 5 } }}>
                                <Grid container spacing={4}>
                                    {/* Basic Information Section */}
                                    <Grid item xs={12}>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                            <TitleIcon sx={{ color: '#F79B72', fontSize: 28 }} />
                                            <Typography variant="h6" fontWeight="600" color="#2A4759">
                                                Grunnleggende informasjon
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 4, borderColor: 'rgba(247, 155, 114, 0.2)' }} />
                                    </Grid>

                                    {/* Project Name */}
                                    <Grid item xs={12} md={8}>
                                        <TextField
                                            name="name"
                                            label="Prosjektnavn"
                                            variant="outlined"
                                            value={project.name || ''}
                                            onChange={handleInputChange}
                                            fullWidth
                                            required
                                            sx={fieldStyling}
                                        />
                                    </Grid>

                                    {/* Status */}
                                    <Grid item xs={12} md={4}>
                                        <Autocomplete
                                            id="status"
                                            options={statusOptions}
                                            getOptionLabel={(option) => option.label || option}
                                            value={statusOptions.find(option => option.value === project.status) || null}
                                            onChange={handleStatusChange}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Status"
                                                    fullWidth
                                                    sx={fieldStyling}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <Box component="li" {...props} sx={{ gap: 1 }}>
                                                    <Chip
                                                        label={option.label}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: option.color,
                                                            color: 'white',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        />
                                    </Grid>

                                    {/* Description */}
                                    <Grid item xs={12}>
                                        <TextField
                                            name="description"
                                            label="Beskrivelse"
                                            variant="outlined"
                                            value={project.description || ''}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={4}
                                            fullWidth
                                            sx={fieldStyling}
                                            placeholder="Skriv en detaljert beskrivelse av prosjektet..."
                                        />
                                    </Grid>

                                    {/* Team Section */}
                                    <Grid item xs={12} sx={{ pt: 4 }}>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                            <GroupIcon sx={{ color: '#F79B72', fontSize: 28 }} />
                                            <Typography variant="h6" fontWeight="600" color="#2A4759">
                                                Team sammensetning
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 4, borderColor: 'rgba(247, 155, 114, 0.2)' }} />
                                    </Grid>

                                    {/* Team Members */}
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            multiple
                                            id="team-members"
                                            options={users}
                                            getOptionLabel={(option) => `${option.name} (${option.email})`}
                                            isOptionEqualToValue={(option, value) => option._id === (value._id || value)}
                                            value={project.teamMembers || []}
                                            onChange={handleTeamMembersChange}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Team medlemmer"
                                                    fullWidth
                                                    placeholder="Velg team medlemmer..."
                                                    sx={fieldStyling}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        variant="outlined"
                                                        label={option.name}
                                                        {...getTagProps({ index })}
                                                        key={option._id || index}
                                                        sx={{
                                                            borderColor: '#F79B72',
                                                            color: '#F79B72',
                                                            bgcolor: 'rgba(247, 155, 114, 0.08)',
                                                            fontWeight: 500,
                                                            '& .MuiChip-deleteIcon': {
                                                                color: '#F79B72',
                                                                '&:hover': {
                                                                    color: '#e8895f',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                ))
                                            }
                                            renderOption={(props, option) => (
                                                <li {...props} key={option._id}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                                        <Box sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: '50%',
                                                            bgcolor: '#F79B72',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            {option.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body1" fontWeight={500}>
                                                                {option.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {option.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </li>
                                            )}
                                        />
                                    </Grid>

                                    {/* Timeline Section */}
                                    <Grid item xs={12} sx={{ pt: 4 }}>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                            <CalendarIcon sx={{ color: '#F79B72', fontSize: 28 }} />
                                            <Typography variant="h6" fontWeight="600" color="#2A4759">
                                                Prosjekt tidslinje
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 4, borderColor: 'rgba(247, 155, 114, 0.2)' }} />
                                    </Grid>

                                    {/* Date Fields */}
                                    <Grid item xs={12} md={6}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DesktopDatePicker
                                                label="Startdato"
                                                inputFormat="DD/MM/YYYY"
                                                value={project.startDate}
                                                onChange={handleStartDateChange}
                                                maxDate={project.endDate}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        fullWidth
                                                        required
                                                        sx={{
                                                            ...fieldStyling,
                                                            '& .MuiOutlinedInput-root': {
                                                                ...fieldStyling['& .MuiOutlinedInput-root'],
                                                                '& fieldset': {
                                                                    borderColor: '#e0e0e0',
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: '#F79B72',
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: '#F79B72',
                                                                    borderWidth: 2,
                                                                },
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DesktopDatePicker
                                                label="Sluttdato"
                                                inputFormat="DD/MM/YYYY"
                                                value={project.endDate}
                                                onChange={handleEndDateChange}
                                                minDate={project.startDate}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        fullWidth
                                                        required
                                                        sx={{
                                                            ...fieldStyling,
                                                            '& .MuiOutlinedInput-root': {
                                                                ...fieldStyling['& .MuiOutlinedInput-root'],
                                                                '& fieldset': {
                                                                    borderColor: '#e0e0e0',
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: '#F79B72',
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: '#F79B72',
                                                                    borderWidth: 2,
                                                                },
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Action Buttons */}
                            <Box sx={{
                                p: { xs: 3, md: 4 },
                                bgcolor: '#f8f9fa',
                                borderTop: '1px solid #e9ecef'
                            }}>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={3}
                                    justifyContent="flex-end"
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={goBack}
                                        size="large"
                                        sx={{
                                            borderColor: '#2A4759',
                                            color: '#2A4759',
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            borderWidth: 2,
                                            '&:hover': {
                                                borderColor: '#2A4759',
                                                bgcolor: 'rgba(42, 71, 89, 0.08)',
                                                borderWidth: 2,
                                            }
                                        }}
                                    >
                                        Avbryt
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        size="large"
                                        sx={{
                                            bgcolor: '#F79B72',
                                            color: 'white',
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            boxShadow: '0 2px 8px rgba(247, 155, 114, 0.3)',
                                            '&:hover': {
                                                bgcolor: '#e8895f',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 16px rgba(247, 155, 114, 0.4)'
                                            },
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                    >
                                        Lagre endringer
                                    </Button>
                                </Stack>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    )
}

export default EditProject
