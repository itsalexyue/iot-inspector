import React from 'react';
import { Row, Column, Alignments } from 'react-foundation';

import TCPGraph from './TCPGraph';
import TCPTable from './TCPTable';

export default class TCPInterface extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
    };
  }

  componentDidMount() {
    let fetchUrl = '/api/tcp';
    if (this.props.params.id)
      fetchUrl += '/' + this.props.params.id;

    $.getJSON(fetchUrl)
      .then(data => this.setState({ data }));
  }

  render() {
    return (
      <Row>
        <Column small={12}>
          {(this.state.data) ? <div><TCPGraph data={this.state.data} /><TCPTable data={this.state.data} /></div> : ''}
        </Column>
      </Row>
    );
  }
}