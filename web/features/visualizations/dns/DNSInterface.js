import React from 'react';
import { Row, Column, Alignments } from 'react-foundation';

import DNSTable from './DNSTable';
import DNSEntry from './DNSEntry';

export default class TCPStreamInterface extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
    };
  }

  componentDidMount() {
    let fetchUrl = '/api/dns';
    if (this.props.params.id)
      fetchUrl += '/' + this.props.params.id;

    $.getJSON(fetchUrl)
      .then(data => this.setState({ data }));
  }

  render() {
    return (
      <Row>
        <Column small={12}>
          {(this.state.data) ? <div>{((this.props.params.id) ? <DNSEntry data={this.state.data}/> : <DNSTable data={this.state.data} />)}</div> : ''}
        </Column>
      </Row>
    );
  }
}