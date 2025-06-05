import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    Grid,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material'
import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Assignment as ProjectIcon,
    CalendarToday as CalendarIcon,
    Group as GroupIcon,
    Save as SaveIcon,
} from '@mui/icons-material'
import { getUsers } from '../utils/api-user'
import auth from '../auth/auth-helper'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { createProject } from '../../services/projectService'

const statusOptions = [
    { value: 'Todo', label: '📋 Todo', color: '#F79B72' },
    { value: 'In progress', label: '⚡ In progress', color: '#e8895f' },
    { value: 'Done', label: '✅ Done', color: '#2A4759' }
]

const NewProject = () => {
    const navigate = useNavigate()
    const jwt = auth.isAuthenticated()

    const [project, setProject] = useState({
        name: '',
        description: '',
        teamMembers: [],
        status: 'Todo',
        startDate: null,
        endDate: null,
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState([])

    // Fetch users data
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userData = await getUsers({ t: jwt.token })
                if (userData.error) {
                    throw new Error(userData.error)
                }
                setUsers(userData.data || [])
            } catch (err) {
                console.error('Error fetching users:', err)
                setError('Failed to load users data')
            }
        }

        if (jwt && jwt.token) {
            fetchUsers()
        }
    }, [jwt])

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
        setLoading(true)

        try {
            // Prepare data for submission
            const submissionData = {
                ...project,
                // Convert dayjs objects to ISO strings for the API
                startDate: project.startDate ? project.startDate.toISOString() : null,
                endDate: project.endDate ? project.endDate.toISOString() : null,
                // Extract just the IDs if teamMembers are objects
                teamMembers: project.teamMembers.map((member) =>
                    typeof member === 'object' && member._id ? member._id : member
                ),
            }

            // Submit the new project
            const response = await createProject(submissionData, jwt.token)
            if (response.error) {
                throw new Error(response.error)
            }

            // Navigate to project view page
            navigate('/prosjekt-oversikt')
        } catch (err) {
            console.error('Error creating project:', err)
            setError('Failed to create project. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const goBack = () => {
        navigate('/prosjekt-oversikt')
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
                        size="large"
                        onClick={goBack}
                        sx={{
                            color: '#F79B72',
                            '&:hover': {
                                bgcolor: 'rgba(247, 155, 114, 0.08)'
                            }
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
                        <AddIcon sx={{ color: '#F79B72', fontSize: 40 }} />
                        <Box>
                            <Typography
                                variant="h4"
                                component="h1"
                                fontWeight="bold"
                                sx={{ color: '#2A4759', fontSize: { xs: '1.75rem', md: '2.125rem' } }}
                            >
                                Opprett nytt prosjekt
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Definer prosjektdetaljer og team medlemmer
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Paper>

            {/* Main Content */}
            <Container maxWidth="md" sx={{ px: 0 }}>
                <Card elevation={1} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Project Name */}
                                <Grid item xs={12}>
                                    <TextField
                                        name="name"
                                        label="Prosjektnavn"
                                        variant="outlined"
                                        value={project.name || ''}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: '#F79B72',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#F79B72',
                                                },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#F79B72',
                                            },
                                        }}
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
                                        minRows={4}
                                        fullWidth
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: '#F79B72',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#F79B72',
                                                },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#F79B72',
                                            },
                                        }}
                                    />
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
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': {
                                                            borderColor: '#F79B72',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#F79B72',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: '#F79B72',
                                                    },
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props} key={option._id}>
                                                {option.name} ({option.email})
                                            </li>
                                        )}
                                        sx={{
                                            '& .MuiChip-root': {
                                                bgcolor: 'rgba(247, 155, 114, 0.1)',
                                                color: '#F79B72',
                                                '& .MuiChip-deleteIcon': {
                                                    color: '#F79B72',
                                                    '&:hover': {
                                                        color: '#e8895f',
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </Grid>

                                {/* Date Fields */}
                                <Grid item xs={12} md={6}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DesktopDatePicker
                                            label="Startdato"
                                            inputFormat="DD/MM/YYYY"
                                            value={project.startDate}
                                            onChange={handleStartDateChange}
                                            minDate={dayjs().startOf('day')}
                                            maxDate={project.endDate}
                                            disablePast
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    required
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '&:hover fieldset': {
                                                                borderColor: '#F79B72',
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#F79B72',
                                                            },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: '#F79B72',
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
                                            minDate={project.startDate ? project.startDate.startOf('day') : dayjs().startOf('day')}
                                            disablePast
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    required
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '&:hover fieldset': {
                                                                borderColor: '#F79B72',
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#F79B72',
                                                            },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: '#F79B72',
                                                        },
                                                    }}
                                                />
                                            )}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                {/* Status */}
                                <Grid item xs={12}>
                                    <Autocomplete
                                        id="status"
                                        options={statusOptions}
                                        getOptionLabel={(option) => option.label || option}
                                        value={statusOptions.find(option => option.value === project.status) || statusOptions[0]}
                                        onChange={handleStatusChange}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Status"
                                                fullWidth
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': {
                                                            borderColor: '#F79B72',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#F79B72',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: '#F79B72',
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Action Buttons */}
                                <Grid item xs={12}>
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={2}
                                        sx={{ mt: 2 }}
                                    >
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            disabled={loading}
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
                                                '&:hover': {
                                                    bgcolor: '#e8895f',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(247, 155, 114, 0.4)'
                                                },
                                                '&:disabled': {
                                                    bgcolor: '#DDDDDD',
                                                    color: '#999999',
                                                    transform: 'none'
                                                },
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        >
                                            {loading ? 'Oppretter...' : 'Opprett Prosjekt'}
                                        </Button>
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
                                                '&:hover': {
                                                    borderColor: '#2A4759',
                                                    bgcolor: 'rgba(42, 71, 89, 0.08)'
                                                }
                                            }}
                                        >
                                            Avbryt
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    )
}

export default NewProject