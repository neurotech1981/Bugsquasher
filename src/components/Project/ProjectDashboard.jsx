import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    CircularProgress,
    LinearProgress,
    Stack,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    useTheme,
    alpha,
    AvatarGroup,
    Fab,
    Tabs,
    Tab,
} from '@mui/material'
import {
    ArrowBack,
    Assignment,
    BugReport,
    Schedule,
    CheckCircle,
    Person,
    CalendarToday,
    Timeline,
    Edit,
    Add,
    FilterList,
    MoreVert,
    Visibility,
    Group,
    TrendingUp,
    Warning,
    PriorityHigh,
    Info,
    Error,
    Assignment as AssignmentIcon,
    Dashboard,
    People,
} from '@mui/icons-material'
import moment from 'moment'
import { Line, Doughnut } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
} from 'chart.js'

import { getProject } from '../../services/projectService'
import issueService from '../../services/issueService'
import auth from '../auth/auth-helper'
import ProjectTeamManagement from './ProjectTeamManagement'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    ChartTooltip,
    Legend
)

const ProjectDashboard = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const theme = useTheme()
    const jwt = auth.isAuthenticated()

    // State management
    const [project, setProject] = useState(null)
    const [projectIssues, setProjectIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [issuesLoading, setIssuesLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [statusFilter, setStatusFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')
    const [assignIssueDialogOpen, setAssignIssueDialogOpen] = useState(false)
    const [selectedIssue, setSelectedIssue] = useState(null)
    const [newAssignee, setNewAssignee] = useState('')
    const [activeTab, setActiveTab] = useState(0) // 0: Dashboard, 1: Team Management

        // Fetch data when component mounts or id changes
    useEffect(() => {
        const fetchData = async () => {
            if (!id || !jwt) return

            try {
                setLoading(true)
                setIssuesLoading(true)

                // Fetch project data
                const projectResponse = await getProject({ t: jwt.token }, id)

                if (projectResponse.error) {
                    setError(projectResponse.error)
                    return
                }

                const projectData = projectResponse.data || projectResponse
                setProject(projectData)
                setLoading(false)

                // Fetch issues for this project
                const issuesResponse = await issueService.getAll(jwt.token, 1, 10000)
                const allIssues = issuesResponse.data || []

                // Filter issues that belong to this project
                const filteredIssues = allIssues.filter(issue =>
                    issue.project === id || issue.project?._id === id
                )

                setProjectIssues(filteredIssues)
                setIssuesLoading(false)

            } catch (err) {
                console.error('Error fetching project data:', err)
                setError('Failed to load project data')
                setLoading(false)
                setIssuesLoading(false)
            }
        }

        fetchData()
    }, [id]) // Only depend on id, not jwt object

    // Calculate project statistics
    const getProjectStats = () => {
        if (!projectIssues.length) {
            return {
                total: 0,
                open: 0,
                solved: 0,
                critical: 0,
                completionRate: 0,
                overdue: 0
            }
        }

        const total = projectIssues.length
        const open = projectIssues.filter(issue => issue.status === 'Åpen' || issue.status === 'Under arbeid').length
        const solved = projectIssues.filter(issue => issue.status === 'Løst' || issue.status === 'Lukket').length
        const critical = projectIssues.filter(issue =>
            issue.priority === 'Høy' || issue.priority === 'Øyeblikkelig' || issue.priority === 'Haster'
        ).length
        const completionRate = total > 0 ? Math.round((solved / total) * 100) : 0

        // Mock overdue calculation - you can implement real logic based on due dates
        const overdue = Math.floor(open * 0.2)

        return {
            total,
            open,
            solved,
            critical,
            completionRate,
            overdue
        }
    }

    const stats = getProjectStats()

    // Filter issues based on filters
    const filteredIssues = projectIssues.filter(issue => {
        const matchesStatus = !statusFilter || issue.status === statusFilter
        const matchesPriority = !priorityFilter || issue.priority === priorityFilter
        return matchesStatus && matchesPriority
    })

    // Paginate issues
    const startIndex = page * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedIssues = filteredIssues.slice(startIndex, endIndex)

    // Helper functions
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'øyeblikkelig':
            case 'critical': return '#F44336'
            case 'høy':
            case 'high': return '#F79B72'
            case 'haster':
            case 'urgent': return '#FF9800'
            case 'normal':
            case 'medium': return '#2A4759'
            case 'lav':
            case 'low': return '#4CAF50'
            default: return '#999999'
        }
    }

    const getPriorityIcon = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'øyeblikkelig':
            case 'critical': return <Error fontSize="small" />
            case 'høy':
            case 'high': return <PriorityHigh fontSize="small" />
            case 'haster':
            case 'urgent': return <Warning fontSize="small" />
            case 'normal':
            case 'medium': return <Info fontSize="small" />
            default: return <Info fontSize="small" />
        }
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'åpen': return '#F79B72'
            case 'løst': return '#4CAF50'
            case 'lukket': return '#9E9E9E'
            case 'under arbeid': return '#2A4759'
            default: return '#999999'
        }
    }

    const getStatusChip = (status) => {
        const statusMap = {
            'Åpen': { color: '#F79B72', icon: '🔓' },
            'Løst': { color: '#4CAF50', icon: '✅' },
            'Lukket': { color: '#9E9E9E', icon: '🔐' },
            'Under arbeid': { color: '#2A4759', icon: '👷' }
        }
        return statusMap[status] || { color: '#999999', icon: '❓' }
    }

    // Chart data for project progress
    const getProgressChartData = () => {
        return {
            labels: ['Løst', 'Åpen', 'Under arbeid', 'Lukket'],
            datasets: [{
                data: [
                    projectIssues.filter(i => i.status === 'Løst').length,
                    projectIssues.filter(i => i.status === 'Åpen').length,
                    projectIssues.filter(i => i.status === 'Under arbeid').length,
                    projectIssues.filter(i => i.status === 'Lukket').length,
                ],
                backgroundColor: ['#4CAF50', '#F79B72', '#2A4759', '#9E9E9E'],
                borderWidth: 0
            }]
        }
    }

    const handleCreateIssue = () => {
        navigate(`/ny-sak?project=${id}`)
    }

    const handleViewIssue = (issueId) => {
        navigate(`/vis-sak/${issueId}`)
    }

    const handleEditProject = () => {
        navigate(`/rediger-prosjekt/${id}`)
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
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <CircularProgress sx={{ color: '#F79B72' }} size={48} />
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{
                marginLeft: { xs: 0, sm: '288px' },
                marginTop: { xs: '72px', sm: '80px' },
                width: { xs: '100%', sm: 'calc(100% - 288px)' },
                minHeight: { xs: 'calc(100vh - 72px)', sm: 'calc(100vh - 80px)' },
                bgcolor: '#EEEEEE',
                p: { xs: 2, md: 3 }
            }}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                        ⚠️ Feil ved lasting av prosjekt
                    </Typography>
                    <Typography color="text.secondary">{error}</Typography>
                    <Button onClick={() => navigate('/prosjekt-oversikt')} sx={{ mt: 2 }}>
                        Tilbake til prosjektoversikt
                    </Button>
                </Paper>
            </Box>
        )
    }

    if (!project) {
        return (
            <Box sx={{
                marginLeft: { xs: 0, sm: '288px' },
                marginTop: { xs: '72px', sm: '80px' },
                width: { xs: '100%', sm: 'calc(100% - 288px)' },
                minHeight: { xs: 'calc(100vh - 72px)', sm: 'calc(100vh - 80px)' },
                bgcolor: '#EEEEEE',
                p: { xs: 2, md: 3 }
            }}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Prosjekt ikke funnet
                    </Typography>
                    <Button onClick={() => navigate('/prosjekt-oversikt')}>
                        Tilbake til prosjektoversikt
                    </Button>
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
            {/* Header */}
            <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton onClick={() => navigate('/prosjekt-oversikt')} color="primary">
                            <ArrowBack />
                        </IconButton>
                        <AssignmentIcon sx={{ color: '#F79B72', fontSize: 40 }} />
                        <Box>
                            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: '#2A4759' }}>
                                {project.name}
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                {project.description}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={handleEditProject}
                            sx={{
                                borderColor: '#F79B72',
                                color: '#F79B72',
                                '&:hover': {
                                    borderColor: '#e8895f',
                                    bgcolor: 'rgba(247, 155, 114, 0.04)'
                                }
                            }}
                        >
                            Rediger
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleCreateIssue}
                            sx={{
                                bgcolor: '#F79B72',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#e8895f'
                                }
                            }}
                        >
                            Ny sak
                        </Button>
                    </Stack>
                </Stack>

                {/* Project Details */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <CalendarToday sx={{ color: '#2A4759' }} />
                            <Box>
                                <Typography variant="body2" color="textSecondary">
                                    Start - Slutt
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                    {moment(project.startDate).format('DD.MM.YYYY')} - {moment(project.endDate).format('DD.MM.YYYY')}
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Timeline sx={{ color: '#2A4759' }} />
                            <Box>
                                <Typography variant="body2" color="textSecondary">
                                    Status
                                </Typography>
                                <Chip
                                    label={project.status}
                                    size="small"
                                    sx={{
                                        bgcolor: project.status === 'Done' ? '#4CAF50' :
                                                project.status === 'In progress' ? '#F79B72' : '#9E9E9E',
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Group sx={{ color: '#2A4759' }} />
                            <Box>
                                <Typography variant="body2" color="textSecondary">
                                    Teams & Members
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    {/* Assigned Teams */}
                                    {project.assignedTeams?.map((assignment, index) => (
                                        <Chip
                                            key={assignment.team._id || index}
                                            label={assignment.team.name}
                                            size="small"
                                            icon={<Group />}
                                            sx={{
                                                bgcolor: alpha('#2A4759', 0.1),
                                                color: '#2A4759',
                                                fontWeight: 600,
                                                mb: 0.5
                                            }}
                                        />
                                    ))}

                                    {/* Individual Members */}
                                    <AvatarGroup max={3} sx={{ ml: 1 }}>
                                        {project.teamMembers?.map((member, index) => (
                                            <Avatar
                                                key={member.user?._id || member._id || index}
                                                sx={{
                                                    bgcolor: '#F79B72',
                                                    width: 24,
                                                    height: 24,
                                                    fontSize: '0.75rem'
                                                }}
                                                title={member.user?.name || member.name}
                                            >
                                                {(member.user?.name || member.name)?.charAt(0).toUpperCase() || 'U'}
                                            </Avatar>
                                        ))}
                                    </AvatarGroup>

                                    {(!project.assignedTeams?.length && !project.teamMembers?.length) && (
                                        <Typography variant="caption" color="textSecondary">
                                            No teams assigned
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Navigation Tabs */}
            <Paper elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
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
                        icon={<Dashboard />}
                        label="Project Dashboard"
                        iconPosition="start"
                        sx={{
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 500
                        }}
                    />
                    <Tab
                        icon={<People />}
                        label="Team Management"
                        iconPosition="start"
                        sx={{
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 500
                        }}
                    />
                </Tabs>
            </Paper>

            {activeTab === 0 && (
                <>
                    {/* Statistics Cards */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} lg={3}>
                    <Card sx={{ borderRadius: 2, borderLeft: '4px solid #2A4759' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" color="#2A4759">
                                        {stats.total}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Totale saker
                                    </Typography>
                                </Box>
                                <Assignment sx={{ color: '#2A4759', fontSize: 40 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <Card sx={{ borderRadius: 2, borderLeft: '4px solid #F79B72' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" color="#F79B72">
                                        {stats.open}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Åpne saker
                                    </Typography>
                                </Box>
                                <Schedule sx={{ color: '#F79B72', fontSize: 40 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <Card sx={{ borderRadius: 2, borderLeft: '4px solid #4CAF50' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" color="#4CAF50">
                                        {stats.solved}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Løste saker
                                    </Typography>
                                </Box>
                                <CheckCircle sx={{ color: '#4CAF50', fontSize: 40 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <Card sx={{ borderRadius: 2, borderLeft: '4px solid #FF5722' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" color="#FF5722">
                                        {stats.critical}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Kritiske saker
                                    </Typography>
                                </Box>
                                <BugReport sx={{ color: '#FF5722', fontSize: 40 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Progress Overview */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: '#2A4759' }}>
                                Prosjektfremgang
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="body2" color="textSecondary">
                                        Fullføring
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" color="#2A4759">
                                        {stats.completionRate}%
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats.completionRate}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: alpha('#F79B72', 0.2),
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: '#F79B72',
                                            borderRadius: 4
                                        }
                                    }}
                                />
                            </Box>
                            <Stack direction="row" spacing={4}>
                                <Box>
                                    <Typography variant="body2" color="textSecondary">
                                        Tidsfrist
                                    </Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {moment(project.endDate).fromNow()}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="textSecondary">
                                        Dager igjen
                                    </Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {moment(project.endDate).diff(moment(), 'days')} dager
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: '#2A4759' }}>
                                Status fordeling
                            </Typography>
                            <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {projectIssues.length > 0 ? (
                                    <Doughnut
                                        data={getProgressChartData()}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        usePointStyle: true,
                                                        padding: 20
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        Ingen saker ennå
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Issues Table */}
            <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#2A4759' }}>
                            Prosjektsaker ({filteredIssues.length})
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="">Alle</MenuItem>
                                    <MenuItem value="Åpen">Åpen</MenuItem>
                                    <MenuItem value="Løst">Løst</MenuItem>
                                    <MenuItem value="Lukket">Lukket</MenuItem>
                                    <MenuItem value="Under arbeid">Under arbeid</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Prioritet</InputLabel>
                                <Select
                                    value={priorityFilter}
                                    label="Prioritet"
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                >
                                    <MenuItem value="">Alle</MenuItem>
                                    <MenuItem value="Øyeblikkelig">Øyeblikkelig</MenuItem>
                                    <MenuItem value="Høy">Høy</MenuItem>
                                    <MenuItem value="Normal">Normal</MenuItem>
                                    <MenuItem value="Haster">Haster</MenuItem>
                                    <MenuItem value="Lav">Lav</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Stack>

                    {issuesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress sx={{ color: '#F79B72' }} />
                        </Box>
                    ) : filteredIssues.length === 0 ? (
                        <Box sx={{ textAlign: 'center', p: 4 }}>
                            <AssignmentIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                            <Typography variant="h6" color="textSecondary" mb={1}>
                                Ingen saker funnet
                            </Typography>
                            <Typography variant="body2" color="textSecondary" mb={3}>
                                Dette prosjektet har ingen saker ennå, eller ingen matcher filterkriteriene.
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleCreateIssue}
                                sx={{
                                    bgcolor: '#F79B72',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: '#e8895f'
                                    }
                                }}
                            >
                                Opprett første sak
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, color: '#2A4759' }}>ID</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2A4759' }}>Sammendrag</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2A4759' }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2A4759' }}>Prioritet</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2A4759' }}>Tildelt</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2A4759' }}>Opprettet</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2A4759' }}>Handlinger</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedIssues.map((issue) => (
                                            <TableRow
                                                key={issue._id}
                                                sx={{
                                                    '&:hover': {
                                                        bgcolor: 'rgba(247, 155, 114, 0.04)',
                                                        cursor: 'pointer'
                                                    }
                                                }}
                                                onClick={() => handleViewIssue(issue._id)}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" fontFamily="monospace">
                                                        #{issue._id?.slice(-8)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {issue.summary}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {issue.category}
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
                                                        icon={getPriorityIcon(issue.priority)}
                                                        label={issue.priority || 'Normal'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(getPriorityColor(issue.priority), 0.1),
                                                            color: getPriorityColor(issue.priority),
                                                            fontWeight: 500
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {issue.delegated ? (
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Avatar
                                                                sx={{
                                                                    bgcolor: '#F79B72',
                                                                    width: 24,
                                                                    height: 24,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            >
                                                                {issue.delegated.name?.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <Typography variant="body2">
                                                                {issue.delegated.name}
                                                            </Typography>
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="body2" color="textSecondary">
                                                            Ikke tildelt
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {moment(issue.createdAt).format('DD.MM.YYYY')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleViewIssue(issue._id)
                                                        }}
                                                        sx={{ color: '#F79B72' }}
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={filteredIssues.length}
                                page={page}
                                onPageChange={(e, newPage) => setPage(newPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10))
                                    setPage(0)
                                }}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                labelRowsPerPage="Rader per side:"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} av ${count !== -1 ? count : `mer enn ${to}`}`
                                }
                            />
                        </>
                    )}
                </CardContent>
            </Card>
                </>
            )}

            {activeTab === 1 && (
                <ProjectTeamManagement
                    project={project}
                    onUpdate={() => {
                        // Refresh project data when team assignments change
                        const fetchData = async () => {
                            if (!id || !jwt) return
                            try {
                                const projectResponse = await getProject({ t: jwt.token }, id)
                                if (!projectResponse.error) {
                                    const projectData = projectResponse.data || projectResponse
                                    setProject(projectData)
                                }
                            } catch (err) {
                                console.error('Error refreshing project data:', err)
                            }
                        }
                        fetchData()
                    }}
                />
            )}

            {/* Floating Action Button */}
            <Fab
                color="primary"
                aria-label="add"
                onClick={handleCreateIssue}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    bgcolor: '#F79B72',
                    '&:hover': {
                        bgcolor: '#e8895f'
                    }
                }}
            >
                <Add />
            </Fab>
        </Box>
    )
}

export default ProjectDashboard