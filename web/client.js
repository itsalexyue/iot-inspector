import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router';

import { GlobalLayout } from './features/common/Layout';
import Hero from './features/hero/Hero';

import NetflowInterface from './features/visualizations/netflow/NetflowInterface';
import TCPInterface from './features/visualizations/tcp/TCPInterface';
import TCPStreamInterface from './features/visualizations/tcp_stream/TCPStreamInterface';
import DNSInterface from './features/visualizations/dns/DNSInterface';

const Home = (props) => {
  return (
    <div>
      Select an item from the list to view data.
    </div>
  );
};

render((
  <Router history={browserHistory}>
    <Route path="/" component={GlobalLayout}>
      <IndexRoute component={Home} />
      <Route path="tcp" component={TCPInterface} />
      <Route path="tcp/view/:id" component={TCPInterface} />
      <Route path="dns" component={DNSInterface} />
      <Route path="dns/view/:id" component={DNSInterface} />
      <Route path="netflow" component={NetflowInterface} />
    </Route>
  </Router>
), document.getElementById('app'));


// render((
//   <Router history={browserHistory}>
//     <Route path="/" component={GlobalLayout} >
//       <IndexRoute component={DNSInterface} />
//       <Route path="tcp" component={TCPInterface} >
//         <Route path="/:tcpKey" component={TCPStreamInterface} />
//       </Route>
//       <Route path="tcpstream/:tcpKey" component={TCPStreamInterface} />
//       <Route path="dns">
//         <IndexRoute component={DNSInterface} />
//         <Route path="/view/:id" component={DNSInterface} />
//       </Route>
//     </Route>
//   </Router>
// ), document.getElementById('app'));
