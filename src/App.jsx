import React, { useEffect, useState, useMemo } from 'react'
import NavBar from './components/layout/NavBar'
import auth from './components/auth/auth-helper'
import Landing from './components/layout/Landing'
import Issues from './components/layout/Issues'
import Users from './components/user/Users'
import CreateIssue from './components/layout/CreateIssue'
import EditIssue from './components/layout/EditIssue'
import ViewIssueProfessional from './components/layout/ViewIssueProfessional'
import CreateProjectPage from './components/Project/CreateProjectPage'
import ProjectsPage from './components/Project/ProjectsPage'
import EditProject from './components/Project/EditProject'
import ProjectDashboard from './components/Project/ProjectDashboard'
import TeamManagementHub from './components/Team/TeamManagementHub'
import TeamDetailView from './components/Team/TeamDetailView'
import PlayfulDemo from './components/PlayfulDemo'
import GlassmorphicDemo from './components/GlassmorphicDemo'
import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './components/auth/PrivateRoute'
import Signin from './components/auth/Signin'
import Profile from './components/user/Profile'
import Signup from './components/user/Signup'
import ResetPassword from './components/auth/ResetPassword'
import ChangePassword from './components/auth/ChangePassword'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import './App.css'
import './assets/orange-navy-theme.css'
import { Typography, Button, Box } from '@mui/material'
import { createTheme, adaptV4Theme } from '@mui/material/styles'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { ToastContainer, toast } from 'react-toastify'
import { ReactQueryDevtools } from 'react-query/devtools'
import { QueryClient, QueryClientProvider } from 'react-query'
import 'react-toastify/dist/ReactToastify.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { SocketProvider, useSocket } from './components/SocketProvider'

// Create a React Query client with settings
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: true,
            refetchOnMount: true,
        },
    },
})

// Create a theme with consistent typography
const theme = createTheme(
    adaptV4Theme({
        typography: {
            fontFamily: [
                'Sora',
                'IBM Plex Mono',
                'Space Mono',
                'Manrope',
                'Lato',
                'Roboto',
                'Inter',
                'Helvetica Neue',
                'Arial',
                'sans-serif',
            ].join(','),
        },
        palette: {
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#dc004e',
            },
        },
    })
)

// Component to handle socket notifications
const NotificationHandler = () => {
    const { socket, isConnected, on, emit } = useSocket();

    // Create toast notification component for new issues
    const CustomToastWithLink = useMemo(() => {
        const ToastComponent = (issue_id, reporter) => (
            <Box>
                <Typography variant="body2" color="textSecondary" component="p">
                    A new issue has been created and delegated to you by reporter: {reporter}
                </Typography>
                <Button variant="contained" href={'/vis-sak/' + issue_id} size="small" sx={{ mt: 1 }}>
                    Gå til sak
                </Button>
            </Box>
        )
        ToastComponent.displayName = 'CustomToastWithLink'
        return ToastComponent
    }, [])

    // Connect user to socket when authenticated - use callback
    useEffect(() => {
        if (!socket || !isConnected) return;

        const jwt = auth.isAuthenticated();
        if (!jwt || !jwt.user || !jwt.user._id) return;

        console.log('Connecting user to socket:', jwt.user._id);
        emit('user_connect', jwt.user._id);
    }, [socket, isConnected, emit]);

    // Listen for new issue notifications - use callback
    useEffect(() => {
        if (!socket) return;

        const handleNewIssue = (issue) => {
            if (issue && issue.issue_id) {
                toast.info(CustomToastWithLink(issue.issue_id, issue.reporter), {
                    position: 'bottom-right',
                    autoClose: 8000, // Increased from 5000 to give more time to read
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        };

        on('new_issue', handleNewIssue);

        // No need for cleanup as the 'on' function now returns a cleanup function
    }, [socket, CustomToastWithLink, on]);

    return null; // This component doesn't render anything
}

const App = () => {
    const jwt = auth.isAuthenticated();
    const token = useMemo(() => jwt ? jwt.token : null, [jwt]);

    return (
        <SocketProvider token={token}>
            <ThemeProvider theme={theme}>
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <StyledEngineProvider injectFirst>
                            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                                <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
                                <ToastContainer
                                    position="bottom-right"
                                    newestOnTop
                                    closeOnClick
                                    rtl={false}
                                    pauseOnFocusLoss
                                    draggable
                                    pauseOnHover
                                />
                                <NavBar />
                                {/* Add notification handler to manage socket events */}
                                <NotificationHandler />
                                <Box component="main" sx={{ flexGrow: 1 }}>
                                    <Routes>
                                        {/* Public routes */}
                                        <Route path="/signin" element={<Signin />} />
                                        <Route path="/signup" element={<Signup />} />
                                        <Route path="/resett-passord" element={<ResetPassword />} />
                                        <Route path="/tilbakestill-passord/:token" element={<ChangePassword />} />
                                        <Route path="/demo" element={<PlayfulDemo />} />
                                        <Route path="/glass" element={<GlassmorphicDemo />} />

                                        {/* Protected routes */}
                                        <Route element={<PrivateRoute />}>
                                            <Route path="/users/edit/:userId" element={<Profile />} />
                                            <Route path="/users/:userId" element={<Profile />} />
                                            <Route path="/landing" element={<Landing />} />
                                            <Route path="/" element={<Landing />} />
                                            <Route path="/legg-til-sak/:id" element={<CreateIssue />} />
                            <Route path="/ny-sak" element={<CreateIssue />} />
                                            <Route path="/saker" element={<Issues />} />
                                            <Route path="/saker/:userId" element={<Issues />} />
                                            <Route path="/vis-sak/:id" element={<ViewIssueProfessional />} />
                                            <Route path="/bruker-admin/:userId" element={<Users />} />
                                            <Route path="/edit-issue/:id" element={<EditIssue />} />
                                                                <Route path="/prosjekt-oversikt/" element={<ProjectsPage />} />
                    <Route path="/prosjekt/:id" element={<ProjectDashboard />} />
                    <Route path="/opprett-prosjekt/" element={<CreateProjectPage />} />
                    <Route path="/rediger-prosjekt/:id" element={<EditProject />} />
                            <Route path="/rediger-project/:id" element={<EditProject />} />
                            <Route path="/team-admin" element={<TeamManagementHub />} />
                            <Route path="/team/:teamId" element={<TeamDetailView />} />
                                        </Route>
                                    </Routes>
                                </Box>
                            </Box>
                        </StyledEngineProvider>
                    </QueryClientProvider>
                </Provider>
            </ThemeProvider>
        </SocketProvider>
    )
}

export default App
