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
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Autocomplete,
    CircularProgress,
    Alert,
    Snackbar,
    useTheme,
    alpha,
    Divider,
    Stack,
    Tooltip,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material'
import {
    ArrowBack,
    Edit,
    Delete,
    PersonAdd,
    PersonRemove,
    AdminPanelSettings,
    Assignment,
    Star,
    Email,
    Phone,
    CalendarToday,
    Group,
    Settings,
    MoreVert,
    Check,
    Close,
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import auth from '../auth/auth-helper'
import teamService from '../../services/teamService'
import { getUsers } from '../utils/api-user'
import { getProjects } from '../../services/projectService'

const TeamDetailView = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { teamId } = useParams()
    const queryClient = useQueryClient()
    const jwt = auth.isAuthenticated()

    // State management
    const [activeTab, setActiveTab] = useState(0)
    const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
    const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)
    const [selectedUsers, setSelectedUsers] = useState([])
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    // Fetch team details
    const { data: teamData, isLoading: teamLoading, error: teamError } = useQuery(
        ['team', teamId],
        () => teamService.getTeam(jwt.token, teamId),
        {
            enabled: !!jwt?.token && !!teamId,
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
        }
    )

    // Fetch all users
    const { data: usersData } = useQuery(
        ['users'],
        () => getUsers({ t: jwt.token }),
        {
            enabled: !!jwt?.token,
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
        }
    )

    // Fetch projects assigned to this team
    const { data: projectsData } = useQuery(
        ['team-projects', teamId],
        () => teamService.getProjectTeams(teamId, jwt.token),
        {
            enabled: !!jwt?.token && !!teamId,
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
        }
    )

    // Add team member mutation
    const addMemberMutation = useMutation(
        ({ userId, isLead }) => teamService.addTeamMember(teamId, userId, isLead, jwt.token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['team', teamId])
                setAddMemberDialogOpen(false)
                setSelectedUsers([])
                setSnackbar({ open: true, message: 'Medlem lagt til!', severity: 'success' })
            },
            onError: (error) => {
                setSnackbar({ open: true, message: 'Feil ved tillegg av medlem', severity: 'error' })
            }
        }
    )

    // Remove team member mutation
    const removeMemberMutation = useMutation(
        (userId) => teamService.removeTeamMember(teamId, userId, jwt.token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['team', teamId])
                setSnackbar({ open: true, message: 'Medlem fjernet!', severity: 'success' })
            },
            onError: (error) => {
                setSnackbar({ open: true, message: 'Feil ved fjerning av medlem', severity: 'error' })
            }
        }
    )

    // Update member role mutation
    const updateMemberRoleMutation = useMutation(
        ({ userId, isLead }) => teamService.updateTeamMemberRole(teamId, userId, isLead, jwt.token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['team', teamId])
                setEditMemberDialogOpen(false)
                setSelectedMember(null)
                setSnackbar({ open: true, message: 'Medlem rolle oppdatert!', severity: 'success' })
            },
            onError: (error) => {
                setSnackbar({ open: true, message: 'Feil ved oppdatering av rolle', severity: 'error' })
            }
        }
    )

    const team = teamData?.data
    const users = usersData?.data || []
    const projects = projectsData?.data || []

    // Filter users not in team for add member dialog
    const availableUsers = users.filter(
        user => !team?.members?.some(member => member._id === user._id)
    )

    const handleAddMembers = () => {
        selectedUsers.forEach(user => {
            addMemberMutation.mutate({ userId: user._id, isLead: false })
        })
    }

    const handleRemoveMember = (userId) => {
        removeMemberMutation.mutate(userId)
    }

    const handleUpdateMemberRole = (member, isLead) => {
        updateMemberRoleMutation.mutate({ userId: member._id, isLead })
    }

    const TabPanel = ({ children, value, index, ...other }) => (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`team-tabpanel-${index}`}
            aria-labelledby={`team-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    )

    if (teamLoading) {
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

    if (teamError || !team) {
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
                    Team ikke funnet eller feil ved lasting.
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
            <Box display="flex" alignItems="center" gap={2} mb={4}>
                <IconButton
                    onClick={() => navigate('/team-admin')}
                    sx={{
                        bgcolor: 'white',
                        border: '1px solid rgba(221, 221, 221, 0.3)',
                        '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                >
                    <ArrowBack />
                </IconButton>
                <Box flex={1}>
                    <Typography variant="h4" fontWeight="700" color="#2A4759" gutterBottom>
                        {team.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {team.description || 'Ingen beskrivelse'}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => navigate(`/team-admin/edit/${teamId}`)}
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
            </Box>

            {/* Team Stats Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#F79B72', width: 48, height: 48 }}>
                                    <Group />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="700" color="#2A4759">
                                        {team.members?.length || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Medlemmer
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#2A4759', width: 48, height: 48 }}>
                                    <Assignment />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="700" color="#2A4759">
                                        {projects.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Prosjekter
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#F79B72', width: 48, height: 48 }}>
                                    <AdminPanelSettings />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="700" color="#2A4759">
                                        {team.members?.filter(member => member.isLead).length || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Team Ledere
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#2A4759', width: 48, height: 48 }}>
                                    <CalendarToday />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="700" color="#2A4759">
                                        {new Date(team.createdAt).toLocaleDateString('no-NO')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Opprettet
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tab Navigation */}
            <Card sx={{ borderRadius: 3, border: '1px solid rgba(221, 221, 221, 0.3)', mb: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(event, newValue) => setActiveTab(newValue)}
                        sx={{
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                textTransform: 'none',
                                '&.Mui-selected': {
                                    color: '#F79B72',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#F79B72',
                            },
                        }}
                    >
                        <Tab label="Medlemmer" />
                        <Tab label="Prosjekter" />
                        <Tab label="Aktivitet" />
                    </Tabs>
                </Box>

                {/* Members Tab */}
                <TabPanel value={activeTab} index={0}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight="600" color="#2A4759">
                                Team Medlemmer
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<PersonAdd />}
                                onClick={() => setAddMemberDialogOpen(true)}
                                sx={{
                                    bgcolor: '#F79B72',
                                    '&:hover': { bgcolor: '#e8895f' },
                                    borderRadius: 2,
                                }}
                            >
                                Legg til medlem
                            </Button>
                        </Box>

                        <List>
                            {team.members?.map((member, index) => (
                                <React.Fragment key={member._id}>
                                    <ListItem
                                        sx={{
                                            borderRadius: 2,
                                            mb: 1,
                                            '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.04)' },
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                sx={{
                                                    bgcolor: member.isLead ? '#F79B72' : '#2A4759',
                                                    width: 48,
                                                    height: 48,
                                                }}
                                            >
                                                {member.name?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="subtitle1" fontWeight="600">
                                                        {member.name}
                                                    </Typography>
                                                    {member.isLead && (
                                                        <Chip
                                                            icon={<Star />}
                                                            label="Team Leder"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: alpha('#F79B72', 0.1),
                                                                color: '#F79B72',
                                                                fontWeight: 500,
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {member.email}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Medlem siden {new Date(member.joinedAt || team.createdAt).toLocaleDateString('no-NO')}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title={member.isLead ? "Fjern som leder" : "Gjør til leder"}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleUpdateMemberRole(member, !member.isLead)}
                                                        sx={{
                                                            color: member.isLead ? '#F79B72' : '#2A4759',
                                                            '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.04)' },
                                                        }}
                                                    >
                                                        <AdminPanelSettings />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Fjern fra team">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveMember(member._id)}
                                                        sx={{
                                                            color: '#f44336',
                                                            '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.04)' },
                                                        }}
                                                    >
                                                        <PersonRemove />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < team.members.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>

                        {(!team.members || team.members.length === 0) && (
                            <Box textAlign="center" py={4}>
                                <Group sx={{ fontSize: 48, color: '#F79B72', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Ingen medlemmer ennå
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Start med å legge til medlemmer i teamet
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<PersonAdd />}
                                    onClick={() => setAddMemberDialogOpen(true)}
                                    sx={{
                                        bgcolor: '#F79B72',
                                        '&:hover': { bgcolor: '#e8895f' },
                                    }}
                                >
                                    Legg til medlem
                                </Button>
                            </Box>
                        )}
                    </CardContent>
                </TabPanel>

                {/* Projects Tab */}
                <TabPanel value={activeTab} index={1}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="600" color="#2A4759" mb={3}>
                            Tildelte Prosjekter
                        </Typography>

                        {projects.length > 0 ? (
                            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Prosjekt</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Rolle</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Tildelt</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {projects.map((project) => (
                                            <TableRow key={project._id}>
                                                <TableCell>
                                                    <Typography variant="subtitle2" fontWeight="600">
                                                        {project.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {project.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={project.role || 'Member'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={project.status || 'Active'}
                                                        size="small"
                                                        color={project.status === 'Active' ? 'success' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Date(project.assignedAt || project.createdAt).toLocaleDateString('no-NO')}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box textAlign="center" py={4}>
                                <Assignment sx={{ fontSize: 48, color: '#F79B72', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Ingen prosjekter tildelt
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Dette teamet er ikke tildelt noen prosjekter ennå
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </TabPanel>

                {/* Activity Tab */}
                <TabPanel value={activeTab} index={2}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="600" color="#2A4759" mb={3}>
                            Team Aktivitet
                        </Typography>
                        <Box textAlign="center" py={4}>
                            <Typography variant="body1" color="text.secondary">
                                Aktivitetslogg kommer snart...
                            </Typography>
                        </Box>
                    </CardContent>
                </TabPanel>
            </Card>

            {/* Add Member Dialog */}
            <Dialog
                open={addMemberDialogOpen}
                onClose={() => setAddMemberDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="600">
                        Legg til medlemmer
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Autocomplete
                            multiple
                            options={availableUsers}
                            getOptionLabel={(option) => `${option.name} (${option.email})`}
                            value={selectedUsers}
                            onChange={(event, newValue) => setSelectedUsers(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Velg brukere"
                                    variant="outlined"
                                    placeholder="Søk etter brukere..."
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setAddMemberDialogOpen(false)}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleAddMembers}
                        variant="contained"
                        disabled={selectedUsers.length === 0 || addMemberMutation.isLoading}
                        sx={{
                            bgcolor: '#F79B72',
                            '&:hover': { bgcolor: '#e8895f' },
                        }}
                    >
                        {addMemberMutation.isLoading ? 'Legger til...' : 'Legg til'}
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

export default TeamDetailView