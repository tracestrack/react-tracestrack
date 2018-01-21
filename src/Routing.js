import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import App from './App';
import Account from './Account';
import Manage from './Manage';
import Map2 from './MBMap';

const Routing = () => (
  <Router>
    <div>
      <Route exact path="/" component={App}/>
      <Route path="/account" component={Account}/>
      <Route path="/activities" component={Manage}/>
      <Route path="/mapbox" component={Map2}/>
    </div>
  </Router>
)
export default Routing
