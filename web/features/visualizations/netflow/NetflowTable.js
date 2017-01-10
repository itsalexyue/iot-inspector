import React from 'react';
import Reactable from 'reactable';
const Table = Reactable.Table, Th = Reactable.Th, Thead = Reactable.Thead, unsafe = Reactable.unsafe;

export default class DNSTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { data } = this.props;

    let rows = [];
    data.forEach(entry => {
      let row = [
        entry.time,
        entry.traffic.up.bytes,
        entry.traffic.up.count,
        entry.traffic.down.bytes,
        entry.traffic.down.count
      ];

      if (entry.types)
        row.push(entry.types.join(', '));

      rows.push(row);
    });

    return (
      <Table
        className="table"
        data={rows}
        sortable={true}
      >
        <Thead>
        <Th column="0">
          <strong className="age-header">Time</strong>
        </Th>
        <Th column="1">
          <strong className="name-header">Bytes Up</strong>
        </Th>
        <Th column="2">
          <em className="age-header">Packet Count Up</em>
        </Th>
        <Th column="3">
          <em className="age-header">Bytes Down</em>
        </Th>
        <Th column="4">
          <em className="age-header">Packet Count Down</em>
        </Th>
        <Th column="5">
          <em className="age-header">Packet Types</em>
        </Th>
        </Thead>
      </Table>
    );
  }
}