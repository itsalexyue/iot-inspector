import React from 'react';
import { Row, Column, Alignments } from 'react-foundation';

import TCPGraph from '../tcp/TCPGraph';
// import TCPTable from './TCPTable';

export default class TCPStreamInterface extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
    };
  }

  componentDidMount() {
    $.getJSON('/api/tcp/' + this.props.params.tcpKey)
      .then(data => this.setState({ data }));
  }

  render() {
    console.log(this.props);
    return (
      <Row>
        {JSON.toString(this.props)}
        <Column small={12}>
          {(this.state.data) ? <div><TCPGraph data={this.state.data} /></div> : ''}
        </Column>
      </Row>
    );
  }
}