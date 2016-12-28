import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router';

import { GlobalLayout } from './features/common/Layout';
import Hero from './features/hero/Hero';

import NetflowInterface from './features/visualizations/netflow/NetflowInterface';
import TCPInterface from './features/visualizations/tcp/TCPInterface';

render((
  <Router history={browserHistory}>
    <Route path="/" component={GlobalLayout} >
      <IndexRoute component={TCPInterface} />
      <Route path="tcp" component={TCPInterface} />
    </Route>
  </Router>
), document.getElementById('app'));
