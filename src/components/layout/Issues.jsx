import React, { useState, useEffect } from 'react'
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Avatar,
    TextField,
    InputAdornment,
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
    Fade,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Skeleton,
    useTheme,
    alpha,
    Divider,
    Container,
    Menu,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Alert,
} from '@mui/material'
import {
    Search,
    Add,
    FilterList,
    MoreVert,
    BugReport,
    Assignment,
    Schedule,
    CheckCircle,
    Refresh,
    KeyboardArrowUp,
    KeyboardArrowDown,
    Remove,
    PriorityHigh,
    Warning,
    Info,
    Error,
    Visibility,
    Edit,
    Delete,
    ContentCopy,
} from '@mui/icons-material'
import issueService from '../../services/issueService'
import { getProjects } from '../../services/projectService'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import auth from '../auth/auth-helper'

const Issues = () => {
    const theme = useTheme()
    const navigate = useNavigate()

    // State management
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')
    const [projectFilter, setProjectFilter] = useState('')
    const [sortField, setSortField] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')
    const [projects, setProjects] = useState([])
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedIssue, setSelectedIssue] = useState(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

        // Fetch all issues (no server-side pagination for filtering)
    const fetchIssues = async () => {
        const jwt = auth.isAuthenticated()

        if (!jwt) {
            throw new Error('Not authenticated')
        }

        try {
            // Fetch all issues for client-side filtering and pagination
            const res = await issueService.getAll(jwt.token, 1, 50000) // Much larger limit to get all
            return res
        } catch (error) {
            console.error('Error fetching issues:', error)
            throw error
        }
    }

        // Fetch total count separately
    const fetchTotalCount = async () => {
        const jwt = auth.isAuthenticated()
        if (!jwt) throw new Error('Not authenticated')

        try {
            const res = await issueService.countIssues(jwt.token)
            return res.data
        } catch (error) {
            console.error('Error fetching total count:', error)
            throw error
        }
    }

    // React Query hooks
    const { data, error, isLoading, refetch } = useQuery(
        ['issues'],
        fetchIssues,
        {
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 3,
            onError: (err) => {
                console.error('Query error:', err)
                if (err.message === 'Not authenticated') {
                    navigate('/signin')
                }
            },
        }
    )

    const { data: totalCount } = useQuery(
        ['issues-total-count'],
        fetchTotalCount,
        {
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
        }
    )

    // Get statistics from data
    const getStatistics = () => {
        if (!data?.data) return { total: 0, open: 0, solved: 0, critical: 0 }

        const issues = data.data
        return {
            total: issues.length,
            open: issues.filter(issue => issue.status === 'Åpen').length,
            solved: issues.filter(issue => issue.status === 'Løst').length,
            critical: issues.filter(issue => issue.priority === 'Høy' || issue.priority === 'Øyeblikkelig').length,
        }
    }

    const stats = getStatistics()

    // Fetch projects for filter dropdown
    useEffect(() => {
        const fetchProjects = async () => {
            const jwt = auth.isAuthenticated()
            if (!jwt) return

            try {
                const response = await getProjects(jwt.token)
                if (response.success && response.data) {
                    setProjects(response.data)
                }
            } catch (error) {
                console.error('Error fetching projects:', error)
            }
        }

        fetchProjects()
    }, [])

    // Reset page when filters change
    useEffect(() => {
        setPage(0)
    }, [searchTerm, statusFilter, priorityFilter, projectFilter])

    // Filter issues based on search term and filters
    const filteredIssues = data?.data?.filter(issue => {
        const matchesSearch = !searchTerm ||
            issue.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.category?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = !statusFilter || issue.status === statusFilter
        const matchesPriority = !priorityFilter || issue.priority === priorityFilter
        const matchesProject = !projectFilter ||
            issue.project === projectFilter ||
            issue.project?._id === projectFilter

        return matchesSearch && matchesStatus && matchesPriority && matchesProject
    }) || []

    // Sort issues
    const sortedIssues = [...filteredIssues].sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (sortField === 'createdAt') {
            const aDate = new Date(aValue)
            const bDate = new Date(bValue)
            return sortOrder === 'desc' ? bDate - aDate : aDate - bDate
        }

        if (typeof aValue === 'string') {
            return sortOrder === 'desc'
                ? bValue.localeCompare(aValue)
                : aValue.localeCompare(bValue)
        }

        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

    // Paginate sorted issues
    const startIndex = page * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedIssues = sortedIssues.slice(startIndex, endIndex)

    // Helper functions
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'øyeblikkelig':
            case 'critical':
            case 'kritisk': return '#d9774c'
            case 'høy':
            case 'high': return '#F79B72'
            case 'haster':
            case 'urgent': return '#e8895f'
            case 'normal':
            case 'medium': return '#2A4759'
            case 'lav':
            case 'low': return '#1e3440'
                        default:
                return '#999999'
        }
    }

    const getPriorityIcon = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'øyeblikkelig':
            case 'critical':
            case 'kritisk': return <Error fontSize="small" />
            case 'høy':
            case 'high': return <PriorityHigh fontSize="small" />
            case 'haster':
            case 'urgent': return <Warning fontSize="small" />
            case 'normal':
            case 'medium': return <Info fontSize="small" />
            case 'lav':
            case 'low': return <CheckCircle fontSize="small" />
                        default:
                return <Remove fontSize="small" />
        }
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'åpen': return '#F79B72'
            case 'løst': return '#2A4759'
            case 'lukket': return '#DDDDDD'
            case 'under arbeid': return '#e8895f'
            default: return '#999999'
        }
    }

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('desc')
        }
    }

    const handleAddNewIssue = () => {
        const jwt = auth.isAuthenticated()
        if (jwt && jwt.user) {
            navigate(`/legg-til-sak/${jwt.user._id}`)
        }
    }

    // Actions menu handlers
    const handleActionsClick = (event, issue) => {
        event.stopPropagation()
        setAnchorEl(event.currentTarget)
        setSelectedIssue(issue)
    }

    const handleActionsClose = () => {
        setAnchorEl(null)
        setSelectedIssue(null)
    }

    const handleViewIssue = () => {
        if (selectedIssue) {
            navigate(`/vis-sak/${selectedIssue._id}`)
        }
        handleActionsClose()
    }

    const handleEditIssue = () => {
        if (selectedIssue) {
            navigate(`/edit-issue/${selectedIssue._id}`)
        }
        handleActionsClose()
    }

    const handleDeleteIssue = () => {
        setDeleteDialogOpen(true)
        // Don't call handleActionsClose() here - we need selectedIssue for the dialog
        setAnchorEl(null) // Just close the menu, keep selectedIssue
    }

        const handleDeleteConfirm = async () => {
        console.log('handleDeleteConfirm called', selectedIssue)

        if (!selectedIssue) {
            console.log('No selected issue')
            return
        }

        console.log('Starting delete process for issue:', selectedIssue._id)
        setDeleteLoading(true)

        try {
            const jwt = auth.isAuthenticated()
            console.log('JWT token:', jwt ? 'exists' : 'missing')

            if (!jwt) {
                throw new Error('Not authenticated')
            }

            console.log('Calling deleteIssueByID with:', selectedIssue._id, jwt.token)
            const result = await issueService.deleteIssueByID(selectedIssue._id, jwt.token)
            console.log('Delete result:', result)

            setSnackbar({
                open: true,
                message: 'Saken ble slettet',
                severity: 'success'
            })

            // Refresh the data
            console.log('Refetching data...')
            refetch()

        } catch (error) {
            console.error('Error deleting issue:', error)
            setSnackbar({
                open: true,
                message: 'Feil ved sletting av sak: ' + (error.message || 'Ukjent feil'),
                severity: 'error'
            })
        } finally {
            console.log('Cleaning up delete state')
            setDeleteLoading(false)
            setDeleteDialogOpen(false)
            setSelectedIssue(null)
        }
    }

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false)
        setSelectedIssue(null)
    }

    const handleCopyIssue = () => {
        if (selectedIssue) {
            // TODO: Implement copy to clipboard functionality
            navigator.clipboard.writeText(`${window.location.origin}/vis-sak/${selectedIssue._id}`)
            console.log('Copied issue link to clipboard')
        }
        handleActionsClose()
    }

    // Actions Menu Component
    const ActionsMenu = () => (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleActionsClose}
            onClick={(e) => e.stopPropagation()}
            PaperProps={{
                elevation: 3,
                sx: {
                    mt: 1,
                    bgcolor: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    minWidth: 160,
                    '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1.5,
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                        color: '#333333',
                        fontSize: '0.875rem',
                        '&:hover': {
                            bgcolor: '#f5f5f5',
                            color: '#000000',
                        },
                    },
                    '& .MuiListItemIcon-root': {
                        color: '#666666',
                        minWidth: 36,
                    },
                    '& .MuiListItemText-root': {
                        color: '#333333',
                        '& .MuiTypography-root': {
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#333333',
                        },
                    },
                    '& .MuiDivider-root': {
                        bgcolor: '#e0e0e0',
                        mx: 1,
                    },
                },
            }}
        >
            <MenuItem onClick={handleViewIssue}>
                <ListItemIcon>
                    <Visibility fontSize="small" sx={{ color: '#666666' }} />
                </ListItemIcon>
                <ListItemText primary="Vis detaljer" />
            </MenuItem>
            <MenuItem onClick={handleEditIssue}>
                <ListItemIcon>
                    <Edit fontSize="small" sx={{ color: '#666666' }} />
                </ListItemIcon>
                <ListItemText primary="Rediger" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleCopyIssue}>
                <ListItemIcon>
                    <ContentCopy fontSize="small" sx={{ color: '#666666' }} />
                </ListItemIcon>
                <ListItemText primary="Kopier lenke" />
            </MenuItem>
            <MenuItem
                onClick={handleDeleteIssue}
                sx={{
                    color: '#d32f2f !important',
                    '&:hover': {
                        bgcolor: '#ffebee !important',
                        color: '#c62828 !important',
                    },
                    '& .MuiListItemIcon-root': {
                        color: '#d32f2f !important',
                    },
                    '& .MuiListItemText-root': {
                        color: '#d32f2f !important',
                        '& .MuiTypography-root': {
                            color: '#d32f2f !important',
                        },
                    },
                }}
            >
                <ListItemIcon>
                    <Delete fontSize="small" sx={{ color: '#d32f2f !important' }} />
                </ListItemIcon>
                <ListItemText primary="Slett sak" />
            </MenuItem>
        </Menu>
    )

    // Statistics Card Component
    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <Card
            sx={{
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                color: 'white',
                height: '100%',
                borderRadius: 3,
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                },
                transition: 'all 0.3s ease-in-out',
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="h3" fontWeight="bold" mb={1}>
                            {isLoading ? <Skeleton width={40} /> : value}
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }} mb={0.5}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 48, height: 48 }}>
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    )

    if (isLoading && !data) {
        return (
            <Box
                sx={{
                    px: { xs: 2, sm: 4, md: 6 },
                    py: 3,
                    marginLeft: { xs: 0, sm: '288px' },
                    marginTop: { xs: '72px', sm: '80px' },
                    width: { xs: '100%', sm: `calc(100% - 288px)` },
                    bgcolor: '#EEEEEE',
                    minHeight: '100vh',
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
                    <Box textAlign="center">
                        <CircularProgress size={60} sx={{ mb: 2, color: '#F79B72' }} />
                        <Typography variant="h6" sx={{ color: '#2A4759' }}>Laster inn saker...</Typography>
                    </Box>
                </Box>
            </Box>
        )
    }

    if (error) {
        return (
            <Box
                sx={{
                    px: { xs: 2, sm: 4, md: 6 },
                    py: 3,
                    marginLeft: { xs: 0, sm: '288px' },
                    marginTop: { xs: '72px', sm: '80px' },
                    width: { xs: '100%', sm: `calc(100% - 288px)` },
                    bgcolor: '#EEEEEE',
                    minHeight: '100vh',
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
                    <Typography variant="h6" sx={{ color: '#F79B72' }}>
                        Feil ved lasting av saker: {error.message}
                    </Typography>
                </Box>
            </Box>
        )
    }

    return (
        <Box
            sx={{
                px: { xs: 2, sm: 4, md: 6 }, // Responsive horizontal padding
                py: 3,
                bgcolor: '#EEEEEE',
                minHeight: '100vh',
                marginLeft: { xs: 0, sm: '288px' }, // Match sidebar width
                marginTop: { xs: '72px', sm: '80px' }, // Account for top nav height
                width: { xs: '100%', sm: `calc(100% - 288px)` },
                paddingTop: { xs: 2, sm: 3 },
            }}
        >
            {/* Header */}
                <Box mb={4}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h4" fontWeight="bold">
                            Registrerte Saker
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Tooltip title="Oppdater data">
                                <IconButton onClick={() => refetch()} disabled={isLoading}>
                                    <Refresh />
                                </IconButton>
                            </Tooltip>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAddNewIssue}
                                sx={{
                                    px: 3,
                                    bgcolor: '#F79B72',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: '#e8895f'
                                    }
                                }}
                            >
                                Ny Sak
                            </Button>
                        </Box>
                    </Box>
                    <Typography variant="body1" color="textSecondary">
                        Oversikt over alle registrerte saker i systemet
                    </Typography>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Totale Saker"
                            value={totalCount || data?.data?.length || 0}
                            icon={<Assignment />}
                            color="#2A4759"
                            subtitle="Alle registrerte"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Åpne Saker"
                            value={stats.open}
                            icon={<Schedule />}
                            color="#F79B72"
                            subtitle="Krever oppmerksomhet"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Løste Saker"
                            value={stats.solved}
                            icon={<CheckCircle />}
                            color="#2A4759"
                            subtitle="Fullført"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Kritiske Saker"
                            value={stats.critical}
                            icon={<BugReport />}
                            color="#F79B72"
                            subtitle="Høy prioritet"
                        />
                    </Grid>
                </Grid>

                {/* Search and Filters */}
                <Paper sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: 'white',
                    border: '1px solid rgba(221, 221, 221, 0.3)',
                    borderRadius: 2
                }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Søk i saker..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
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
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
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
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Prosjekt</InputLabel>
                                <Select
                                    value={projectFilter}
                                    label="Prosjekt"
                                    onChange={(e) => setProjectFilter(e.target.value)}
                                >
                                    <MenuItem value="">Alle prosjekter</MenuItem>
                                    {projects.map((project) => (
                                        <MenuItem key={project._id} value={project._id}>
                                            {project.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => {
                                    setSearchTerm('')
                                    setStatusFilter('')
                                    setPriorityFilter('')
                                    setProjectFilter('')
                                }}
                                startIcon={<FilterList />}
                                sx={{
                                    borderColor: '#F79B72',
                                    color: '#F79B72',
                                    '&:hover': {
                                        borderColor: '#e8895f',
                                        bgcolor: 'rgba(247, 155, 114, 0.04)'
                                    }
                                }}
                            >
                                Nullstill
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Issues Table */}
                <Paper sx={{
                    width: '100%',
                    overflow: 'hidden',
                    bgcolor: 'white',
                    border: '1px solid rgba(221, 221, 221, 0.3)',
                    borderRadius: 2
                }}>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: '#2A4759',
                                            color: 'white',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: '#1e3a4a' }
                                        }}
                                        onClick={() => handleSort('summary')}
                                    >
                                        <Box display="flex" alignItems="center">
                                            Oppsummering
                                            {sortField === 'summary' && (
                                                sortOrder === 'asc' ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: '#2A4759',
                                            color: 'white'
                                        }}
                                    >
                                        Prosjekt
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: '#2A4759',
                                            color: 'white',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: '#1e3a4a' }
                                        }}
                                        onClick={() => handleSort('category')}
                                    >
                                        <Box display="flex" alignItems="center">
                                            Kategori
                                            {sortField === 'category' && (
                                                sortOrder === 'asc' ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: '#2A4759',
                                            color: 'white',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: '#1e3a4a' }
                                        }}
                                        onClick={() => handleSort('severity')}
                                    >
                                        <Box display="flex" alignItems="center">
                                            Alvorlighetsgrad
                                            {sortField === 'severity' && (
                                                sortOrder === 'asc' ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: '#2A4759',
                                            color: 'white',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: '#1e3a4a' }
                                        }}
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        <Box display="flex" alignItems="center">
                                            Lagt inn
                                            {sortField === 'createdAt' && (
                                                sortOrder === 'asc' ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: '#2A4759',
                                            color: 'white',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: '#1e3a4a' }
                                        }}
                                        onClick={() => handleSort('priority')}
                                    >
                                        <Box display="flex" alignItems="center">
                                            Prioritet
                                            {sortField === 'priority' && (
                                                sortOrder === 'asc' ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: '#2A4759',
                                            color: 'white',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: '#1e3a4a' }
                                        }}
                                        onClick={() => handleSort('status')}
                                    >
                                        <Box display="flex" alignItems="center">
                                            Status
                                            {sortField === 'status' && (
                                                sortOrder === 'asc' ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, bgcolor: '#2A4759', color: 'white' }}>
                                        Handlinger
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedIssues.map((issue, index) => (
                                    <TableRow
                                        key={issue._id || index}
                                        sx={{
                                            '&:nth-of-type(odd)': { bgcolor: 'rgba(247, 155, 114, 0.02)' },
                                            '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.08)' },
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => navigate(`/vis-sak/${issue._id}`)}
                                    >
                                        <TableCell sx={{ maxWidth: 300 }}>
                                            <Typography
                                                variant="body2"
                                                fontWeight="500"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {issue.summary}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {issue.project ? (
                                                <Chip
                                                    label={
                                                        typeof issue.project === 'string'
                                                            ? projects.find(p => p._id === issue.project)?.name || 'Ukjent prosjekt'
                                                            : issue.project.name || 'Ukjent prosjekt'
                                                    }
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(247, 155, 114, 0.1)',
                                                            borderColor: '#F79B72'
                                                        }
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        const projectId = typeof issue.project === 'string' ? issue.project : issue.project._id
                                                        navigate(`/prosjekt/${projectId}`)
                                                    }}
                                                />
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">
                                                    Ikke tildelt
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={issue.category}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {issue.severity}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {moment(issue.createdAt).format('DD MMM YYYY')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getPriorityIcon(issue.priority)}
                                                label={issue.priority || 'No priority'}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getPriorityColor(issue.priority), 0.1),
                                                    color: getPriorityColor(issue.priority),
                                                    fontWeight: 500,
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={issue.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: getStatusColor(issue.status),
                                                    color: 'white',
                                                    fontWeight: 500,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Handlinger">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleActionsClick(e, issue)}
                                                >
                                                    <MoreVert />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                                        {/* Custom Pagination */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={sortedIssues.length}
                        rowsPerPage={rowsPerPage}
                        page={Math.min(page, Math.max(0, Math.ceil(sortedIssues.length / rowsPerPage) - 1))}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10))
                            setPage(0)
                        }}
                        labelRowsPerPage="Rader per side:"
                        labelDisplayedRows={({ from, to, count }) => {
                            const actualFrom = count === 0 ? 0 : from
                            const actualTo = Math.min(to, count)
                            return `${actualFrom}-${actualTo} av ${count}`
                        }}
                    />
                </Paper>

                {/* Actions Menu */}
                <ActionsMenu />

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={handleDeleteCancel}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        Bekreft sletting
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Er du sikker på at du vil slette denne saken?
                            {selectedIssue && (
                                <>
                                    <br /><br />
                                    <strong>Oppsummering:</strong> {selectedIssue.summary}
                                    <br />
                                    <strong>Kategori:</strong> {selectedIssue.category}
                                    <br />
                                    <strong>Status:</strong> {selectedIssue.status}
                                </>
                            )}
                            <br /><br />
                            Denne handlingen kan ikke angres.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={handleDeleteCancel}
                            disabled={deleteLoading}
                        >
                            Avbryt
                        </Button>
                        <Button
                            onClick={() => {
                                console.log('Delete button clicked')
                                handleDeleteConfirm()
                            }}
                            color="error"
                            variant="contained"
                            disabled={deleteLoading}
                            startIcon={deleteLoading ? <CircularProgress size={16} /> : <Delete />}
                        >
                            {deleteLoading ? 'Sletter...' : 'Slett sak'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
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

                {/* Empty State */}
                {filteredIssues.length === 0 && !isLoading && (
                    <Paper sx={{
                        p: 6,
                        textAlign: 'center',
                        mt: 3,
                        bgcolor: 'white',
                        border: '1px solid rgba(221, 221, 221, 0.3)',
                        borderRadius: 2
                    }}>
                        <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Ingen saker funnet
                        </Typography>
                        <Typography variant="body1" color="textSecondary" mb={3}>
                            {searchTerm || statusFilter || priorityFilter
                                ? 'Prøv å justere søkekriteriene dine.'
                                : 'Det ser ut til at det ikke er noen saker å vise ennå.'
                            }
                        </Typography>
                        {(!searchTerm && !statusFilter && !priorityFilter) && (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAddNewIssue}
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
                        )}
                    </Paper>
                )}
        </Box>
    )
}

export default Issues
