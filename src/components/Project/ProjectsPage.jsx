import React, { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { getProjects } from '../../services/projectService'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import {
    Add as AddIcon,
    CalendarToday as CalendarIcon,
    Group as GroupIcon,
    Assignment as ProjectIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import auth from '../auth/auth-helper'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 600,
    color: '#2A4759',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e0e0e0',
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(even)': {
        backgroundColor: '#fafafa',
    },
    '&:hover': {
        backgroundColor: 'rgba(247, 155, 114, 0.08)',
        cursor: 'pointer',
    },
    transition: 'background-color 0.2s ease-in-out',
}))

// Helper function to get status chip color
const getStatusChip = (status) => {
    const statusMap = {
        'Todo': { color: '#F79B72', icon: '📋' },
        'In progress': { color: '#e8895f', icon: '⚡' },
        'Done': { color: '#2A4759', icon: '✅' }
    }
    return statusMap[status] || { color: '#999999', icon: '❓' }
}

const ProjectsPage = () => {
    const jwt = auth.isAuthenticated()
    const navigate = useNavigate()

    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjects({ t: jwt.token })
                if (response.error) {
                    setError(response.error)
                } else if (response.success && Array.isArray(response.data)) {
                    setProjects(response.data)
                } else {
                    setError('Invalid response format')
                    setProjects([])
                }
            } catch (err) {
                setError(err.message)
                setProjects([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchProjects()
    }, [jwt.token])

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
                        ⚠️ Feil ved lasting av prosjekter
                    </Typography>
                    <Typography color="text.secondary">
                        {error}
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
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={2}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <ProjectIcon sx={{ color: '#F79B72', fontSize: 40 }} />
                        <Box>
                            <Typography
                                variant="h4"
                                component="h1"
                                fontWeight="bold"
                                sx={{ color: '#2A4759', fontSize: { xs: '1.75rem', md: '2.125rem' } }}
                            >
                                Prosjekt oversikt
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Administrer og overvåk alle prosjekter
                            </Typography>
                        </Box>
                    </Stack>
                    <Button
                        variant="contained"
                        component={RouterLink}
                        to="/opprett-prosjekt/"
                        startIcon={<AddIcon />}
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
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        Nytt Prosjekt
                    </Button>
                </Stack>
            </Paper>

            {/* Main Content */}
            <Card elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                    {isLoading ? (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: 200,
                            flexDirection: 'column',
                            gap: 2
                        }}>
                            <CircularProgress sx={{ color: '#F79B72' }} size={48} />
                            <Typography color="text.secondary">
                                Laster prosjekter...
                            </Typography>
                        </Box>
                    ) : projects.length === 0 ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 300,
                            p: 4,
                            textAlign: 'center'
                        }}>
                            <ProjectIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Ingen prosjekter funnet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Kom i gang ved å opprette ditt første prosjekt
                            </Typography>
                            <Button
                                variant="contained"
                                component={RouterLink}
                                to="/opprett-prosjekt/"
                                startIcon={<AddIcon />}
                                sx={{
                                    bgcolor: '#F79B72',
                                    color: 'white',
                                    px: 3,
                                    py: 1,
                                    fontWeight: 600,
                                    '&:hover': {
                                        bgcolor: '#e8895f'
                                    }
                                }}
                            >
                                Opprett Prosjekt
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <ProjectIcon fontSize="small" />
                                                <span>Navn</span>
                                            </Stack>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <GroupIcon fontSize="small" />
                                                <span>Team medlemmer</span>
                                            </Stack>
                                        </StyledTableCell>
                                        <StyledTableCell>Status</StyledTableCell>
                                        <StyledTableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <CalendarIcon fontSize="small" />
                                                <span>Startdato</span>
                                            </Stack>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <CalendarIcon fontSize="small" />
                                                <span>Sluttdato</span>
                                            </Stack>
                                        </StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {projects.map((project) => {
                                        const projectId = project._id || project.id
                                        return (
                                            <StyledTableRow
                                                key={projectId}
                                                onClick={() => navigate(`/prosjekt/${projectId}`)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(247, 155, 114, 0.04)'
                                                    }
                                                }}
                                            >
                                                <TableCell>
                                                    <Box
                                                        sx={{
                                                            color: '#F79B72',
                                                            fontWeight: 600,
                                                            fontSize: '1rem',
                                                            '&:hover': {
                                                                color: '#e8895f'
                                                            }
                                                        }}
                                                    >
                                                        {project.name}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {(() => {
                                                            const teamNames = project.assignedTeams?.map(assignment =>
                                                                assignment.team?.name || 'Unknown Team'
                                                            ) || []
                                                            const memberNames = project.teamMembers?.map(member =>
                                                                member.user?.name || member.name
                                                            ) || []
                                                            const allNames = [...teamNames, ...memberNames].filter(name => name);
                                                            return allNames.length > 0 ? allNames.join(', ') : 'Ingen medlemmer'
                                                        })()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`${getStatusChip(project.status).icon} ${project.status}`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: getStatusChip(project.status).color,
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            minWidth: 100,
                                                            '& .MuiChip-label': {
                                                                px: 2
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {new Date(project.startDate).toLocaleDateString('no-NO')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {new Date(project.endDate).toLocaleDateString('no-NO')}
                                                    </Typography>
                                                </TableCell>
                                            </StyledTableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    )
}

export default ProjectsPage
