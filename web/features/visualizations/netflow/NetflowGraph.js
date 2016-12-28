// http://software.es.net/react-timeseries-charts/#/example/traffic?_k=axqji5

import React from 'react';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, AreaChart, styler } from "react-timeseries-charts";
import { Index, TimeSeries } from "pondjs";

// const dataset = [ { "_id": "58406fa4be8d0825476c810b", "src": "0.0.0.0", "dst": "255.255.255.255", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 2, "bytes": 582 } }, "time": 1479406461 }, { "_id": "58406fa4be8d0825476c810c", "src": "0.0.0.0", "dst": "255.255.255.255", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 1, "bytes": 291 } }, "time": 1479406462 }, { "_id": "58406fa4be8d0825476c810d", "src": "0.0.0.0", "dst": "255.255.255.255", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 3, "bytes": 909 } }, "time": 1479406464 }, { "_id": "58406fa4be8d0825476c810e", "src": "172.24.1.55", "dst": "172.24.1.1", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 3, "bytes": 245 } }, "time": 1479406464 }, { "_id": "58406fa4be8d0825476c810f", "src": "54.239.25.187", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 7, "bytes": 3404 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479406464 }, { "_id": "58406fa4be8d0825476c8110", "src": "172.24.1.55", "dst": "129.6.15.30", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 1, "bytes": 90 } }, "time": 1479406464 }, { "_id": "58406fa4be8d0825476c8111", "src": "172.24.1.1", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 10, "bytes": 2407 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479406464 }, { "_id": "58406fa4be8d0825476c8112", "src": "172.24.1.55", "dst": "54.239.25.187", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 9, "bytes": 1151 } }, "time": 1479406464 }, { "_id": "58406fa4be8d0825476c8113", "src": "172.24.1.55", "dst": "54.239.25.187", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 10, "bytes": 618 } }, "time": 1479406465 }, { "_id": "58406fa4be8d0825476c8114", "src": "54.239.25.187", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 8, "bytes": 3654 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479406465 }, { "_id": "58406fa4be8d0825476c8115", "src": "54.239.25.187", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 6, "bytes": 606 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479406466 }, { "_id": "58406fa4be8d0825476c8116", "src": "172.24.1.55", "dst": "54.239.25.187", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 5, "bytes": 1753 } }, "time": 1479406466 }, { "_id": "58406fa4be8d0825476c8117", "src": "54.239.25.187", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 1, "bytes": 128 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479406467 }, { "_id": "58406fa4be8d0825476c8118", "src": "54.239.25.187", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 1, "bytes": 128 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479406469 }, { "_id": "58406fa4be8d0825476c8119", "src": "0.0.0.0", "dst": "255.255.255.255", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 1, "bytes": 303 } }, "time": 1479407037 }, { "_id": "58406fa4be8d0825476c811a", "src": "172.24.1.55", "dst": "172.24.1.1", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 2, "bytes": 160 } }, "time": 1479407037 }, { "_id": "58406fa4be8d0825476c811b", "src": "54.239.25.187", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 7, "bytes": 3404 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479407037 }, { "_id": "58406fa4be8d0825476c811c", "src": "172.24.1.55", "dst": "129.6.15.30", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 1, "bytes": 90 } }, "time": 1479407037 }, { "_id": "58406fa4be8d0825476c811d", "src": "172.24.1.1", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 3, "bytes": 880 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479407037 }, { "_id": "58406fa4be8d0825476c811e", "src": "172.24.1.55", "dst": "54.239.25.187", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 9, "bytes": 1135 } }, "time": 1479407037 }, { "_id": "58406fa4be8d0825476c811f", "src": "129.6.15.30", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 1, "bytes": 90 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479407037 }, { "_id": "58406fa4be8d0825476c8120", "src": "172.24.1.55", "dst": "54.239.25.187", "mac": "50:f5:da:57:8b:ec", "traffic": { "down": { "count": 0, "bytes": 0 }, "up": { "count": 20, "bytes": 2641 } }, "time": 1479407040 }, { "_id": "58406fa4be8d0825476c8121", "src": "54.239.25.187", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 18, "bytes": 4741 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479407040 }, { "_id": "58406fa4be8d0825476c8122", "src": "54.239.25.187", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 1, "bytes": 54 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479407041 }, { "_id": "58406fa4be8d0825476c8123", "src": "54.239.25.187", "dst": "172.24.1.55", "mac": "b8:27:eb:0c:b8:a2", "traffic": { "down": { "count": 1, "bytes": 54 }, "up": { "count": 0, "bytes": 0 } }, "time": 1479407043 } ];
//
// const points = {};
// dataset.forEach(entry => {
//   if (!points[entry.time]) {
//     points[entry.time] = [entry.time*1000, entry.traffic.up.bytes, entry.traffic.down.bytes]
//   } else {
//     points[entry.time][1] += entry.traffic.up.bytes;
//     points[entry.time][2] += entry.traffic.down.bytes;
//   }
// });
//
//
// let points = Object.keys(points).map(key => points[key]).sort((a, b) => a[0] - b[0]);
// const seriesData = [];
// // finalData.push(initialPoints[0]);
// // for (let i = 1; i < initialPoints.length; i++) {
// //   if (initialPoints[i][0] - initialPoints[i-1][0] > 1000)
// //     finalData.push([initialPoints[i-1][0]+1000, 0, 0]);
// //   finalData.push(initialPoints[i]);
// // }
//
// seriesData.push(points[0]);
// for (let i = 1; i < points.length - 1; i++) {
//   if (points[i][0] - points[i-1][0] > 1000)
//     seriesData.push([points[i][0]-1000, 0, 0]);
//   if (points[i+1][0] - points[i][0] > 1000)
//     seriesData.push([points[i][0]+1000, 0, 0]);
//   seriesData.push(points[i]);
// }
// seriesData.push(points[points.length - 1]);
// seriesData.sort((a, b) => a[0] - b[0]);
//
const upDownStyler = styler([
  {key: "in", color: "#C8D5B8"},
  {key: "out", color: "#9BB8D7"}
]);
//
//
// let series = new TimeSeries(data);

export default class NetflowGraph extends React.Component {
  constructor(props) {
    super(props);

    let series = new TimeSeries({
      "name": "traffic",
      "columns": ["time", "in", "out"],
      "points": [[0, 0, 0]]
    });

    this.state = {
      tracker: null,
      series,
      timerange: series.timerange(),
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    let { data } = nextProps;
    console.log(data);

    let points = {}, seriesData = [];
    data.forEach(entry => {
      if (!points[entry.time]) {
        points[entry.time] = [entry.time*1000, entry.traffic.up.bytes, entry.traffic.down.bytes]
      } else {
        points[entry.time][1] += entry.traffic.up.bytes;
        points[entry.time][2] += entry.traffic.down.bytes;
      }
    });
    points = Object.keys(points).map(key => points[key]).sort((a, b) => a[0] - b[0]);

    seriesData.push(points[0]);
    for (let i = 1; i < points.length - 1; i++) {
      if (points[i][0] - points[i-1][0] > 1000)
        seriesData.push([points[i][0]-1000, 0, 0]);
      if (points[i+1][0] - points[i][0] > 1000)
        seriesData.push([points[i][0]+1000, 0, 0]);
      seriesData.push(points[i]);
    }
    seriesData.push(points[points.length - 1]);
    seriesData.sort((a, b) => a[0] - b[0]);

    let series = new TimeSeries({
      "name": "traffic",
      "columns": ["time", "in", "out"],
      "points": seriesData
    });

    this.setState({
      series,
      timerange: series.timerange(),
    });

  }

  handleTrackerChanged = (t) => {
    this.setState({tracker: t});
  };

  render() {
    let range = this.state.series.crop(this.state.timerange);
    let max = Math.max(range.max('in') || 10, range.max('out') || 10);

    return (
      <ChartContainer
        onTimeRangeChanged={(timerange) => this.setState({timerange})}
        timeRange={this.state.timerange}
        trackerPosition={this.state.tracker}
        onTrackerChanged={this.handleTrackerChanged}
        width={1080}
        enablePanZoom={true}
      >
        <ChartRow height={400}>
          <Charts>
            <AreaChart
              axis="traffic"
              series={this.state.series}
              columns={{up: ["in"], down: ["out"]}}
              style={upDownStyler}
              interpolation="curveLinear"
            />
          </Charts>
          <YAxis
            id="traffic"
            label="Traffic (bps)"
            min={-max} max={max}
            absolute={true}
            width={60}
            type="linear"/>
        </ChartRow>
      </ChartContainer>
    );
  }
}