import React from 'react';
import { SiteHeader, SiteFooter } from '../common/Page.js';
import Datastore from '../../datastore/Datastore.js';
import { formatDistance, formatSpeed, formatDate, formatDuration, formatAltitude } from '../../utils/Formatter.js';
import SessionManager from '../common/SessionManager.js';
import icon_walking from "../../resources/img/walking.png";
import icon_bike from "../../resources/img/bike.png";
import icon_running from "../../resources/img/running.png";
import icon_bus from "../../resources/img/bus.png";
import icon_train from "../../resources/img/train.png";
import icon_ferry from "../../resources/img/ferry.png";
import icon_flight from "../../resources/img/flight.png";

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

  delete(recordName, title) {
    console.log(this.props);
    this.props.onDelete(recordName, title);
  }

  render() {
    return (<table className="activity-table table table-hover table-striped">
               <tbody>
                 <tr className="thead-dark">
                   <th width="50" />
                   <th width="60">Type</th>
                   <th width="350">Title</th>
                   <th width="200">Date</th>
                   <th width="130">Distance</th>
                   <th width="130">Duration</th>
                   <th width="150">Avg. Speed</th>
                   <th width="100">Climbing</th>
                   <th width="90"></th>
                 </tr>

                 {this.props.traces.map((row, id) =>

                                        <tr key={row.recordName}>
                                          <td>{id}</td>
                                          <td>{getImageURLForType(row.type)}</td>
                                          <td><a href={"map#trace=" + row.recordName}>{row.title}</a></td>
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
    this.state = { traces: [] };

    let _this = this;
    SessionManager.checkAuth((u) => {
      Datastore.getInstance().getTraces().then(this.handleResponse);
      _this.setState({loading: true});    
    });
  }

  loadMore = this.loadMore.bind(this);
  loadMore() {
    Datastore.getInstance().getTraces({continuationMarker: this.continuationMarker}).then(this.handleResponse);
  }

  handleResponse = this.handleResponse.bind(this);
  handleResponse(results) {
    this.renderRecords(results.records);
    this.continuationMarker = results.continuationMarker;
    this.setState({moreComing: results.continuationMarker !== undefined, loading: false});    
  }

  onDelete = this.onDelete.bind(this);
  onDelete(recordName, title) {
    var _this = this;
    if (window.confirm("You're going to delete trace: \n" + title)) {
      Datastore.getInstance().removeRecord(recordName).then(
        (re) => {
          _this.traces = [];
          Datastore.getInstance().getTraces().then(_this.handleResponse);
        },
        (err) => {
          alert(err);
        }
      );
    }
  }

  renderRecords = this.renderRecords.bind(this);
  renderRecords(records) {

    console.log(records);

    for (var i in records) {

      let date = new Date(records[i].fields.startDate.value + records[i].fields.secondsFromGMT.value * 1000 + new Date(records[i].fields.startDate.value).getTimezoneOffset() * 1000 * 60);

      this.traces.push({
        type: records[i].fields.type.value,
        title: records[i].fields.title.value,
        date: formatDate(date),
        recordName: records[i].recordName,
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

        <main role="main">
          <div className="col">
            <h1 className="mt-5">Your trace list</h1>
            <p className="lead">all your traces are listed here</p>

            <div>
              <Table onDelete={this.onDelete} traces={this.state.traces} />
              <center>
                {this.state.moreComing && (<button className="btn btn-primary" onClick={this.loadMore}>Load More</button>)}
              </center>
            </div>


            {this.state.loading === false && this.state.traces.length === 0 && (
              <center>There is no traces yet.</center>
            )}

          </div>
        </main>

        <SiteFooter />
      </div>
    );
  }
}

export default TracesPage;
