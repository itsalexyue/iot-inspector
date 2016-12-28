import React from 'react';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, AreaChart, styler } from "react-timeseries-charts";
import { Index, TimeSeries } from "pondjs";

// Data
const rawData = require("./stacked.json");
console.log(rawData);
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
  }

  calculateTimeSeries = (data) => {
    let points = {}, connections = {}, connectionCount = 0;
    data.forEach(entry => {
      let key = entry.dst + ':' + entry.dstport, connId = connections[key];
      if (!connId) {
        connections[key] = ++connectionCount;
        connId = connectionCount;
      }

      Object.keys(entry.traffic).forEach(time => {
        if(!points[time]) {
          points[time] = [time*1000];
        }

        points[time][connId] = entry.traffic[time].down.bytes + entry.traffic[time].up.bytes;
      });
    });
    points = Object.keys(points).map(key => points[key]).sort((a, b) => a[0] - b[0]);

    let seriesData = [];
    seriesData.push(points[0]);
    for (let i = 1; i < points.length - 1; i++) {
      if (points[i][0] - points[i-1][0] > 1000)
        seriesData.push([points[i][0]-1000]);
      if (points[i+1][0] - points[i][0] > 1000)
        seriesData.push([points[i][0]+1000]);
      seriesData.push(points[i]);
    }
    seriesData.push(points[points.length - 1]);
    seriesData.sort((a, b) => a[0] - b[0]);

    seriesData.forEach(point => {
      for (let i = 1; i <= connectionCount; i++) {
        if (!point[i]) point[i] = 0;
      }
    });

    console.log(seriesData);


    let columns = ["time", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];
    // Object.keys(connections).forEach(connName => {
    //   columns[connections[connName]] = connName.toString();//connName;
    // });

    let series = new TimeSeries({
      "name": "traffic",
      "columns": columns,
      "points": seriesData
    });
    console.log(columns);
    console.log(seriesData);

    return {
      series,
      timerange: series.range(),
      columns,
      style: styler(series.columns())
    };
  };

  render() {
    return (
      <ChartContainer
        onTimeRangeChanged={(timerange) => this.setState({timerange})}
        timeRange={this.state.timerange}
        enablePanZoom={true}
        width={1080}
      >
        <ChartRow height="350">
          <YAxis
            id="y"
            min={0}
            max={1000}
            width="60"
            type="linear"/>
          <Charts>
            <AreaChart
              stack={true}
              axis="y"
              style={this.state.style}
              series={this.state.series}
              columns={{up: this.state.series.columns(), down: []}}
              fillOpacity={0.4}
              interpolation="curveLinear" />
          </Charts>
        </ChartRow>
      </ChartContainer>
    );
  }
}