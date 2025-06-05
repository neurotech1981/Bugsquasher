import React, { useState, useEffect } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Avatar,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Menu,
    Autocomplete,
    CircularProgress,
    Alert,
    Snackbar,
    useTheme,
    alpha,
    Divider,
    Stack,
    Tooltip,
    AvatarGroup,
} from '@mui/material'
import {
    Add,
    People,
    Edit,
    Delete,
    PersonAdd,
    AdminPanelSettings,
    Visibility,
    MoreVert,
    Group,
    Assignment,
    Star,
    Business,
    Close,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import auth from '../auth/auth-helper'
import teamService from '../../services/teamService'
import { getUsers } from '../utils/api-user'

const TeamManagementHub = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const jwt = auth.isAuthenticated()

    // State management
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    // New team form state
    const [newTeam, setNewTeam] = useState({
        name: '',
        description: '',
        members: [],
        teamLead: null
    })

    // Fetch teams
    const { data: teamsData, isLoading: teamsLoading, error: teamsError } = useQuery(
        ['teams'],
        () => teamService.getTeams(jwt.token),
        {
            enabled: !!jwt?.token,
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
        }
    )

    // Fetch users for team member selection
    const { data: usersData, isLoading: usersLoading } = useQuery(
        ['users'],
        () => getUsers({ t: jwt.token }),
        {
            enabled: !!jwt?.token,
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
        }
    )

    // Create team mutation
    const createTeamMutation = useMutation(
        (teamData) => teamService.createTeam(teamData, jwt.token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['teams'])
                setCreateDialogOpen(false)
                setNewTeam({ name: '', description: '', members: [], teamLead: null })
                setSnackbar({ open: true, message: 'Team opprettet!', severity: 'success' })
            },
            onError: (error) => {
                setSnackbar({ open: true, message: 'Feil ved oppretting av team', severity: 'error' })
            }
        }
    )

    // Update team mutation
    const updateTeamMutation = useMutation(
        ({ teamId, teamData }) => teamService.updateTeam(teamId, teamData, jwt.token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['teams'])
                setEditDialogOpen(false)
                setSelectedTeam(null)
                setSnackbar({ open: true, message: 'Team oppdatert!', severity: 'success' })
            },
            onError: (error) => {
                setSnackbar({ open: true, message: 'Feil ved oppdatering av team', severity: 'error' })
            }
        }
    )

    // Delete team mutation
    const deleteTeamMutation = useMutation(
        (teamId) => teamService.deleteTeam(teamId, jwt.token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['teams'])
                setDeleteDialogOpen(false)
                setSelectedTeam(null)
                setSnackbar({ open: true, message: 'Team slettet!', severity: 'success' })
            },
            onError: (error) => {
                setSnackbar({ open: true, message: 'Feil ved sletting av team', severity: 'error' })
            }
        }
    )

    const teams = teamsData?.data || teamsData?.teams || []
    const users = usersData?.data || []

    const handleCreateTeam = () => {
        if (!newTeam.name.trim()) {
            setSnackbar({ open: true, message: 'Team navn er påkrevd', severity: 'error' })
            return
        }

        createTeamMutation.mutate({
            name: newTeam.name,
            description: newTeam.description,
            members: newTeam.members.map(member => ({
                userId: member._id,
                isLead: member._id === newTeam.teamLead?._id
            }))
        })
    }

    const handleEditTeam = (team) => {
        // Extract user objects from the nested member structure
        const flatMembers = team.members?.map(member => member.user) || []
        const teamLeadMember = team.members?.find(member => member.isLead)
        const teamLead = teamLeadMember ? teamLeadMember.user : null

        setSelectedTeam({
            ...team,
            members: flatMembers,
            teamLead: teamLead
        })
        setEditDialogOpen(true)
    }

    const handleUpdateTeam = () => {
        if (!selectedTeam.name.trim()) {
            setSnackbar({ open: true, message: 'Team navn er påkrevd', severity: 'error' })
            return
        }

        updateTeamMutation.mutate({
            teamId: selectedTeam.id,
            teamData: {
                name: selectedTeam.name,
                description: selectedTeam.description,
                members: selectedTeam.members.map(member => ({
                    userId: member._id || member.id,
                    isLead: (member._id || member.id) === (selectedTeam.teamLead?._id || selectedTeam.teamLead?.id)
                }))
            }
        })
    }

    const handleDeleteTeam = (team) => {
        setSelectedTeam(team)
        setDeleteDialogOpen(true)
    }

    const confirmDeleteTeam = () => {
        deleteTeamMutation.mutate(selectedTeam.id || selectedTeam._id)
    }

    const TeamCard = ({ team }) => {
        const [anchorEl, setAnchorEl] = useState(null)
        const menuOpen = Boolean(anchorEl)

        const handleMenuClick = (event) => {
            event.stopPropagation()
            setAnchorEl(event.currentTarget)
        }

        const handleMenuClose = (event) => {
            if (event) event.stopPropagation()
            setAnchorEl(null)
        }

        const handleCardClick = () => {
            setSelectedTeam(team)
            setDetailsDialogOpen(true)
        }

        const handleEditClick = (event) => {
            event.stopPropagation()
            handleMenuClose()
            handleEditTeam(team)
        }

        const handleDeleteClick = (event) => {
            event.stopPropagation()
            handleMenuClose()
            handleDeleteTeam(team)
        }

        return (
            <Card
                onClick={handleCardClick}
                sx={{
                    borderRadius: 3,
                    border: '1px solid rgba(221, 221, 221, 0.3)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(42, 71, 89, 0.15)',
                    },
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                            <Typography variant="h6" fontWeight="600" color="#2A4759" gutterBottom>
                                {team.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {team.description || 'Ingen beskrivelse'}
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={handleMenuClick}
                            sx={{
                                color: '#666',
                                '&:hover': {
                                    bgcolor: 'rgba(42, 71, 89, 0.04)',
                                },
                            }}
                        >
                            <MoreVert />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem onClick={handleEditClick}>
                                <Edit sx={{ mr: 1, fontSize: 18 }} />
                                Rediger
                            </MenuItem>
                            <MenuItem
                                onClick={handleDeleteClick}
                                sx={{ color: '#f44336' }}
                            >
                                <Delete sx={{ mr: 1, fontSize: 18 }} />
                                Slett
                            </MenuItem>
                        </Menu>
                    </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <People sx={{ color: '#F79B72', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                            {team.members?.length || 0} medlemmer
                        </Typography>
                    </Box>

                    {team.teamLead && (
                        <Chip
                            icon={<Star />}
                            label={team.teamLead.name}
                            size="small"
                            sx={{
                                bgcolor: alpha('#F79B72', 0.1),
                                color: '#F79B72',
                                fontWeight: 500,
                            }}
                        />
                    )}
                </Box>

                {team.members && team.members.length > 0 && (
                    <Box mb={2}>
                        <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                            {team.members.map((member) => (
                                <Avatar
                                    key={member.user?._id || member.user?.id || member._id || member.id}
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: '#2A4759',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {member.user?.name?.charAt(0).toUpperCase()}
                                </Avatar>
                            ))}
                        </AvatarGroup>
                    </Box>
                )}
            </CardContent>
        </Card>
        )
    }

    if (teamsLoading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#EEEEEE',
                    pt: 12,
                    pb: 6,
                    ml: { lg: '288px' },
                    mt: '80px',
                    width: { lg: 'calc(100% - 288px)', xs: '100%' },
                    px: { xs: 2, sm: 4, md: 6 },
                }}
            >
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress sx={{ color: '#F79B72' }} />
                </Box>
            </Box>
        )
    }

    if (teamsError) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#EEEEEE',
                    pt: 12,
                    pb: 6,
                    ml: { lg: '288px' },
                    mt: '80px',
                    width: { lg: 'calc(100% - 288px)', xs: '100%' },
                    px: { xs: 2, sm: 4, md: 6 },
                }}
            >
                <Alert severity="error">
                    Feil ved lasting av teams. Prøv igjen senere.
                </Alert>
            </Box>
        )
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#EEEEEE',
                pt: 12,
                pb: 6,
                ml: { lg: '288px' },
                mt: '80px',
                width: { lg: 'calc(100% - 288px)', xs: '100%' },
                px: { xs: 2, sm: 4, md: 6 },
            }}
        >
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="700" color="#2A4759" gutterBottom>
                        Team Administrasjon
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administrer teams, medlemmer og tilganger
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{
                        bgcolor: '#F79B72',
                        color: 'white',
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: '0 4px 20px rgba(247, 155, 114, 0.4)',
                        '&:hover': {
                            bgcolor: '#e8895f',
                            boxShadow: '0 6px 25px rgba(247, 155, 114, 0.6)',
                            transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    Opprett Team
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3} key="stat-total-teams">
                    <Card sx={{ borderRadius: 3, border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#F79B72', width: 48, height: 48 }}>
                                    <Group />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="700" color="#2A4759">
                                        {teams.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Totale Teams
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3} key="stat-total-members">
                    <Card sx={{ borderRadius: 3, border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#2A4759', width: 48, height: 48 }}>
                                    <People />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="700" color="#2A4759">
                                        {teams.reduce((acc, team) => acc + (team.members?.length || 0), 0)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Totale Medlemmer
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3} key="stat-team-leaders">
                    <Card sx={{ borderRadius: 3, border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#F79B72', width: 48, height: 48 }}>
                                    <AdminPanelSettings />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="700" color="#2A4759">
                                        {teams.filter(team => team.teamLead).length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Team Ledere
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3} key="stat-active-projects">
                    <Card sx={{ borderRadius: 3, border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#2A4759', width: 48, height: 48 }}>
                                    <Assignment />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="700" color="#2A4759">
                                        {teams.reduce((acc, team) => acc + (team.projects?.length || 0), 0)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Aktive Prosjekter
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Teams Grid */}
            <Grid container spacing={3}>
                {teams.map((team) => (
                    <Grid item xs={12} sm={6} lg={4} key={team._id}>
                        <TeamCard team={team} />
                    </Grid>
                ))}

                {teams.length === 0 && (
                    <Grid item xs={12}>
                        <Card sx={{ borderRadius: 3, border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                            <CardContent sx={{ py: 8, textAlign: 'center' }}>
                                <Group sx={{ fontSize: 64, color: '#F79B72', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Ingen teams funnet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Start med å opprette ditt første team for å organisere prosjektene dine
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setCreateDialogOpen(true)}
                                    sx={{
                                        bgcolor: '#F79B72',
                                        color: 'white',
                                        borderRadius: 3,
                                        '&:hover': { bgcolor: '#e8895f' },
                                    }}
                                >
                                    Opprett Team
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* Create Team Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="600">
                        Opprett Nytt Team
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} key="create-team-name">
                                <TextField
                                    fullWidth
                                    label="Team Navn"
                                    value={newTeam.name}
                                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} key="create-team-description">
                                <TextField
                                    fullWidth
                                    label="Beskrivelse"
                                    value={newTeam.description}
                                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                            <Grid item xs={12} key="create-team-members">
                                <Autocomplete
                                    multiple
                                    options={users}
                                    getOptionLabel={(option) => `${option.name} (${option.email})`}
                                    value={newTeam.members}
                                    onChange={(event, newValue) => {
                                        setNewTeam({ ...newTeam, members: newValue })
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Team Medlemmer"
                                            variant="outlined"
                                            placeholder="Velg medlemmer..."
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                />
                            </Grid>
                            <Grid item xs={12} key="create-team-lead">
                                <Autocomplete
                                    options={newTeam.members}
                                    getOptionLabel={(option) => option.name}
                                    value={newTeam.teamLead}
                                    onChange={(event, newValue) => {
                                        setNewTeam({ ...newTeam, teamLead: newValue })
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Team Leder"
                                            variant="outlined"
                                            placeholder="Velg team leder..."
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setCreateDialogOpen(false)}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleCreateTeam}
                        variant="contained"
                        disabled={createTeamMutation.isLoading}
                        sx={{
                            bgcolor: '#F79B72',
                            '&:hover': { bgcolor: '#e8895f' },
                        }}
                    >
                        {createTeamMutation.isLoading ? 'Oppretter...' : 'Opprett Team'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Team Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="600">
                        Rediger Team
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {selectedTeam && (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} key="edit-team-name">
                                    <TextField
                                        fullWidth
                                        label="Team Navn"
                                        value={selectedTeam.name}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, name: e.target.value })}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} key="edit-team-description">
                                    <TextField
                                        fullWidth
                                        label="Beskrivelse"
                                        value={selectedTeam.description || ''}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, description: e.target.value })}
                                        variant="outlined"
                                        multiline
                                        rows={3}
                                    />
                                </Grid>
                                <Grid item xs={12} key="edit-team-members">
                                    <Autocomplete
                                        multiple
                                        options={users}
                                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                                        value={selectedTeam.members}
                                        onChange={(event, newValue) => {
                                            setSelectedTeam({ ...selectedTeam, members: newValue })
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Team Medlemmer"
                                                variant="outlined"
                                                placeholder="Velg medlemmer..."
                                            />
                                        )}
                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                    />
                                </Grid>
                                <Grid item xs={12} key="edit-team-lead">
                                    <Autocomplete
                                        options={selectedTeam.members}
                                        getOptionLabel={(option) => option.name}
                                        value={selectedTeam.teamLead}
                                        onChange={(event, newValue) => {
                                            setSelectedTeam({ ...selectedTeam, teamLead: newValue })
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Team Leder"
                                                variant="outlined"
                                                placeholder="Velg team leder..."
                                            />
                                        )}
                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setEditDialogOpen(false)}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleUpdateTeam}
                        variant="contained"
                        disabled={updateTeamMutation.isLoading}
                        sx={{
                            bgcolor: '#F79B72',
                            '&:hover': { bgcolor: '#e8895f' },
                        }}
                    >
                        {updateTeamMutation.isLoading ? 'Oppdaterer...' : 'Oppdater Team'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Team Details Dialog */}
            <Dialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" fontWeight="600" color="#2A4759">
                            {selectedTeam?.name}
                        </Typography>
                        <IconButton onClick={() => setDetailsDialogOpen(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedTeam && (
                        <Box sx={{ pt: 1 }}>
                            {/* Description */}
                            <Box mb={3}>
                                <Typography variant="h6" fontWeight="600" color="#2A4759" gutterBottom>
                                    Beskrivelse
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {selectedTeam.description || 'Ingen beskrivelse tilgjengelig'}
                                </Typography>
                            </Box>

                            {/* Team Lead */}
                            {selectedTeam.teamLead && (
                                <Box mb={3}>
                                    <Typography variant="h6" fontWeight="600" color="#2A4759" gutterBottom>
                                        Team Leder
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar
                                            sx={{
                                                bgcolor: '#F79B72',
                                                width: 40,
                                                height: 40,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {selectedTeam.teamLead.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body1" fontWeight="500">
                                                {selectedTeam.teamLead.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedTeam.teamLead.email}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            icon={<Star />}
                                            label="Team Lead"
                                            size="small"
                                            sx={{
                                                bgcolor: alpha('#F79B72', 0.1),
                                                color: '#F79B72',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </Box>
                                </Box>
                            )}

                            {/* Team Members */}
                            <Box mb={3}>
                                <Typography variant="h6" fontWeight="600" color="#2A4759" gutterBottom>
                                    Team Medlemmer ({selectedTeam.members?.length || 0})
                                </Typography>
                                {selectedTeam.members && selectedTeam.members.length > 0 ? (
                                    <Stack spacing={2}>
                                        {selectedTeam.members.map((member, index) => {
                                            const memberUser = member.user || member
                                            const isLead = member.isLead || memberUser._id === selectedTeam.teamLead?._id

                                            return (
                                                <Box
                                                    key={memberUser._id || memberUser.id || index}
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={2}
                                                    sx={{
                                                        p: 2,
                                                        border: '1px solid rgba(221, 221, 221, 0.3)',
                                                        borderRadius: 2,
                                                        bgcolor: isLead ? alpha('#F79B72', 0.02) : 'transparent',
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: isLead ? '#F79B72' : '#2A4759',
                                                            width: 40,
                                                            height: 40,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {memberUser.name?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box flex={1}>
                                                        <Typography variant="body1" fontWeight="500">
                                                            {memberUser.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {memberUser.email}
                                                        </Typography>
                                                    </Box>
                                                    {isLead && (
                                                        <Chip
                                                            icon={<Star />}
                                                            label="Lead"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: alpha('#F79B72', 0.1),
                                                                color: '#F79B72',
                                                                fontWeight: 500,
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            )
                                        })}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Ingen medlemmer i dette teamet
                                    </Typography>
                                )}
                            </Box>

                            {/* Quick Stats */}
                            <Box>
                                <Typography variant="h6" fontWeight="600" color="#2A4759" gutterBottom>
                                    Statistikk
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3} key="details-stat-members">
                                        <Card sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                                            <Typography variant="h4" fontWeight="600" color="#F79B72">
                                                {selectedTeam.members?.length || 0}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Medlemmer
                                            </Typography>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6} sm={3} key="details-stat-leaders">
                                        <Card sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                                            <Typography variant="h4" fontWeight="600" color="#2A4759">
                                                {selectedTeam.members?.filter(m => m.isLead || (m.user && m.user._id === selectedTeam.teamLead?._id)).length || 1}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Ledere
                                            </Typography>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => {
                            setDetailsDialogOpen(false)
                            handleEditTeam(selectedTeam)
                        }}
                        variant="outlined"
                        startIcon={<Edit />}
                        sx={{
                            color: '#F79B72',
                            borderColor: '#F79B72',
                            '&:hover': {
                                borderColor: '#e8895f',
                                bgcolor: 'rgba(247, 155, 114, 0.04)',
                            },
                        }}
                    >
                        Rediger Team
                    </Button>
                    <Button onClick={() => setDetailsDialogOpen(false)}>
                        Lukk
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Team Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="600">
                        Slett Team
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Er du sikker på at du vil slette teamet "{selectedTeam?.name}"?
                        Denne handlingen kan ikke angres.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={confirmDeleteTeam}
                        variant="contained"
                        color="error"
                        disabled={deleteTeamMutation.isLoading}
                    >
                        {deleteTeamMutation.isLoading ? 'Sletter...' : 'Slett Team'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default TeamManagementHub