import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';

import MapPage from './pages/map/MapPage.js';
import AccountPage from './pages/account/AccountPage.js';
import TracesPage from './pages/traces/TracesPage.js';
import StarsPage from './pages/stars/StarsPage.js';
import LoginPage from './pages/account/LoginPage.js';

class DevIndex extends Component {

  render() {
    return (<center>
              <ul>
                <li><a href='/real_index.html'>Real index</a></li>
                <li><a href='/map'>Map</a></li>
                <li><a href='/traces'>Trace list</a></li>
                <li><a href='/stars'>Star list</a></li>
              </ul>
            </center>);
  }
}

const Routing = () => (
  <Router>
    <div>
      <Route exact path="/" component={DevIndex} />
      <Route exact path="/map" component={MapPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/traces" component={TracesPage} />
      <Route path="/stars" component={StarsPage} />
    </div>
  </Router>
);

export default Routing;
