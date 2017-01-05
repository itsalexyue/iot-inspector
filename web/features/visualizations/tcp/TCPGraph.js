import React from 'react';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, AreaChart, Legend, styler } from "react-timeseries-charts";
import { Index, TimeSeries } from "pondjs";
import { Row, Column, Alignments } from 'react-foundation';

// Data
const rawData = require("./stacked.json");
// console.log(rawData);
const numPoints = rawData[0].values.length;
const columnNames = rawData.map(d => d.key);

//
// Process out data into a TimeSeries
//

// const name = "series";
// const columns = ["time", ...columnNames];
// const points = [];
//
// for (let i = 0; i < numPoints; i++) {
//   const t = rawData[0].values[i][0];
//   const point = [t];
//   rawData.forEach(d => {
//     point.push(d.values[i][1]);
//   });
//   points.push(point);
// }
// const dfsfd = points;
//
// console.log(points);
//
// const series = new TimeSeries({name, columns, points});

export default class TCPGraph extends React.Component {
  constructor(props) {
    super(props);

    let { data } = props;

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
    if (points.length !== 1)
      seriesData.push(points[points.length - 1]);
    seriesData.sort((a, b) => a[0] - b[0]);

    if (seriesData[seriesData.length - 1][0] - seriesData[0][0] < 1000) {
      let ary = this.generateEmptyArray(5);
      ary[0] = points[0][0]-1000;
      seriesData.unshift(ary);

      ary = this.generateEmptyArray(5);
      ary[0] = points[points.length - 1][0]+1000;
      seriesData.push(ary);
    }

    return seriesData;
  };

  calculateTimeSeries = (data) => {
    let timePoints = {};
    data.forEach(tcpStream => {
      console.log(tcpStream);
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
      })
    });
    let seriesData = this.normalizeTimeSeries(timePoints, 5);


    // todo: flatten out adjacent points with separate helper function in common/Helpers.js

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