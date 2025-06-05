/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    OutlinedInput,
    Paper,
    Stack,
    TextField,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material'
import {
    Person,
    Email,
    Work,
    CalendarToday,
    BugReport,
    Assignment,
    TrendingUp,
    Settings,
    Edit,
    Save,
    Cancel,
    Visibility,
    VisibilityOff,
    AccessTime,
    CheckCircle,
    Schedule,
    Lock
} from '@mui/icons-material'
import auth from '../auth/auth-helper'
import { findUserProfile, changePasswordProfile, updateUserProfile } from '../utils/api-user'
import issueService from '../../services/issueService'
import DeleteUser from './DeleteUser'
import moment from 'moment'

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'åpen': return '#F79B72'
        case 'løst': return '#4CAF50'
        case 'lukket': return '#9E9E9E'
        case 'under arbeid': return '#2A4759'
        default: return '#F79B72'
    }
}

const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
        case 'haster': return '#E91E63'
        case 'øyeblikkelig': return '#9C27B0'
        case 'høy': return '#F44336'
        case 'normal': return '#FF9800'
        case 'lav': return '#4CAF50'
        default: return '#9E9E9E'
    }
}

export default function Profile() {
    const { userId } = useParams()
    const navigate = useNavigate()

    const [user, setUser] = useState({})
    const [userStats, setUserStats] = useState({
        totalIssues: 0,
        openIssues: 0,
        resolvedIssues: 0,
        assignedIssues: []
    })
    const [loading, setLoading] = useState(true)
    const [tabValue, setTabValue] = useState(0)
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
    const [editMode, setEditMode] = useState({
        name: false,
        email: false
    })
    const [editData, setEditData] = useState({ name: '', email: '' })
    const [saving, setSaving] = useState(false)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    })

    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: '',
        showPassword: false
    })

    const currentUser = auth.isAuthenticated()?.user
    const isOwnProfile = (currentUser?.id === user._id) || (currentUser?._id === user._id)

    // Debug logging
    console.log('Profile Debug:', {
        currentUserId: currentUser?.id,
        currentUser_id: currentUser?._id,
        profileUser_id: user._id,
        isOwnProfile,
        userId: userId
    })

    // Fetch user profile data
    const fetchUserProfile = async () => {
        const jwt = auth.isAuthenticated()
        const profileUserId = userId || currentUser?.id || currentUser?._id

        try {
            setLoading(true)
            const userData = await findUserProfile({ userId: profileUserId }, { t: jwt.token })

            if (userData.error) {
                navigate('/signin')
                return
            }

            setUser(userData)
            setEditData({ name: userData.name || '', email: userData.email || '' })

            // Fetch user's issues statistics
            await fetchUserStats(profileUserId, jwt.token)

        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch user statistics and assigned issues
    const fetchUserStats = async (profileUserId, token) => {
        try {
            // Get all issues to filter by user
            const issuesResponse = await issueService.getAll(token, 1, 1000)
            const allIssues = issuesResponse.data || []

            // Filter issues by this user (either reporter or assigned)
            const userIssues = allIssues.filter(issue =>
                issue.reporter?._id === profileUserId || issue.delegated?._id === profileUserId
            )

            const openIssues = userIssues.filter(issue =>
                issue.status === 'Åpen' || issue.status === 'Under arbeid'
            )

            const resolvedIssues = userIssues.filter(issue =>
                issue.status === 'Løst' || issue.status === 'Lukket'
            )

            const assignedIssues = allIssues.filter(issue =>
                issue.delegated?._id === profileUserId
            ).slice(0, 5) // Limit to 5 most recent

            setUserStats({
                totalIssues: userIssues.length,
                openIssues: openIssues.length,
                resolvedIssues: resolvedIssues.length,
                assignedIssues
            })

        } catch (error) {
            console.error('Error fetching user stats:', error)
        }
    }

    // Handle inline editing
    const handleEditToggle = (field) => {
        if (editMode[field]) {
            // Cancel edit - revert changes
            setEditData(prev => ({
                ...prev,
                [field]: user[field] || ''
            }))
        }
        setEditMode(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
    }

    const handleEditSave = async (field) => {
        if (!editData[field].trim()) {
            setSnackbar({
                open: true,
                message: 'Feltet kan ikke være tomt',
                severity: 'error'
            })
            return
        }

        setSaving(true)
        try {
            const jwt = auth.isAuthenticated()
            const updateData = { [field]: editData[field] }

            const result = await updateUserProfile(user._id, updateData, jwt.token)

            if (result.error) {
                setSnackbar({
                    open: true,
                    message: `Feil ved oppdatering: ${result.error}`,
                    severity: 'error'
                })
            } else {
                // Update user state with new data
                setUser(prev => ({ ...prev, [field]: editData[field] }))
                setEditMode(prev => ({ ...prev, [field]: false }))
                setSnackbar({
                    open: true,
                    message: 'Profil oppdatert!',
                    severity: 'success'
                })
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            setSnackbar({
                open: true,
                message: 'Nettverksfeil ved oppdatering',
                severity: 'error'
            })
        } finally {
            setSaving(false)
        }
    }

    // Handle password change
    const handlePasswordChange = async () => {
        if (passwordData.password !== passwordData.confirmPassword) {
            setSnackbar({
                open: true,
                message: 'Passordene matcher ikke',
                severity: 'error'
            })
            return
        }

        if (passwordData.password.length < 6) {
            setSnackbar({
                open: true,
                message: 'Passordet må være minst 6 tegn',
                severity: 'error'
            })
            return
        }

        try {
            const result = await changePasswordProfile(
                currentUser?.id || currentUser?._id,
                passwordData.password,
                passwordData.confirmPassword,
                auth.isAuthenticated().token
            )

            if (result.error) {
                setSnackbar({
                    open: true,
                    message: `Feil ved endring av passord: ${result.error}`,
                    severity: 'error'
                })
            } else {
                setSnackbar({
                    open: true,
                    message: 'Passord endret!',
                    severity: 'success'
                })
                setPasswordDialogOpen(false)
                setPasswordData({ password: '', confirmPassword: '', showPassword: false })
            }
        } catch (error) {
            console.error('Password change error:', error)
            setSnackbar({
                open: true,
                message: 'Feil ved endring av passord',
                severity: 'error'
            })
        }
    }

    useEffect(() => {
        fetchUserProfile()
    }, [userId])

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setSnackbar(prev => ({ ...prev, open: false }))
    }

    if (loading) {
        return (
            <Box sx={{
                marginLeft: { xs: 0, sm: '288px' },
                marginTop: { xs: '72px', sm: '80px' },
                width: { xs: '100%', sm: 'calc(100% - 288px)' },
                minHeight: { xs: 'calc(100vh - 72px)', sm: 'calc(100vh - 80px)' },
                bgcolor: '#EEEEEE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <LinearProgress sx={{ width: 300, color: '#F79B72' }} />
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
            <Container maxWidth="lg" sx={{ px: 0 }}>
                {/* Header Section */}
                <Paper elevation={0} sx={{
                    p: 4,
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid rgba(221, 221, 221, 0.3)',
                    bgcolor: 'white',
                    background: 'linear-gradient(135deg, rgba(247, 155, 114, 0.05), rgba(42, 71, 89, 0.05))'
                }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item>
                            <Avatar sx={{
                                width: 100,
                                height: 100,
                                bgcolor: '#F79B72',
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                border: '4px solid white',
                                boxShadow: '0 8px 32px rgba(247, 155, 114, 0.3)'
                            }}>
                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Stack spacing={1}>
                                {/* Editable Name */}
                                {isOwnProfile && editMode.name ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TextField
                                            value={editData.name}
                                            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                            variant="outlined"
                                            size="small"
                                            sx={{ flexGrow: 1 }}
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleEditSave('name')
                                                if (e.key === 'Escape') handleEditToggle('name')
                                            }}
                                        />
                                        <IconButton
                                            onClick={() => handleEditSave('name')}
                                            disabled={saving}
                                            sx={{ color: '#4CAF50' }}
                                        >
                                            {saving ? <CircularProgress size={20} /> : <Save />}
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleEditToggle('name')}
                                            sx={{ color: '#F44336' }}
                                        >
                                            <Cancel />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h4" fontWeight="bold" color="#2A4759">
                                            {user.name || 'Ukjent bruker'}
                                        </Typography>
                                        {isOwnProfile && (
                                            <IconButton
                                                onClick={() => handleEditToggle('name')}
                                                size="small"
                                                sx={{
                                                    color: '#F79B72',
                                                    '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.1)' }
                                                }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                )}

                                {/* Editable Email */}
                                {isOwnProfile && editMode.email ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TextField
                                            value={editData.email}
                                            onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                                            variant="outlined"
                                            size="small"
                                            type="email"
                                            sx={{ flexGrow: 1 }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleEditSave('email')
                                                if (e.key === 'Escape') handleEditToggle('email')
                                            }}
                                        />
                                        <IconButton
                                            onClick={() => handleEditSave('email')}
                                            disabled={saving}
                                            sx={{ color: '#4CAF50' }}
                                        >
                                            {saving ? <CircularProgress size={20} /> : <Save />}
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleEditToggle('email')}
                                            sx={{ color: '#F44336' }}
                                        >
                                            <Cancel />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h6" color="#F79B72">
                                            {user.email}
                                        </Typography>
                                        {isOwnProfile && (
                                            <IconButton
                                                onClick={() => handleEditToggle('email')}
                                                size="small"
                                                sx={{
                                                    color: '#F79B72',
                                                    '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.1)' }
                                                }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                )}

                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                        label={user.role || 'Bruker'}
                                        sx={{
                                            bgcolor: '#2A4759',
                                            color: 'white',
                                            fontWeight: 600
                                        }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        Medlem siden {moment(user.createdAt).format('MMMM YYYY')}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Grid>
                        {isOwnProfile && (
                            <Grid item>
                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        onClick={() => setPasswordDialogOpen(true)}
                                        sx={{
                                            bgcolor: '#2A4759',
                                            color: 'white',
                                            '&:hover': { bgcolor: '#1e3440' }
                                        }}
                                    >
                                        <Lock />
                                    </IconButton>
                                </Stack>
                            </Grid>
                        )}
                    </Grid>
                </Paper>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                        <Card elevation={0} sx={{
                            border: '1px solid rgba(221, 221, 221, 0.3)',
                            borderRadius: 3,
                            bgcolor: 'white'
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <BugReport sx={{ fontSize: 40, color: '#F79B72', mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold" color="#2A4759">
                                    {userStats.totalIssues}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Totale saker
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card elevation={0} sx={{
                            border: '1px solid rgba(221, 221, 221, 0.3)',
                            borderRadius: 3,
                            bgcolor: 'white'
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Schedule sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold" color="#2A4759">
                                    {userStats.openIssues}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Åpne saker
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card elevation={0} sx={{
                            border: '1px solid rgba(221, 221, 221, 0.3)',
                            borderRadius: 3,
                            bgcolor: 'white'
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold" color="#2A4759">
                                    {userStats.resolvedIssues}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Løste saker
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card elevation={0} sx={{
                            border: '1px solid rgba(221, 221, 221, 0.3)',
                            borderRadius: 3,
                            bgcolor: 'white'
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <TrendingUp sx={{ fontSize: 40, color: '#2A4759', mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold" color="#2A4759">
                                    {userStats.resolvedIssues > 0 ? Math.round((userStats.resolvedIssues / userStats.totalIssues) * 100) : 0}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Løsningsrate
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs Section */}
                <Card elevation={0} sx={{
                    border: '1px solid rgba(221, 221, 221, 0.3)',
                    borderRadius: 3,
                    bgcolor: 'white'
                }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{
                            borderBottom: '1px solid rgba(221, 221, 221, 0.3)',
                            '& .MuiTab-root': {
                                color: '#2A4759',
                                fontWeight: 600
                            },
                            '& .Mui-selected': {
                                color: '#F79B72 !important'
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#F79B72'
                            }
                        }}
                    >
                        <Tab label="Informasjon" />
                        <Tab label="Tildelte saker" />
                        {isOwnProfile && <Tab label="Innstillinger" />}
                    </Tabs>

                    <CardContent sx={{ p: 3 }}>
                        {/* Tab 0: User Information */}
                        {tabValue === 0 && (
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={3}>
                                        <Box>
                                            <Typography variant="h6" color="#2A4759" gutterBottom>
                                                Kontaktinformasjon
                                            </Typography>
                                            <List>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <Person sx={{ color: '#F79B72' }} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Navn"
                                                        secondary={user.name || 'Ikke oppgitt'}
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <Email sx={{ color: '#F79B72' }} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="E-post"
                                                        secondary={user.email || 'Ikke oppgitt'}
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <Work sx={{ color: '#F79B72' }} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Rolle"
                                                        secondary={user.role || 'Bruker'}
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <CalendarToday sx={{ color: '#F79B72' }} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Registrert"
                                                        secondary={moment(user.createdAt).format('DD. MMMM YYYY')}
                                                    />
                                                </ListItem>
                                            </List>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" color="#2A4759" gutterBottom>
                                        Aktivitetsoversikt
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Box sx={{
                                            p: 2,
                                            bgcolor: 'rgba(247, 155, 114, 0.05)',
                                            borderRadius: 2,
                                            border: '1px solid rgba(247, 155, 114, 0.2)'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Sist aktiv
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600">
                                                {moment(user.updatedAt).fromNow()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            p: 2,
                                            bgcolor: 'rgba(42, 71, 89, 0.05)',
                                            borderRadius: 2,
                                            border: '1px solid rgba(42, 71, 89, 0.2)'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Medlemskap
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600">
                                                {moment().diff(moment(user.createdAt), 'days')} dager
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        )}

                        {/* Tab 1: Assigned Issues */}
                        {tabValue === 1 && (
                            <Box>
                                <Typography variant="h6" color="#2A4759" gutterBottom>
                                    Tildelte saker ({userStats.assignedIssues.length})
                                </Typography>
                                {userStats.assignedIssues.length > 0 ? (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Sak</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Prioritet</TableCell>
                                                    <TableCell>Opprettet</TableCell>
                                                    <TableCell>Handlinger</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {userStats.assignedIssues.map((issue) => (
                                                    <TableRow key={issue._id}>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="600">
                                                                {issue.summary}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                #{issue._id?.slice(-8)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={issue.status}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: getStatusColor(issue.status),
                                                                    color: 'white',
                                                                    fontWeight: 600
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={issue.priority || 'Normal'}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    borderColor: getPriorityColor(issue.priority),
                                                                    color: getPriorityColor(issue.priority),
                                                                    fontWeight: 600
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {moment(issue.createdAt).format('DD.MM.YYYY')}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="small"
                                                                onClick={() => navigate(`/vis-sak/${issue._id}`)}
                                                                sx={{ color: '#F79B72' }}
                                                            >
                                                                Vis
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box sx={{
                                        textAlign: 'center',
                                        p: 4,
                                        bgcolor: 'rgba(247, 155, 114, 0.05)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(247, 155, 114, 0.2)'
                                    }}>
                                        <Assignment sx={{ fontSize: 48, color: 'rgba(42, 71, 89, 0.3)', mb: 2 }} />
                                        <Typography color="text.secondary">
                                            Ingen tildelte saker
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Tab 2: Settings (only for own profile) */}
                        {tabValue === 2 && isOwnProfile && (
                            <Stack spacing={3}>
                                <Typography variant="h6" color="#2A4759">
                                    Kontoinnstillinger
                                </Typography>
                                <Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Lock />}
                                        onClick={() => setPasswordDialogOpen(true)}
                                        sx={{
                                            borderColor: '#F79B72',
                                            color: '#F79B72',
                                            '&:hover': {
                                                borderColor: '#e8895f',
                                                bgcolor: 'rgba(247, 155, 114, 0.04)'
                                            }
                                        }}
                                    >
                                        Endre passord
                                    </Button>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="h6" color="#d32f2f" gutterBottom>
                                        Farlig sone
                                    </Typography>
                                    <DeleteUser userId={user._id} />
                                </Box>
                            </Stack>
                        )}
                    </CardContent>
                </Card>

                {/* Password Change Dialog */}
                <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Endre passord</DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField
                                label="Nytt passord"
                                type={passwordData.showPassword ? 'text' : 'password'}
                                value={passwordData.password}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setPasswordData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                                            >
                                                {passwordData.showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                fullWidth
                            />
                            <TextField
                                label="Bekreft passord"
                                type={passwordData.showPassword ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setPasswordDialogOpen(false)}>
                            Avbryt
                        </Button>
                        <Button
                            onClick={handlePasswordChange}
                            variant="contained"
                            disabled={!passwordData.password || !passwordData.confirmPassword}
                            sx={{
                                bgcolor: '#F79B72',
                                '&:hover': { bgcolor: '#e8895f' }
                            }}
                        >
                            Lagre
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Success/Error Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{
                            width: '100%',
                            ...(snackbar.severity === 'success' && {
                                bgcolor: '#4CAF50',
                                color: 'white',
                                '& .MuiAlert-icon': { color: 'white' }
                            })
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    )
}
