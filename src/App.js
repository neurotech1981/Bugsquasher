import React, { Component } from 'react'
import NavBar from './components/layout/NavBar'
import Landing from './components/layout/Landing'
import Issues from './components/layout/Issues'
import Users from './components/user/Users'
import CreateIssue from './components/layout/CreateIssue'
import ViewIssue from './components/layout/ViewIssue'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import PrivateRoute from './components/auth/PrivateRoute'
import Signin from './components/auth/Signin'
import Profile from './components/user/Profile'
import Signup from './components/user/Signup'
import ResetPassword from './components/auth/ResetPassword'
import ChangePassword from './components/auth/ChangePassword'
import { Provider } from 'react-redux'
import { store } from './redux/store'

class App extends Component {
  render () {
    return (
      <Provider store={store}>
        <div>
          <Router>
            <NavBar />
            <PrivateRoute path="/user/edit/:userId" />
            <PrivateRoute path="/user/:userId" component={Profile} />
            <PrivateRoute path="/landing" component={Landing} />
            <PrivateRoute exact path="/" component={Landing} />
            <PrivateRoute path="/legg-til-sak/:userId" component={CreateIssue}/>
            <PrivateRoute path="/saker/:userId" component={Issues} />
            <PrivateRoute path="/vis-sak/:id" component={ViewIssue} />
            <PrivateRoute path="/bruker-admin/:userId" component={Users} />
            <Route path="/resett-passord" component={ResetPassword} />
            <Route path="/accounts/tilbakestill-passord/:token" component={ChangePassword} />
            <Route path="/signup" component={Signup} />
            <Route path="/signin" component={Signin} />
          </Router>
        </div>
      </Provider>
    )
  }
}

export default App
