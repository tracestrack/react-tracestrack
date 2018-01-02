import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import App from './App';
import Account from './Account';
import Manage from './Manage';

const Routing = () => (
  <Router>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/account">Account</Link></li>
        <li><Link to="/manage">Manage</Link></li>
      </ul>

      <hr/>

      <Route exact path="/" component={App}/>
      <Route path="/account" component={Account}/>
      <Route path="/manage" component={Manage}/>
    </div>
  </Router>
)
export default Routing
