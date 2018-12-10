import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';

import App from './App';
import Account from './Account';
import ActivityManage from './ActivityManage';
import StarManage from './StarManage';
import AppMapbox from './AppMapbox';

class DevIndex extends Component {

  render() {
    return (<center><a href='/real_index.html'>Real index</a></center>);
  }
}

const Routing = () => (
  <Router>
    <div>
      <Route exact path="/" component={DevIndex} />
      <Route exact path="/map" component={App} />
      <Route path="/account" component={Account} />
      <Route path="/activities" component={ActivityManage} />
      <Route path="/stars" component={StarManage} />
      <Route path="/mapbox" component={AppMapbox} />
    </div>
  </Router>
);

export default Routing;
