import React from 'react';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, AreaChart, Legend, styler } from "react-timeseries-charts";
import { Index, TimeSeries } from "pondjs";
import { Row, Column, Alignments } from 'react-foundation';

export default class TCPStreamGraph extends React.Component {
  constructor(props) {
    super(props);

    let { data } = props;

    console.log(data);

    this.state = this.calculateTimeSeries(data);
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);

    let { data } = nextProps;

    this.calculateTimeSeries(data);

    // this.setState({...this.calculateTimeSeries(data)});
  }

  generateEmptyArray = (len) => {
    let ary = [];
    for (let i = 0; i < len; i++) {
      ary[i] = 0;
    }
    return ary;
  };

  normalizeTimeSeries = (data, len) => {
    let points = Object.keys(data).map(key => { data[key][0] *= 1000; return data[key]; }).sort((a, b) => a[0] - b[0]);

    let seriesData = [];
    seriesData.push(points[0]);
    for (let i = 1; i < points.length - 1; i++) {
      if (points[i][0] - points[i-1][0] > 1000) {
        let ary = this.generateEmptyArray(5);
        ary[0] = points[i][0]-1000;
        seriesData.push(ary);
      }
      if (points[i+1][0] - points[i][0] > 1000) {
        let ary = this.generateEmptyArray(5);
        ary[0] = points[i][0]+1000;
        seriesData.push(ary);
      }
      seriesData.push(points[i]);
    }
    seriesData.push(points[points.length - 1]);
    seriesData.sort((a, b) => a[0] - b[0]);

    return seriesData;
  };

  calculateTimeSeries = (data) => {
    let timePoints = {};
    let tcpStream = data;

    Object.keys(tcpStream.traffic).forEach(time => {
      if (!timePoints[time]) {
        timePoints[time] = [time, 0, 0, 0, 0]; // unix_time, ssl_bytes_up, ssl_bytes_down, non_ssl_bytes_up, non_ssl_bytes_down
      }

      if (tcpStream.ssl.tls_client || tcpStream.ssl.tls_server) {
        timePoints[time][1] += tcpStream.traffic[time].up.bytes;
        timePoints[time][2] += tcpStream.traffic[time].down.bytes;
      } else {
        timePoints[time][3] += tcpStream.traffic[time].up.bytes;
        timePoints[time][4] += tcpStream.traffic[time].down.bytes;
      }
    });
    let seriesData = this.normalizeTimeSeries(timePoints, 5);

    let columns = ["time", "ssl_bytes_up", "ssl_bytes_down", "non_ssl_bytes_up", "non_ssl_bytes_down"];
    let series = new TimeSeries({
      "name": "tcp_traffic",
      "columns": columns,
      "points": seriesData
    });
    console.log(columns);
    console.log(seriesData);

    return {
      series,
      timerange: series.range(),
      columns,
      style: styler(columns)
    };



    {/*let points = {}, connections = {}, connectionCount = 0;*/}
    {/*data.forEach(entry => {*/}
    {/*let key = entry.dst + ':' + entry.dstport, connId = connections[key];*/}
    {/*if (!connId) {*/}
    {/*connections[key] = ++connectionCount;*/}
    {/*connId = connectionCount;*/}
    {/*}*/}

    {/*Object.keys(entry.traffic).forEach(time => {*/}
    {/*if(!points[time]) {*/}
    {/*points[time] = [time*1000];*/}
    {/*}*/}

    {/*points[time][connId] = entry.traffic[time].down.bytes + entry.traffic[time].up.bytes;*/}
    {/*});*/}
    {/*});*/}
    {/*points = Object.keys(points).map(key => points[key]).sort((a, b) => a[0] - b[0]);*/}

    {/*// let seriesData = [];*/}
    {/*seriesData.push(points[0]);*/}
    {/*for (let i = 1; i < points.length - 1; i++) {*/}
    {/*if (points[i][0] - points[i-1][0] > 1000)*/}
    {/*seriesData.push([points[i][0]-1000]);*/}
    {/*if (points[i+1][0] - points[i][0] > 1000)*/}
    {/*seriesData.push([points[i][0]+1000]);*/}
    {/*seriesData.push(points[i]);*/}
    {/*}*/}
    {/*seriesData.push(points[points.length - 1]);*/}
    {/*seriesData.sort((a, b) => a[0] - b[0]);*/}

    {/*seriesData.forEach(point => {*/}
    {/*for (let i = 1; i <= connectionCount; i++) {*/}
    {/*if (!point[i]) point[i] = 0;*/}
    {/*}*/}
    {/*});*/}

    {/*console.log(seriesData);*/}


    {/*let columns = ["time", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];*/}
    {/*// Object.keys(connections).forEach(connName => {*/}
    {/*//   columns[connections[connName]] = connName.toString();//connName;*/}
    {/*// });*/}

    {/*let series = new TimeSeries({*/}
    {/*"name": "traffic",*/}
    //   "columns": columns,
    //   "points": seriesData
    // });
    // console.log(columns);
    // console.log(seriesData);
    //
    // return {
    //   series,
    //   timerange: series.range(),
    //   columns,
    //   style: styler(series.columns())
    // };
  };

  render() {
    const legendCategories = this.state.columns.map(d => ({key: d, label: d}));

    return (
      <div>
        <Row>
          <Column small={12}>
            <Legend categories={legendCategories} style={this.state.style} type="dot"/>
          </Column>
        </Row>
        <Row>
          <Column small={12}>
            <ChartContainer
              onTimeRangeChanged={(timerange) => this.setState({timerange})}
              timeRange={this.state.timerange}
              enablePanZoom={true}
              width={1080}
            >
              <ChartRow height="350">
                <YAxis
                  id="y"
                  min={-1000}
                  max={1000}
                  width="60"
                  type="linear"/>
                <Charts>
                  <AreaChart
                    stack={true}
                    axis="y"
                    style={this.state.style}
                    series={this.state.series}
                    columns={{up: ["ssl_bytes_up", "non_ssl_bytes_up"], down: ["ssl_bytes_down", "non_ssl_bytes_down"]}}
                    fillOpacity={0.4}
                    interpolation="curveLinear" />
                </Charts>
              </ChartRow>
            </ChartContainer>
          </Column>
        </Row>
      </div>

    );
  }
}