import React, { useState, useEffect } from 'react'
import {
    Box,
    Card,
    CardContent,
    CardHeader,
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
    AvatarGroup,
} from '@mui/material'
import {
    Add,
    People,
    Person,
    Edit,
    Delete,
    PersonAdd,
    GroupAdd,
    AdminPanelSettings,
    Star,
    Business,
    Close,
    Check,
    Group,
    Assignment,
} from '@mui/icons-material'
import { useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from 'react-query'
import auth from '../auth/auth-helper'
import teamService from '../../services/teamService'
import { getUsers } from '../utils/api-user'
import { updateProject } from '../../services/projectService'

const ProjectTeamManagement = ({ project, onUpdate }) => {
    const theme = useTheme()
    const { id: projectId } = useParams()
    const queryClient = useQueryClient()
    const jwt = auth.isAuthenticated()

    // State management
    const [activeTab, setActiveTab] = useState(0) // 0: Teams, 1: Individual Users
    const [assignTeamDialogOpen, setAssignTeamDialogOpen] = useState(false)
    const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false)
    const [selectedTeams, setSelectedTeams] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([])
    const [teamRole, setTeamRole] = useState('Primary')
    const [userRole, setUserRole] = useState('Developer')
    const [userPermissions, setUserPermissions] = useState('Write')
    const [availableTeams, setAvailableTeams] = useState([])
    const [availableUsers, setAvailableUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    // Fetch available teams and users
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch teams
                const teamsResponse = await teamService.getTeams(jwt.token)
                console.log('🔍 Teams response in ProjectTeamManagement:', teamsResponse)
                if (teamsResponse.success) {
                    console.log('✅ Setting available teams:', teamsResponse.data)
                    setAvailableTeams(teamsResponse.data || [])
                } else {
                    console.error('❌ Teams fetch failed:', teamsResponse)
                }

                // Fetch users
                const usersResponse = await getUsers({ t: jwt.token })
                if (usersResponse.data) {
                    setAvailableUsers(usersResponse.data)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                setSnackbar({ open: true, message: 'Failed to load teams and users', severity: 'error' })
            } finally {
                setLoading(false)
            }
        }

        if (jwt?.token) {
            fetchData()
        }
    }, [jwt.token])

    // Mutations
        const assignTeamMutation = useMutation(
        async ({ teamIds, role }) => {
            // Create assignments with just team IDs (not full objects)
            const teamsToAssign = teamIds.map(teamId => ({
                team: teamId, // ✅ Just the ID - MongoDB will populate when fetched
                role,
                assignedAt: new Date()
            }))

            console.log('🔄 Assigning teams:', teamsToAssign)
            console.log('📋 Current project before mutation:', project)

            const updatedProject = {
                ...project,
                assignedTeams: [
                    ...(project.assignedTeams || []),
                    ...teamsToAssign
                ]
            }

            console.log('📋 Updated project assignedTeams:', updatedProject.assignedTeams)
            console.log('🚀 Sending to backend:', updatedProject)
            return await updateProject(projectId, updatedProject, jwt.token)
        },
        {
            onSuccess: (data) => {
                console.log('🎉 Team assignment success response:', data)
                queryClient.invalidateQueries(['project', projectId])
                setAssignTeamDialogOpen(false)
                setSelectedTeams([])
                // Call onUpdate callback to refresh project data in parent
                onUpdate?.()
                setSnackbar({ open: true, message: 'Team(s) assigned successfully!', severity: 'success' })
            },
            onError: (error) => {
                setSnackbar({ open: true, message: 'Failed to assign team(s)', severity: 'error' })
            }
        }
    )

    const assignUserMutation = useMutation(
        async ({ userIds, role, permissions }) => {
            const updatedProject = {
                ...project,
                teamMembers: [
                    ...(project.teamMembers || []),
                    ...userIds.map(userId => ({
                        user: userId,
                        role,
                        permissions,
                        assignedAt: new Date()
                    }))
                ]
            }
            return await updateProject(projectId, updatedProject, jwt.token)
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['project', projectId])
                setAssignUserDialogOpen(false)
                setSelectedUsers([])
                onUpdate?.()
                setSnackbar({ open: true, message: 'User(s) assigned successfully!', severity: 'success' })
            },
            onError: (error) => {
                setSnackbar({ open: true, message: 'Failed to assign user(s)', severity: 'error' })
            }
        }
    )

    const removeTeamMutation = useMutation(
        async (teamId) => {
            console.log('🗑️ Removing team with ID:', teamId)
            console.log('📋 Current project assignedTeams:', project.assignedTeams)

            const updatedProject = {
                ...project,
                assignedTeams: project.assignedTeams?.filter(assignment => {
                    const assignedTeamId = assignment.team?.id || assignment.team?._id || assignment.team
                    console.log('🔍 Comparing:', assignedTeamId, 'vs', teamId)
                    return assignedTeamId !== teamId
                }) || []
            }

            console.log('✅ Updated assignedTeams:', updatedProject.assignedTeams)
            return await updateProject(projectId, updatedProject, jwt.token)
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['project', projectId])
                onUpdate?.()
                setSnackbar({ open: true, message: 'Team removed successfully!', severity: 'success' })
            },
            onError: (error) => {
                setSnackbar({ open: true, message: 'Failed to remove team', severity: 'error' })
            }
        }
    )

    const removeUserMutation = useMutation(
        async (userId) => {
            const updatedProject = {
                ...project,
                teamMembers: project.teamMembers?.filter(member =>
                    member.user._id !== userId
                ) || []
            }
            return await updateProject(projectId, updatedProject, jwt.token)
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['project', projectId])
                onUpdate?.()
                setSnackbar({ open: true, message: 'User removed successfully!', severity: 'success' })
            },
            onError: (error) => {
                setSnackbar({ open: true, message: 'Failed to remove user', severity: 'error' })
            }
        }
    )

            // Helper functions
    const getAvailableTeams = () => {
        const assignedTeamIds = project.assignedTeams?.map(assignment => {
            // Handle both string IDs and team objects
            if (typeof assignment.team === 'string') {
                return assignment.team
            } else {
                return assignment.team?.id || assignment.team?._id
            }
        }).filter(Boolean) || []

        const filteredTeams = availableTeams.filter(team => {
            const teamId = team?.id || team?._id
            return teamId && !assignedTeamIds.includes(teamId)
        })

        console.log('🔍 Available teams filtering:', {
            assignedTeamIds,
            allTeams: availableTeams.length,
            filteredTeams: filteredTeams.length,
            projectAssignedTeams: project.assignedTeams,
            projectId
        })

        return filteredTeams
    }

    const getAvailableUsers = () => {
        const assignedUserIds = project.teamMembers?.map(member => member.user?._id).filter(Boolean) || []
        // Also exclude users who are already in assigned teams
        const teamUserIds = project.assignedTeams?.flatMap(assignment =>
            assignment.team?.members?.map(member => member.user?._id).filter(Boolean) || []
        ) || []
        const excludedIds = [...assignedUserIds, ...teamUserIds]
        return availableUsers.filter(user => user?._id && !excludedIds.includes(user._id))
    }

    const handleAssignTeams = () => {
        if (selectedTeams.length > 0) {
            assignTeamMutation.mutate({
                teamIds: selectedTeams.map(team => team.id || team._id),
                role: teamRole
            })
        }
    }

    const handleAssignUsers = () => {
        if (selectedUsers.length > 0) {
            assignUserMutation.mutate({
                userIds: selectedUsers.map(user => user.id || user._id),
                role: userRole,
                permissions: userPermissions
            })
        }
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'Primary': return '#F79B72'
            case 'Support': return '#2A4759'
            case 'Consulting': return '#9C27B0'
            case 'Manager': return '#F44336'
            case 'Team Lead': return '#FF9800'
            default: return '#999999'
        }
    }

    const getPermissionColor = (permission) => {
        switch (permission) {
            case 'Admin': return '#F44336'
            case 'Write': return '#F79B72'
            case 'Read': return '#9E9E9E'
            default: return '#999999'
        }
    }

    return (
        <Box>
            {/* Header */}
            <Card sx={{ mb: 3, borderRadius: 2 }}>
                <CardHeader
                    title={
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <People sx={{ color: '#F79B72', fontSize: 28 }} />
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#2A4759' }}>
                                Team Management
                            </Typography>
                        </Stack>
                    }
                    action={
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={<GroupAdd />}
                                onClick={() => setAssignTeamDialogOpen(true)}
                                disabled={getAvailableTeams().length === 0}
                                sx={{
                                    borderColor: '#F79B72',
                                    color: '#F79B72',
                                    '&:hover': {
                                        borderColor: '#e8895f',
                                        bgcolor: 'rgba(247, 155, 114, 0.04)'
                                    }
                                }}
                            >
                                ASSIGN TEAM ({getAvailableTeams().length} AVAILABLE)
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<PersonAdd />}
                                onClick={() => setAssignUserDialogOpen(true)}
                                disabled={getAvailableUsers().length === 0}
                                sx={{
                                    bgcolor: '#F79B72',
                                    '&:hover': { bgcolor: '#e8895f' }
                                }}
                            >
                                Add User
                            </Button>
                        </Stack>
                    }
                    sx={{ bgcolor: alpha('#F79B72', 0.02) }}
                />
            </Card>

            {/* Tabs */}
            <Card sx={{ borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        sx={{
                            '& .MuiTab-root.Mui-selected': {
                                color: '#F79B72'
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#F79B72'
                            }
                        }}
                    >
                        <Tab
                            icon={<Group />}
                            label={`Assigned Teams (${project.assignedTeams?.length || 0})`}
                            iconPosition="start"
                        />
                        <Tab
                            icon={<Person />}
                            label={`Individual Users (${project.teamMembers?.filter(member => member?.user).length || 0})`}
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                <CardContent sx={{ p: 0 }}>
                    {/* Teams Tab */}
                    {activeTab === 0 && (
                        <Box sx={{ p: 3 }}>
                            {project.assignedTeams?.length > 0 ? (
                                <Grid container spacing={3}>
                                    {project.assignedTeams.map((assignment, index) => {
                                        console.log('🔍 Assignment data:', assignment)

                                        // Handle case where assignment.team is just an ID string
                                        let teamData
                                        if (typeof assignment.team === 'string') {
                                            // Find the full team object from availableTeams or previously fetched teams
                                            teamData = availableTeams.find(team =>
                                                (team.id || team._id) === assignment.team
                                            ) || {
                                                id: assignment.team,
                                                name: 'Unknown Team',
                                                description: 'Team data not available',
                                                members: []
                                            }
                                        } else {
                                            // assignment.team is already a full object
                                            teamData = assignment.team
                                        }

                                        const teamId = teamData.id || teamData._id || assignment.team

                                        return (
                                        <Grid item xs={12} md={6} key={teamId || index}>
                                            <Card sx={{
                                                borderRadius: 2,
                                                border: '1px solid rgba(221, 221, 221, 0.3)',
                                                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                                            }}>
                                                <CardContent>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                        <Box>
                                                            <Typography variant="h6" fontWeight="600" sx={{ color: '#2A4759' }}>
                                                                {teamData.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {teamData.description}
                                                            </Typography>
                                                        </Box>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeTeamMutation.mutate(teamId)}
                                                            sx={{ color: '#F44336' }}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Stack>

                                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                                                        <Chip
                                                            label={assignment.role}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: alpha(getRoleColor(assignment.role), 0.1),
                                                                color: getRoleColor(assignment.role),
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {teamData.members?.length || 0} members
                                                        </Typography>
                                                    </Stack>

                                                    <AvatarGroup max={6}>
                                                        {teamData.members?.filter(member => member?.user).map((member, memberIndex) => (
                                                            <Tooltip
                                                                key={member.user._id || member.user.id || memberIndex}
                                                                title={`${member.user.name || 'Unknown User'} ${member.isLead ? '(Lead)' : ''}`}
                                                            >
                                                                <Avatar
                                                                    sx={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        bgcolor: member.isLead ? '#F79B72' : '#2A4759',
                                                                        fontSize: '0.75rem'
                                                                    }}
                                                                >
                                                                    {member.user.name?.charAt(0)?.toUpperCase() || '?'}
                                                                </Avatar>
                                                            </Tooltip>
                                                        ))}
                                                    </AvatarGroup>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        )
                                    })}
                                </Grid>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Group sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No teams assigned
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" mb={3}>
                                        Assign teams to give entire groups access to this project
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<GroupAdd />}
                                        onClick={() => setAssignTeamDialogOpen(true)}
                                        disabled={getAvailableTeams().length === 0}
                                        sx={{
                                            bgcolor: '#F79B72',
                                            '&:hover': { bgcolor: '#e8895f' }
                                        }}
                                    >
                                        Assign First Team
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Individual Users Tab */}
                    {activeTab === 1 && (
                        <Box sx={{ p: 3 }}>
                            {project.teamMembers?.length > 0 ? (
                                <List>
                                    {project.teamMembers.filter(member => member?.user).map((member, index) => (
                                        <ListItem
                                            key={member.user._id || index}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                border: '1px solid rgba(221, 221, 221, 0.3)',
                                                '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.04)' }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: '#2A4759',
                                                        width: 40,
                                                        height: 40
                                                    }}
                                                >
                                                    {member.user.name?.charAt(0)?.toUpperCase() || '?'}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Typography variant="subtitle1" fontWeight="500">
                                                            {member.user.name || 'Unknown User'}
                                                        </Typography>
                                                        <Chip
                                                            label={member.role}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: alpha(getRoleColor(member.role), 0.1),
                                                                color: getRoleColor(member.role),
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                        <Chip
                                                            label={member.permissions}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                borderColor: getPermissionColor(member.permissions),
                                                                color: getPermissionColor(member.permissions)
                                                            }}
                                                        />
                                                    </Stack>
                                                }
                                                secondary={member.user.email || 'No email'}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => removeUserMutation.mutate(member.user._id)}
                                                    sx={{ color: '#F44336' }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Person sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No individual users assigned
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" mb={3}>
                                        Add individual users for specific roles or external collaboration
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<PersonAdd />}
                                        onClick={() => setAssignUserDialogOpen(true)}
                                        disabled={getAvailableUsers().length === 0}
                                        sx={{
                                            bgcolor: '#F79B72',
                                            '&:hover': { bgcolor: '#e8895f' }
                                        }}
                                    >
                                        Add First User
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Assign Team Dialog */}
            <Dialog open={assignTeamDialogOpen} onClose={() => setAssignTeamDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <GroupAdd sx={{ color: '#F79B72' }} />
                        <Typography variant="h6">Assign Teams to Project</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={getAvailableTeams()}
                                getOptionLabel={(team) => team?.name || 'Unknown Team'}
                                value={selectedTeams}
                                onChange={(e, newValue) => setSelectedTeams(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Teams"
                                        placeholder="Choose teams to assign..."
                                        sx={{
                                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#F79B72'
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#F79B72'
                                            }
                                        }}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={option.id || option._id || index}
                                            label={option.name}
                                            sx={{
                                                bgcolor: alpha('#F79B72', 0.1),
                                                color: '#2A4759'
                                            }}
                                        />
                                    ))
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Team Role</InputLabel>
                                <Select
                                    value={teamRole}
                                    label="Team Role"
                                    onChange={(e) => setTeamRole(e.target.value)}
                                >
                                    <MenuItem value="Primary">Primary Team</MenuItem>
                                    <MenuItem value="Support">Support Team</MenuItem>
                                    <MenuItem value="Consulting">Consulting Team</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignTeamDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleAssignTeams}
                        variant="contained"
                        disabled={selectedTeams.length === 0 || assignTeamMutation.isLoading}
                        sx={{
                            bgcolor: '#F79B72',
                            '&:hover': { bgcolor: '#e8895f' }
                        }}
                    >
                        {assignTeamMutation.isLoading ? <CircularProgress size={24} /> : 'Assign Teams'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Assign User Dialog */}
            <Dialog open={assignUserDialogOpen} onClose={() => setAssignUserDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <PersonAdd sx={{ color: '#F79B72' }} />
                        <Typography variant="h6">Add Individual Users</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={getAvailableUsers()}
                                getOptionLabel={(user) => `${user?.name || 'Unknown User'} (${user?.email || 'No email'})`}
                                value={selectedUsers}
                                onChange={(e, newValue) => setSelectedUsers(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Users"
                                        placeholder="Choose users to add..."
                                        sx={{
                                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#F79B72'
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#F79B72'
                                            }
                                        }}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={option.id || option._id || index}
                                            label={option.name}
                                            sx={{
                                                bgcolor: alpha('#F79B72', 0.1),
                                                color: '#2A4759'
                                            }}
                                        />
                                    ))
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={userRole}
                                    label="Role"
                                    onChange={(e) => setUserRole(e.target.value)}
                                >
                                    <MenuItem value="Manager">Manager</MenuItem>
                                    <MenuItem value="Developer">Developer</MenuItem>
                                    <MenuItem value="Tester">Tester</MenuItem>
                                    <MenuItem value="Designer">Designer</MenuItem>
                                    <MenuItem value="Consultant">Consultant</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Permissions</InputLabel>
                                <Select
                                    value={userPermissions}
                                    label="Permissions"
                                    onChange={(e) => setUserPermissions(e.target.value)}
                                >
                                    <MenuItem value="Admin">Admin (Full Access)</MenuItem>
                                    <MenuItem value="Write">Write (Edit Issues)</MenuItem>
                                    <MenuItem value="Read">Read (View Only)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignUserDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleAssignUsers}
                        variant="contained"
                        disabled={selectedUsers.length === 0 || assignUserMutation.isLoading}
                        sx={{
                            bgcolor: '#F79B72',
                            '&:hover': { bgcolor: '#e8895f' }
                        }}
                    >
                        {assignUserMutation.isLoading ? <CircularProgress size={24} /> : 'Add Users'}
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

export default ProjectTeamManagement