import React from 'react';
import Reactable from 'reactable';
const Table = Reactable.Table, Th = Reactable.Th, Thead = Reactable.Thead, unsafe = Reactable.unsafe;

const tlsVersions = {
  // SSL
  0x0002: "SSL_2_0",
  0x0300: "SSL_3_0",
  // TLS:
  0x0301: "TLS_1_0",
  0x0302: "TLS_1_1",
  0x0303: "TLS_1_2",
  0x0304: "TLS_1_4",
  // DTLS
  0x0100: "PROTOCOL_DTLS_1_0_OPENSSL_PRE_0_9_8f",
  0xfeff: "DTLS_1_0",
  0xfefd: "DTLS_1_1",
};

export default class TCPTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { data } = this.props;
    let rows = {};
    data.forEach(entry => {
      let key = entry.name || entry.dst + ':' + entry.dport;

      if (!rows[key]) {
        rows[key] = [entry.src+':'+entry.sport, key, 0, 0, 0, 0, 0, 0, 0, 0];
      }

      let bytesDown = 0, countDown = 0, bytesUp = 0, countUp = 0;
      Object.keys(entry.traffic).forEach(time => {
        bytesDown += entry.traffic[time].down.bytes;
        bytesUp += entry.traffic[time].up.bytes;
        countDown += entry.traffic[time].down.count;
        countUp += entry.traffic[time].up.count;
      });

      rows[key][2] = entry.host;
      rows[key][3] = 'None';
      if (entry.ssl.tls_client && entry.ssl.tls_server)
        rows[key][3] = tlsVersions[Math.min(entry.ssl.tls_client, entry.ssl.tls_server)];

      rows[key][4] = bytesDown; rows[key][5] = countDown; rows[key][6] = bytesUp; rows[key][7] = countUp;
      rows[key][8] = unsafe('<a href="/tcp/view/'+entry._id+'" target="_blank">View</a>');
    });

    // console.log(rows);

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
            <em className="age-header">DST IP</em>
          </Th>
          <Th column="3">
            <em className="age-header">TLS Version</em>
          </Th>
          <Th column="4">
            <em className="age-header">Bytes Down</em>
          </Th>
          <Th column="5">
            <em className="age-header">Packet Count Down</em>
          </Th>
          <Th column="6">
            <em className="age-header">Bytes Up</em>
          </Th>
          <Th column="7">
            <em className="age-header">Packet Count Up</em>
          </Th>
          <Th column="8">
            <em className="age-header">View Stream</em>
          </Th>
        </Thead>
      </Table>
    );
  }
}