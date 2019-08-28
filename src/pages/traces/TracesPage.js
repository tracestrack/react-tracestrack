import React from 'react';
import { SiteHeader, SiteFooter } from '../common/Page.js';
import CloudDatastore from '../../datastore/CloudDatastore.js';
//import CloudDatastore from '../../datastore/Mock.js';
import { formatDistance, formatSpeed, formatDate, formatDuration, formatAltitude } from '../../utils/Formatter.js';
import gpxParser from '../../utils/GPXParser.js';
import SessionManager from '../common/SessionManager.js';
import icon_walking from "../../resources/img/walking.png";
import icon_bike from "../../resources/img/bike.png";
import icon_running from "../../resources/img/running.png";
import icon_bus from "../../resources/img/bus.png";
import icon_train from "../../resources/img/train.png";
import icon_ferry from "../../resources/img/ferry.png";
import icon_flight from "../../resources/img/flight.png";

// eslint-disable-next-line
class UploadView extends React.Component {

  constructor(props) {
    super(props);
    this.state = { trace: null };
  }

  upload = this.upload.bind(this)
  upload(e) {
    let _this = this;
    let file = document.getElementById('fileUpload').files[0];

    let gpx = new gpxParser();

    var reader = new FileReader();
    reader.onload = function(event) {
      gpx.parse(reader.result);
      console.log(gpx.tracks[0].points);

      var points = [];
      var i = 0;
      for (i in gpx.tracks[0].points) {
        points.push({ x: gpx.tracks[0].points[i].lat, y: gpx.tracks[0].points[i].lon });
      }

      var pp = simplify(points, 0.00001, false);

      var p = [];
      for (i in pp) {
        p.push([pp[i].y, pp[i].x]);
      }

      console.log(p);

      let t = { title: "HAH", distance: "20km", date: "2018" };
      _this.setState({ trace: t, traceGeoJSON: p });

    };
    reader.readAsText(file);

  }

  handleMapMounted = this.handleMapMounted.bind(this)
  handleMapMounted(map) {


  }

  render() {
    return (<div className="uploadBg">



              <h3>Upload</h3>

              <div className="form-group">
                <input type="file" className="form-control-file" id="fileUpload" onChange={this.upload} />
              </div>

              <hr />

              {this.state.trace && (<div>
                               <table>
                                 <tr>
                                   <td>Title</td>
                                   <td>Date</td>
                                   <td>Distance</td>
                                 </tr>

                                 <tr>
                                   <td>{this.state.trace.title}</td>
                                   <td>{this.state.trace.date}</td>
                                   <td>{this.state.trace.distance}</td>
                                 </tr>

                               </table>


                             </div>
                                   )}

            </div>

           );
  }

};

function getImageURLForType(type) {
    let icons  = [
        icon_walking,
        icon_bike,
        icon_running,
        icon_bus,
        icon_train,
        icon_ferry,
        icon_flight
    ];
    return <img src={icons[type]} alt="type icon"/>;
}

class Table extends React.Component {

  delete(rn, title) {
    console.log(this.props);
    this.props.onDelete(rn, title);
  }

  render() {
    return (<table className="activity-table">
               <tbody>
                 <tr>
                   <th width="50" />
                   <th width="60">Type</th>
                   <th width="250">Title</th>
                   <th width="250">Date</th>
                   <th width="150">Distance</th>
                   <th width="180">Duration</th>
                   <th width="200">Average Speed</th>
                   <th width="200">Elevation</th>
                   <th width="200"></th>
                 </tr>

                 {this.props.traces.map((row, id) =>

                                        <tr key={row.recordName}>
                                          <td>{id}</td>
                                          <td>{getImageURLForType(row.type)}</td>
                                          <td>{row.title}</td>
                                          <td>{row.date}</td>
                                          <td>{row.distance}</td>
                                          <td>{row.duration}</td>
                                          <td>{row.avgSpeed}</td>
                                          <td>{row.elevation}</td>
                                          <td><button record={row.recordName} className="btn btn-sm btn-outline-danger" onClick={this.delete.bind(this, row.recordName, row.title)}>Delete</button></td>
                                        </tr>

                                       )}
               </tbody>
             </table>
           );
  }
}

class TracesPage extends React.Component {

  constructor(props) {
    super(props);
    
    this.traces = [];
    this.state = { traces: [], showUpload: true };

    SessionManager.checkAuth().then((success) => {

      if (success) {
        CloudDatastore.getTraces().then(this.handleResponse);
      }
      else {
        alert("Please login.");
      }
    });
  }

  loadMore = this.loadMore.bind(this);
  loadMore() {
    CloudDatastore.getTraces({continuationMarker: this.continuationMarker}).then(this.handleResponse);
  }

  handleResponse = this.handleResponse.bind(this);
  handleResponse(results) {
    this.renderRecords(results.records);
    this.continuationMarker = results.continuationMarker;
    this.setState({moreComing: results.continuationMarker !== null});    
    this.loading = false;
  }

  onDelete = this.onDelete.bind(this);
  onDelete(recordName, title) {
    var _this = this;
    if (window.confirm("You're going to delete trace: \n" + title)) {
      CloudDatastore.removeRecord(recordName).then(
        re => {
          _this.traces = [];
          CloudDatastore.getTraces().then(_this.handleResponse);
        }
      );
    }
  }

  renderRecords = this.renderRecords.bind(this);
  renderRecords(records) {

    console.log(records);

    for (var i in records) {

      let date = new Date(records[i].fields.startDate.value + records[i].fields.secondsFromGMT.value * 1000);

      this.traces.push({
        type: records[i].fields.type.value,
        title: records[i].fields.title.value,
        date: formatDate(date),
        recordName: records[i].recordName.value,
        distance: formatDistance(records[i].fields.distance.value),
        duration: formatDuration(records[i].fields.duration.value),
        avgSpeed: formatSpeed(records[i].fields.averageSpeed.value),
        elevation: formatAltitude(Math.max(records[i].fields.elevation.value, 0))
      });
    }

    this.setState({ traces: this.traces });
  }

  render() {
    return (
      <div className='default'>

        <SiteHeader selected='traces' />

        <main role="main" className="container">
          <h1 className="mt-5">Your trace list</h1>
          <p className="lead"></p>

          {this.state.traces.length > 0 && (
            <div>
              <Table onDelete={this.onDelete} traces={this.state.traces} />
              <center>

                {this.state.moreComing && (<button className="btn btn-primary" onClick={this.loadMore}>Load More</button>)}
              </center></div>)
          }


          {this.state.traces.length === 0 && (
            <center>There is no traces yet.</center>
          )}

        </main>

        <SiteFooter />
      </div>
    );
  }
}


/*
  (c) 2017, Vladimir Agafonkin
  Simplify.js, a high-performance JS polyline simplification library
  mourner.github.io/simplify-js
*/

// square distance between 2 points
function getSqDist(p1, p2) {

  var dx = p1.x - p2.x,
      dy = p1.y - p2.y;

  return dx * dx + dy * dy;
}

// square distance from a point to a segment
function getSqSegDist(p, p1, p2) {

  var x = p1.x,
      y = p1.y,
      dx = p2.x - x,
      dy = p2.y - y;

  if (dx !== 0 || dy !== 0) {

    var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = p2.x;
      y = p2.y;

    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p.x - x;
  dy = p.y - y;

  return dx * dx + dy * dy;
}
// rest of the code doesn't care about point format

// basic distance-based simplification
function simplifyRadialDist(points, sqTolerance) {

  var prevPoint = points[0],
      newPoints = [prevPoint],
      point;

  for (var i = 1, len = points.length; i < len; i++) {
    point = points[i];

    if (getSqDist(point, prevPoint) > sqTolerance) {
      newPoints.push(point);
      prevPoint = point;
    }
  }

  if (prevPoint !== point) newPoints.push(point);

  return newPoints;
}

function simplifyDPStep(points, first, last, sqTolerance, simplified) {
  var maxSqDist = sqTolerance,
      index;

  for (var i = first + 1; i < last; i++) {
    var sqDist = getSqSegDist(points[i], points[first], points[last]);

    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (maxSqDist > sqTolerance) {
    if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index]);
    if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(points, sqTolerance) {
  var last = points.length - 1;

  var simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);

  return simplified;
}

// both algorithms combined for awesome performance
function simplify(points, tolerance, highestQuality) {

  if (points.length <= 2) return points;

  var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

  points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
  points = simplifyDouglasPeucker(points, sqTolerance);

  return points;
}

export default TracesPage;

