import React, { useEffect } from 'react'
import NavBar from './components/layout/NavBar'
import auth from './components/auth/auth-helper'
import Landing from './components/layout/Landing'
import Issues from './components/layout/Issues'
import Users from './components/user/Users'
import CreateIssue from './components/layout/CreateIssue'
import EditIssue from "./components/layout/EditIssue";
import ViewIssue from './components/layout/ViewIssue'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import PrivateRoute from './components/auth/PrivateRoute'
import Signin from './components/auth/Signin'
import Profile from './components/user/Profile'
import Signup from './components/user/Signup'
import ResetPassword from './components/auth/ResetPassword'
import ChangePassword from './components/auth/ChangePassword'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import './App.css';
import { Typography, Button } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import socketIO from 'socket.io-client'
const socket = socketIO.connect('http://127.0.0.1:4000/', {
  forceNew: false,
  secure: true,
  transports: ['websocket'],
})

const theme = createTheme({
  typography: {
    fontFamily: [
      'Manrope',
      'IBM Plex Mono',
      'Sora',
      'Lato',
      'Inter',
      'Roboto',
      'Space Mono',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
  },
})


const App = () => {
  const jwt = auth.isAuthenticated();
  if(jwt) {
    let userId = auth.isAuthenticated().user._id
    // Socket IO user connection
    socket.emit('user_connect', userId)
  }

  const CustomToastWithLink = (issue_id, reporter) => (
    <div>
      <Typography variant="body2" color="textSecondary" component="p">
        A new issue has been created and delegated to you by reporter: {reporter}
      </Typography>
      <Button variant="contained" href={'/vis-sak/' + issue_id}>Gå til sak
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
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <div>
          <ToastContainer autoClose={false} />
          <Router>
            <NavBar />
            <PrivateRoute path="/user/edit/:userId" />
            <PrivateRoute path="/user/:userId" component={Profile} />
            <PrivateRoute path="/landing" component={Landing} />
            <PrivateRoute exact path="/" component={Landing} />
            <PrivateRoute path="/legg-til-sak/:id" component={CreateIssue} />
            <PrivateRoute path="/saker/:userId" component={Issues} />
            <PrivateRoute path="/vis-sak/:id" component={ViewIssue} />
            <PrivateRoute path="/bruker-admin/:userId" component={Users} />
            <PrivateRoute path="/edit-issue/:id" component={EditIssue} />
            <Route path="/resett-passord" component={ResetPassword} />
            <Route path="/tilbakestill-passord/:token" component={ChangePassword} />
            <Route path="/signup" component={Signup} />
            <Route path="/signin" component={Signin} />
          </Router>
        </div>
      </Provider>
    </ThemeProvider>
  )
}

export default App
