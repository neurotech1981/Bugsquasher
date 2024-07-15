import React, { useEffect } from 'react'
import NavBar from './components/layout/NavBar'
import auth from './components/auth/auth-helper'
import Landing from './components/layout/Landing'
import Issues from './components/layout/Issues'
import Users from './components/user/Users'
import CreateIssue from './components/layout/CreateIssue'
import EditIssue from './components/layout/EditIssue'
import ViewIssue from './components/layout/ViewIssue'
import CreateProjectPage from './components/Project/CreateProjectPage'
import ProjectsPage from './components/Project/ProjectsPage'
import EditProject from './components/Project/EditProject'
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/auth/PrivateRoute'
import Signin from './components/auth/Signin'
import Profile from './components/user/Profile'
import Signup from './components/user/Signup'
import ResetPassword from './components/auth/ResetPassword'
import ChangePassword from './components/auth/ChangePassword'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import './App.css'
import { Typography, Button } from '@mui/material'
import { createTheme, adaptV4Theme } from '@mui/material/styles'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { ToastContainer, toast } from 'react-toastify'
import { ReactQueryDevtools } from 'react-query/devtools'
import { QueryClient, QueryClientProvider } from 'react-query'
import 'react-toastify/dist/ReactToastify.css'
import 'rollup-plugin-polyfill-node'
import socketIO from 'socket.io-client'
const socket = socketIO.connect('http://127.0.0.1:4000/', {
    forceNew: false,
    secure: true,
    transports: ['websocket'],
})

const queryClient = new QueryClient()

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
    })
)

const App = () => {
    const jwt = auth.isAuthenticated()
    if (jwt) {
        let userId = auth.isAuthenticated().user._id
        socket.emit('user_connect', userId)
    }

    const CustomToastWithLink = (issue_id, reporter) => (
        <div>
            <Typography variant="body2" color="textSecondary" component="p">
                A new issue has been created and delegated to you by reporter: {reporter}
            </Typography>
            <Button variant="contained" href={'/vis-sak/' + issue_id}>
                Gå til sak
            </Button>
        </div>
    )

    useEffect(() => {
        socket.on('new_issue', (issue) => {
            toast.info(CustomToastWithLink(issue.issue_id, issue.reporter), {
                position: 'bottom-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        })
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <Provider store={store}>
                        <div>
                            <ReactQueryDevtools initialIsOpen={false} />
                            <ToastContainer autoClose={false} />
                            <NavBar />
                            <Routes>
                                <Route path="/signin" element={<Signin />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/resett-passord" element={<ResetPassword />} />
                                <Route path="/tilbakestill-passord/:token" element={<ChangePassword />} />
                                <Route element={<PrivateRoute />}>
                                    <Route path="/user/edit/:userId" element={<Profile />} />
                                    <Route path="/user/:userId" element={<Profile />} />
                                    <Route path="/landing" element={<Landing />} />
                                    <Route path="/" element={<Landing />} />
                                    <Route path="/legg-til-sak/:id" element={<CreateIssue />} />
                                    <Route path="/saker/:userId" element={<Issues />} />
                                    <Route path="/vis-sak/:id" element={<ViewIssue />} />
                                    <Route path="/bruker-admin/:userId" element={<Users />} />
                                    <Route path="/edit-issue/:id" element={<EditIssue />} />
                                    <Route path="/prosjekt-oversikt/" element={<ProjectsPage />} />
                                    <Route path="/opprett-prosjekt/" element={<CreateProjectPage />} />
                                    <Route path="/rediger-project/:id" element={<EditProject />} />
                                </Route>
                            </Routes>
                        </div>
                    </Provider>
                </ThemeProvider>
            </StyledEngineProvider>
        </QueryClientProvider>
    )
}

export default App
