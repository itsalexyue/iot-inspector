import React from 'react';
import { Row, Column, Alignments } from 'react-foundation';

import NetflowGraph from './NetflowGraph';
import NetflowTable from './NetflowTable';

export default class NetflowInterface extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
    };
  }

  componentDidMount() {
    $.getJSON('/api/netflow')
      .then(data => this.setState({ data }));
  }

  render() {
    return (
      <Row>
        <Column small={12}>
          {(this.state.data) ? <div><NetflowGraph data={this.state.data} /><NetflowTable data={this.state.data} /></div> : ''}
        </Column>
      </Row>
    );
  }
}