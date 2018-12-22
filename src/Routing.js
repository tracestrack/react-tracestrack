import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';

import MapPage from './pages/map/MapPage.js';
import AccountPage from './pages/account/AccountPage.js';
import TracesPage from './pages/traces/TracesPage.js';
import StarsPage from './pages/stars/StarsPage.js';

class DevIndex extends Component {

  render() {
    return (<center><a href='/real_index.html'>Real index</a></center>);
  }
}

const Routing = () => (
  <Router>
    <div>
      <Route exact path="/" component={DevIndex} />
      <Route exact path="/map" component={MapPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/traces" component={TracesPage} />
      <Route path="/stars" component={StarsPage} />
    </div>
  </Router>
);

export default Routing;
