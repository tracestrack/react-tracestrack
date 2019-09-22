import React from 'react';
import ReactDOM from 'react-dom';
import Routing from './Routing';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Routing />, document.getElementById('root'));
serviceWorker.register();
