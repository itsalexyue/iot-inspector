import React from 'react';
import Reactable from 'reactable';
const Table = Reactable.Table, Th = Reactable.Th, Thead = Reactable.Thead;

export default class TCPTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      myTableData: [
        {name: 'Rylan'},
        {name: 'Amelia'},
        {name: 'Estevan'},
        {name: 'Florence'},
        {name: 'Tressa'},
      ],
    };
  }

  render() {
    let { data } = this.props;
    let rows = {};
    data.forEach(entry => {
      let key = entry.name || entry.dst + ':' + entry.dstport;
      console.log(key);
      if (!rows[key]) {
        rows[key] = [entry.src+':'+entry.srcport, key, 0, 0, 0, 0];
      }

      let bytesDown = 0, countDown = 0, bytesUp = 0, countUp = 0;
      Object.keys(entry.traffic).forEach(time => {
        bytesDown += entry.traffic[time].down.bytes;
        bytesUp += entry.traffic[time].up.bytes;
        countDown += entry.traffic[time].down.count;
        countUp += entry.traffic[time].up.count;
      });

      rows[key][2] = bytesDown; rows[key][3] = countDown; rows[key][4] = bytesUp; rows[key][5] = countUp;
    });

    console.log(rows);

    rows = Object.keys(rows).map(k => rows[k]);


    return (
      <Table
        className="table"
        data={rows}
        sortable={true}
      >
        <Thead>
          <Th column="0">
            <strong className="name-header">SRC IP</strong>
          </Th>
          <Th column="1">
            <em className="age-header">DST IP</em>
          </Th>
          <Th column="2">
            <em className="age-header">Bytes Down</em>
          </Th>
          <Th column="3">
            <em className="age-header">Packet Count Down</em>
          </Th>
          <Th column="4">
            <em className="age-header">Bytes Up</em>
          </Th>
          <Th column="5">
            <em className="age-header">Packet Count Up</em>
          </Th>

        </Thead>
      </Table>
    );
  }
}