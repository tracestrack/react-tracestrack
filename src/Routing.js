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
      <Route exact path="/" component={App}/>
      <Route path="/account" component={Account}/>
      <Route path="/activies" component={Manage}/>
    </div>
  </Router>
)
export default Routing
