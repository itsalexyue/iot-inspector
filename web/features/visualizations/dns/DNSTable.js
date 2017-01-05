import React from 'react';
import Reactable from 'reactable';
const Table = Reactable.Table, Th = Reactable.Th, Thead = Reactable.Thead, unsafe = Reactable.unsafe;

export default class DNSTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { data } = this.props;
    console.log(data);

    let rows = [];
    data.forEach(entry => {
      let row = [
        entry.time,
        entry.src,
        entry.dst,
        entry.query.map(v => v.name).join(', '),
        entry.an.map(v => v.data).join(', '),
        unsafe('<a href="/dns/view/'+entry._id+'" target="_blank">View</a>')
      ];

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
          <strong className="name-header">SRC IP</strong>
        </Th>
        <Th column="2">
          <em className="age-header">DST IP</em>
        </Th>
        <Th column="3">
          <em className="age-header">Query Name</em>
        </Th>
        <Th column="4">
          <em className="age-header">Resolved IPs</em>
        </Th>
        <Th column="5">
          <em className="age-header">Entry View</em>
        </Th>
        </Thead>
      </Table>
    );
  }
}