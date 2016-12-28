import React from 'react';
import { Row, Column, Alignments } from 'react-foundation';

import NetflowGraph from './NetflowGraph';

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
          <NetflowGraph data={this.state.data} />
        </Column>
      </Row>
    );
  }
}