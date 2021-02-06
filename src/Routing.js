import React from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';

import MapPage from './pages/map/MapPage.js';
import AccountPage from './pages/account/AccountPage.js';
import TracesPage from './pages/traces/TracesPage.js';
import StarsPage from './pages/stars/StarsPage.js';
import LoginPage from './pages/account/LoginPage.js';

const Routing = () => (
  <Router>
    <div>
      <Route exact path="/map" component={MapPage} />
      <Route path="/login" component={LoginPage} />
      <Route exact path="/" component={AccountPage} />
      <Route path="/traces" component={TracesPage} />
      <Route path="/stars" component={StarsPage} />
    </div>
  </Router>
);

export default Routing;
