import React from 'react';
import { Charts, ChartContainer, ChartRow, YAxis, BarChart, AreaChart, Legend, styler } from "react-timeseries-charts";
import { Index, TimeSeries } from "pondjs";
import { Row, Column, Alignments } from 'react-foundation';

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
      Object.keys(tcpStream.traffic).forEach(time => {
        if (!timePoints[time]) {
          timePoints[time] = [`1s-`+time, 0, 0, 0, 0]; // unix_time, ssl_bytes_up, ssl_bytes_down, non_ssl_bytes_up, non_ssl_bytes_down
        }

        if (tcpStream.ssl.tls_client || tcpStream.ssl.tls_server) {
          timePoints[time][1] += tcpStream.traffic[time].up.bytes;
          timePoints[time][2] -= tcpStream.traffic[time].down.bytes;
        } else {
          timePoints[time][3] += tcpStream.traffic[time].up.bytes;
          timePoints[time][4] -= tcpStream.traffic[time].down.bytes;
        }
      })
    });
    let seriesData = [];
    Object.keys(timePoints).forEach(x => seriesData.push(timePoints[x]));

    let columns = ["index", "ssl_bytes_up", "ssl_bytes_down", "non_ssl_bytes_up", "non_ssl_bytes_down"];
    let series = new TimeSeries({
      "name": "tcp_traffic",
      "columns": columns,
      "points": seriesData
    });

    return {
      series,
      timerange: series.range(),
      columns,
      style: styler(columns)
    };
  };

  render() {
    const legendCategories = this.state.columns.map(d => ({key: d, label: d}));
    let range = this.state.series.crop(this.state.timerange);
    let max = Math.max(range.max('ssl_bytes_up') || 500, range.max('non_ssl_bytes_up') || 500);
    let min = Math.min(range.min('ssl_bytes_down') || 500, range.min('non_ssl_bytes_down') || 500);
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
                    columns={["ssl_bytes_up", "ssl_bytes_down", "non_ssl_bytes_up", "non_ssl_bytes_down"]}
                    style={this.state.style}
                    series={this.state.series} />
                </Charts>
              </ChartRow>
            </ChartContainer>
          </Column>
        </Row>
      </div>
    );

    // return (
    //   <div>
    //     <Row>
    //       <Column small={12}>
    //         <Legend categories={legendCategories} style={this.state.style} type="dot"/>
    //       </Column>
    //     </Row>
    //     <Row>
    //       <Column small={12}>
    //         <ChartContainer
    //           onTimeRangeChanged={(timerange) => this.setState({timerange})}
    //           timeRange={this.state.timerange}
    //           enablePanZoom={true}
    //           width={1080}
    //         >
    //           <ChartRow height="350">
    //             <YAxis
    //               id="y"
    //               min={-1000}
    //               max={1000}
    //               width="60"
    //               type="linear"/>
    //             <Charts>
    //               <AreaChart
    //                 stack={true}
    //                 axis="y"
    //                 style={this.state.style}
    //                 series={this.state.series}
    //                 columns={{up: ["ssl_bytes_up", "non_ssl_bytes_up"], down: ["ssl_bytes_down", "non_ssl_bytes_down"]}}
    //                 fillOpacity={0.4}
    //                 interpolation="curveLinear" />
    //             </Charts>
    //           </ChartRow>
    //         </ChartContainer>
    //       </Column>
    //     </Row>
    //   </div>
    // );
  }
}