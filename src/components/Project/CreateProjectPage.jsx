import React, { useState, useEffect } from 'react'
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Button,
    Autocomplete,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    CircularProgress,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Alert,
    Container,
    Divider,
    Stack,
    alpha,
} from '@mui/material'
import {
    Save,
    Cancel,
    Person,
    CalendarToday,
    Description,
    Group,
    Timeline,
    ArrowBack,
    CheckCircle,
    Schedule,
    Assignment,
} from '@mui/icons-material'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { createProject } from '../../services/projectService'
import { useNavigate } from 'react-router-dom'
import { getUsers } from '../utils/api-user'
import auth from '../auth/auth-helper'

const CreateProjectPage = () => {
    const jwt = auth.isAuthenticated()
    const navigate = useNavigate()

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        teamMembers: [],
        status: '',
        startDate: null,
        endDate: null,
    })

    // UI state
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState([])
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    // Check authentication on mount
    useEffect(() => {
        if (!auth.isAuthenticated()) {
            navigate('/signin')
            return
        }
        loadUsers()
    }, [navigate])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await getUsers({ t: jwt.token })
            if (data.error) {
                navigate('/signin')
            } else {
                const processedUsers = data.data.map((user) => ({
                    ...user,
                    id: user._id,
                }))
                setUsers(processedUsers)
            }
        } catch (err) {
            console.error('Error loading users:', err)
            setErrors({ general: 'Failed to load team members' })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }))
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleTeamMembersChange = (event, newValue) => {
        setFormData(prev => ({
            ...prev,
            teamMembers: newValue
        }))
        if (errors.teamMembers) {
            setErrors(prev => ({ ...prev, teamMembers: '' }))
        }
    }

    const handleDateChange = (field) => (date) => {
        setFormData(prev => ({
            ...prev,
            [field]: date
        }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Project name is required'
        } else if (formData.name.length < 3) {
            newErrors.name = 'Project name must be at least 3 characters'
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Project description is required'
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters'
        }

        if (!formData.status) {
            newErrors.status = 'Project status is required'
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required'
        }

        if (!formData.endDate) {
            newErrors.endDate = 'End date is required'
        } else if (formData.startDate && formData.endDate.isBefore(formData.startDate)) {
            newErrors.endDate = 'End date must be after start date'
        }

        if (formData.teamMembers.length === 0) {
            newErrors.teamMembers = 'At least one team member is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        setErrors({})

        try {
            const teamMemberIds = formData.teamMembers.map((member) => member._id)

            await createProject(
                {
                    name: formData.name,
                    description: formData.description,
                    teamMembers: teamMemberIds,
                    status: formData.status,
                    startDate: formData.startDate ? formData.startDate.toISOString() : null,
                    endDate: formData.endDate ? formData.endDate.toISOString() : null,
                },
                jwt.token
            )

            setSubmitSuccess(true)

            // Reset form and navigate after brief success message
            setTimeout(() => {
                setFormData({
                    name: '',
                    description: '',
                    teamMembers: [],
                    status: '',
                    startDate: null,
                    endDate: null,
                })
                navigate('/prosjekt-oversikt')
            }, 1500)

        } catch (err) {
            console.error('Error creating project:', err)
            setErrors({ general: 'Failed to create project. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        navigate('/prosjekt-oversikt')
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Todo': return <Schedule sx={{ color: '#F79B72' }} />
            case 'In progress': return <Timeline sx={{ color: '#2A4759' }} />
            case 'Done': return <CheckCircle sx={{ color: '#4caf50' }} />
            default: return <Assignment sx={{ color: '#666' }} />
        }
    }

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    bgcolor: '#EEEEEE'
                }}
            >
                <CircularProgress size={60} sx={{ color: '#F79B72' }} />
            </Box>
        )
    }

    return (
        <Box
            sx={{
                p: 3,
                bgcolor: '#EEEEEE',
                minHeight: '100vh',
                marginLeft: { xs: 0, sm: '288px' },
                marginTop: { xs: '72px', sm: '80px' },
                width: { xs: '100%', sm: `calc(100% - 288px)` },
                paddingTop: { xs: 2, sm: 3 },
            }}
        >
            <Container maxWidth="lg">
                {/* Header */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                            <IconButton size="large" onClick={handleCancel} color="primary">
                                <ArrowBack />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: '#2A4759' }}>
                                    Create New Project
                                </Typography>
                                <Typography variant="body1" color="textSecondary" sx={{ mt: 0.5 }}>
                                    Fill in the details below to create a new project
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Success Alert */}
                {submitSuccess && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Project created successfully! Redirecting to projects list...
                    </Alert>
                )}

                {/* Error Alert */}
                {errors.general && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {errors.general}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Project Details */}
                        <Grid item xs={12} md={8}>
                            <Card elevation={2}>
                                <CardHeader
                                    title={
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Description sx={{ color: '#F79B72' }} />
                                            <Typography variant="h6" fontWeight="600">
                                                Project Details
                                            </Typography>
                                        </Stack>
                                    }
                                    sx={{
                                        bgcolor: alpha('#F79B72', 0.05),
                                        borderBottom: '1px solid #e0e0e0'
                                    }}
                                />
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={3}>
                                        <TextField
                                            label="Project Name"
                                            variant="outlined"
                                            fullWidth
                                            value={formData.name}
                                            onChange={handleInputChange('name')}
                                            error={!!errors.name}
                                            helperText={errors.name}
                                            required
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#F79B72',
                                                    },
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#F79B72',
                                                },
                                            }}
                                        />

                                        <TextField
                                            label="Project Description"
                                            variant="outlined"
                                            fullWidth
                                            multiline
                                            rows={4}
                                            value={formData.description}
                                            onChange={handleInputChange('description')}
                                            error={!!errors.description}
                                            helperText={errors.description}
                                            required
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#F79B72',
                                                    },
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#F79B72',
                                                },
                                            }}
                                        />

                                        <FormControl
                                            fullWidth
                                            error={!!errors.status}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#F79B72',
                                                    },
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#F79B72',
                                                },
                                            }}
                                        >
                                            <InputLabel>Project Status</InputLabel>
                                            <Select
                                                value={formData.status}
                                                onChange={handleInputChange('status')}
                                                label="Project Status"
                                                required
                                            >
                                                <MenuItem value="Todo">
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        {getStatusIcon('Todo')}
                                                        <span>To Do</span>
                                                    </Stack>
                                                </MenuItem>
                                                <MenuItem value="In progress">
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        {getStatusIcon('In progress')}
                                                        <span>In Progress</span>
                                                    </Stack>
                                                </MenuItem>
                                                <MenuItem value="Done">
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        {getStatusIcon('Done')}
                                                        <span>Done</span>
                                                    </Stack>
                                                </MenuItem>
                                            </Select>
                                            {errors.status && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                    {errors.status}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Project Settings */}
                        <Grid item xs={12} md={4}>
                            <Stack spacing={3}>
                                {/* Timeline */}
                                <Card elevation={2}>
                                    <CardHeader
                                        title={
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <CalendarToday sx={{ color: '#F79B72' }} />
                                                <Typography variant="h6" fontWeight="600">
                                                    Timeline
                                                </Typography>
                                            </Stack>
                                        }
                                        sx={{
                                            bgcolor: alpha('#F79B72', 0.05),
                                            borderBottom: '1px solid #e0e0e0'
                                        }}
                                    />
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack spacing={2}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DesktopDatePicker
                                                    label="Start Date"
                                                    value={formData.startDate}
                                                    onChange={handleDateChange('startDate')}
                                                    minDate={dayjs().startOf('day')}
                                                    maxDate={formData.endDate}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            fullWidth
                                                            required
                                                            error={!!errors.startDate}
                                                            helperText={errors.startDate}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
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

                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DesktopDatePicker
                                                    label="End Date"
                                                    value={formData.endDate}
                                                    onChange={handleDateChange('endDate')}
                                                    minDate={formData.startDate || dayjs().startOf('day')}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            fullWidth
                                                            required
                                                            error={!!errors.endDate}
                                                            helperText={errors.endDate}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
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
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Team Members */}
                                <Card elevation={2}>
                                    <CardHeader
                                        title={
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Group sx={{ color: '#F79B72' }} />
                                                <Typography variant="h6" fontWeight="600">
                                                    Team Members
                                                </Typography>
                                            </Stack>
                                        }
                                        sx={{
                                            bgcolor: alpha('#F79B72', 0.05),
                                            borderBottom: '1px solid #e0e0e0'
                                        }}
                                    />
                                    <CardContent sx={{ p: 3 }}>
                                        <Autocomplete
                                            multiple
                                            options={users}
                                            getOptionLabel={(user) => user.name || ''}
                                            isOptionEqualToValue={(option, value) => option._id === value._id}
                                            value={formData.teamMembers}
                                            onChange={handleTeamMembersChange}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        {...getTagProps({ index })}
                                                        key={option._id}
                                                        label={option.name}
                                                        avatar={
                                                            <Avatar sx={{ bgcolor: '#F79B72', color: 'white', width: 24, height: 24 }}>
                                                                <Person sx={{ fontSize: 14 }} />
                                                            </Avatar>
                                                        }
                                                        sx={{
                                                            bgcolor: alpha('#F79B72', 0.1),
                                                            color: '#2A4759',
                                                            '& .MuiChip-deleteIcon': {
                                                                color: '#F79B72'
                                                            }
                                                        }}
                                                    />
                                                ))
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Select Team Members"
                                                    variant="outlined"
                                                    error={!!errors.teamMembers}
                                                    helperText={errors.teamMembers}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
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
                                                    <Stack direction="row" alignItems="center" spacing={2}>
                                                        <Avatar sx={{ bgcolor: '#F79B72', color: 'white', width: 32, height: 32 }}>
                                                            <Person sx={{ fontSize: 16 }} />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="500">
                                                                {option.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {option.email}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </li>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>

                        {/* Action Buttons */}
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', bgcolor: '#FAFAFA' }}>
                                <Stack direction="row" spacing={2} justifyContent="flex-end">
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                        startIcon={<Cancel />}
                                        sx={{
                                            borderColor: '#2A4759',
                                            color: '#2A4759',
                                            '&:hover': {
                                                borderColor: '#1e3440',
                                                bgcolor: alpha('#2A4759', 0.04)
                                            },
                                            px: 4
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                        disabled={isSubmitting}
                                        sx={{
                                            bgcolor: '#F79B72',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#e8895f'
                                            },
                                            '&:disabled': {
                                                bgcolor: alpha('#F79B72', 0.6)
                                            },
                                            px: 4
                                        }}
                                    >
                                        {isSubmitting ? 'Creating Project...' : 'Create Project'}
                                    </Button>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </form>
            </Container>
        </Box>
    )
}

export default CreateProjectPage
