import React from 'react';
import { Charts, ChartContainer, ChartRow, YAxis, BarChart, AreaChart, Legend, styler } from "react-timeseries-charts";
import { Index, TimeSeries } from "pondjs";
import { Row, Column, Alignments } from 'react-foundation';

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

    let { data } = props;
    this.state = this.calculateTimeSeries(data);

    // let series = new TimeSeries({
    //   "name": "traffic",
    //   "columns": ["time", "in", "out"],
    //   "points": [[0, 0, 0]]
    // });
    //
    // this.state = {
    //   tracker: null,
    //   series,
    //   timerange: series.timerange(),
    // }
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log(nextProps);
  //   let { data } = nextProps;
  //   console.log(data);
  //
  //   let points = {}, seriesData = [];
  //   data.forEach(entry => {
  //     if (!points[entry.time]) {
  //       points[entry.time] = [entry.time*1000, entry.traffic.up.bytes, entry.traffic.down.bytes]
  //     } else {
  //       points[entry.time][1] += entry.traffic.up.bytes;
  //       points[entry.time][2] += entry.traffic.down.bytes;
  //     }
  //   });
  //   points = Object.keys(points).map(key => points[key]).sort((a, b) => a[0] - b[0]);
  //
  //   seriesData.push(points[0]);
  //   for (let i = 1; i < points.length - 1; i++) {
  //     if (points[i][0] - points[i-1][0] > 1000)
  //       seriesData.push([points[i][0]-1000, 0, 0]);
  //     if (points[i+1][0] - points[i][0] > 1000)
  //       seriesData.push([points[i][0]+1000, 0, 0]);
  //     seriesData.push(points[i]);
  //   }
  //   seriesData.push(points[points.length - 1]);
  //   seriesData.sort((a, b) => a[0] - b[0]);
  //
  //   let series = new TimeSeries({
  //     "name": "traffic",
  //     "columns": ["time", "in", "out"],
  //     "points": seriesData
  //   });
  //
  //   this.setState({
  //     series,
  //     timerange: series.timerange(),
  //   });
  //
  // }

  calculateTimeSeries = (data) => {
    let timePoints = {};
    data.forEach(point => {
      if (!timePoints[point.time]) {
        timePoints[point.time] = ['1s-'+point.time, 0, 0];
      }

      timePoints[point.time][1] += point.traffic.up.bytes;
      timePoints[point.time][2] -= point.traffic.down.bytes;
    });

    // delete empty nodes
    Object.keys(timePoints).forEach(k => (timePoints[k][1] == 0 && timePoints[k][2] == 0) ? delete timePoints[k] : '');

    let seriesData = [];
    Object.keys(timePoints).forEach(x => seriesData.push(timePoints[x]));

    let columns = ["index", "bytes_up", "bytes_down"];
    let series = new TimeSeries({
      "name": "netflow_traffic",
      "columns": columns,
      "points": seriesData
    });

    console.log(seriesData);

    return {
      series,
      timerange: series.range(),
      columns,
      style: styler(columns)
    };
  };

  handleTrackerChanged = (t) => {
    this.setState({tracker: t});
  };

  render() {
    const legendCategories = this.state.columns.map(d => ({key: d, label: d}));
    let range = this.state.series.crop(this.state.timerange);
    let max = range.max('bytes_up') || 500;
    let min = range.min('bytes_down') || 500;
    let axis_height = Math.max(max, Math.abs(min));

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
              trackerPosition={this.state.tracker}
              onTrackerChanged={this.handleTrackerChanged}
              enablePanZoom={true}
              width={1080}
            >
              <ChartRow height="450">
                <YAxis id="net-traffic-volume" label="Net Traffic (B)" classed="traffic-in"
                       min={-axis_height} max={axis_height} width="70" type="linear"/>
                <Charts>
                  <BarChart
                    axis="net-traffic-volume"
                    spacing={3}
                    columns={["bytes_up", "bytes_down"]}
                    style={this.state.style}
                    series={this.state.series} />
                </Charts>
              </ChartRow>
            </ChartContainer>
          </Column>
        </Row>
      </div>
    );

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