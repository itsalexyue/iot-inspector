import React from 'react';

export default class DNSEntry extends React.Component {
  render() {
    let { data } = this.props;

    let query = data.query.map(e => <li>{e.name} [Type: {e.type}, Class: {e.class}]</li>) || <li>None</li>;
    let answer = data.an.map(e => <li>{e.data} [Type: {e.type}, Class: {e.class}, TTL: {e.ttl}]</li>) || <li>None</li>;
    let nameserver = data.ns.map(e => <li>{e.data} [Type: {e.type}, Class: {e.class}, TTL: {e.ttl}]</li>) || <li>None</li>;
    let add_records = data.ar.map(e => <li>{e.data} [Type: {e.type}, Class: {e.class}, TTL: {e.ttl}]</li>) || <li>None</li>;

    return (
      <div>
        Query:
        <ul>
          { query }
        </ul>

        Answer:
        <ul>
          { answer }
        </ul>

        Nameserver:
        <ul>
          { nameserver }
        </ul>

        Additional Records:
        <ul>
          { add_records }
        </ul>
      </div>
    );
  }
}