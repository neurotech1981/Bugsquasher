import React, { Component } from 'react'
import NavBar from './components/layout/NavBar'
import Landing from './components/layout/Landing'
import Issues from './components/layout/Issues'
import Users from './components/user/Users'
import CreateIssue from './components/layout/CreateIssue'
import ViewIssue from './components/layout/ViewIssue'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import PrivateRoutes from './components/auth/PrivateRoute'
import Signin from './components/auth/Signin'
import Profile from './components/user/Profile'
import Signup from './components/user/Signup'
import { Provider } from 'react-redux'
import { store } from './redux/store'

class App extends Component {
  render () {
    return (
      <Provider store={store}>
        <div>
          <Router>
            <NavBar />
            <PrivateRoutes path="/user/edit/:userId" />
            <Route path="/user/:userId" component={Profile} />
            <Route path="/signup" component={Signup} />
            <Route path="/signin" component={Signin} />
            <Route exact path="/" component={Landing} />
            <PrivateRoutes
              path="/legg-til-sak/:userId"
              component={CreateIssue}
            />
            <PrivateRoutes path="/saker" component={Issues} />
            <PrivateRoutes path="/vis-sak/:id" component={ViewIssue} />
            <PrivateRoutes path="/bruker-admin/:userId" component={Users} />
          </Router>
        </div>
      </Provider>
    )
  }
}

export default App
