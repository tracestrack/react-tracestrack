import React from "react";
import { SiteHeader, SiteFooter } from "../common/Page.js";
import CloudDatastore from "../../datastore/CloudDatastore.js";
//import CloudDatastore from "../../datastore/Mock.js";
import { formatCoordinate, formatDate } from "../../utils/Formatter.js";
import $ from "jquery";
import SessionManager from '../common/SessionManager.js';

class Table extends React.Component {

  delete(rn, title) {
    console.log(this.props);
    this.props.onDelete(rn, title);
  }

  render() {
    return (

      <table className="activity-table table table-hover table-striped">
        <tbody>
          <tr className="thead-dark">
            <th width="40"></th>
            <th width="350">Title</th>
            <th width="150">Date</th>
            <th width="120">Type</th>
            <th width="80">Country</th>
            <th width="100" />
          </tr>

          {this.props.stars.map((row, i) =>

                                <tr key={row.recordName}>
                                  <td>{i}</td>
                                  <td>{row.title}</td>
                                  <td>{row.datetime}</td>
                                  <td>{row.type}</td>
                                  <td>{row.countryCode}</td>
                                  <td><button className="btn btn-sm btn-outline-danger" record={row.recordName} onClick={this.delete.bind(this, row.recordName, row.title)}>Delete</button></td>
                                </tr>

                               )}
        </tbody>
      </table>
    );
  }
}

class StarsPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = { stars: [], moreComing: false, countries_visited: [] };
    this.countries_visited_dict = {};
    this.loading = false;
    this.continuationMarker = null;

    this.stars = [];

    SessionManager.checkAuth((u) => {
      CloudDatastore.getStars().then(this.handleResponse);
    }, (e) => {
      alert("Please login.");
      window.location.href = "/login";
    });
  }

  handleResponse = this.handleResponse.bind(this);
  handleResponse(results) {
    this.renderRecords(results.records);
    this.continuationMarker = results.continuationMarker;
    this.setState({moreComing: results.continuationMarker !== null});
    this.loading = false;
  }

  loadMore = this.loadMore.bind(this);
  loadMore() {
    if (this.loading) return;

    this.loading = true;

    CloudDatastore.getStars({continuationMarker: this.continuationMarker}).then(this.handleResponse);
  }

  onDelete = this.onDelete.bind(this);
  onDelete(recordName, title) {
    var _this = this;
    if (window.confirm("You're going to delete trace: \n" + title)) {
      CloudDatastore.removeRecord(recordName).then(
        re => {
          _this.stars = [];
          CloudDatastore.getStars().then(_this.handleResponse);
        }
      );
    }
  }

  updateCountryCode = this.updateCountryCode.bind(this);
  updateCountryCode() {

    if (window.confirm("Updating country code requires this page to be open. It may take a few minutes. Status can be seen in the country column. Continue?") === false) {
      return;
    }

    var _this = this;
    var updateInterval = setInterval(function() {
      var modified = false;
      for (var i in _this.stars) {
        var it = _this.stars[i];
        if (it.countryCode === null) {

          modified = true;

          // eslint-disable-next-line
          $.getJSON("https://api.tomtom.com/search/2/reverseGeocode/" + it.coordinate + ".json?key=rAdhraHZaRG4cJg9j9umkAW8u9tZRxs1", function(data) {

            CloudDatastore.getRecord(it.recordName, re => {
              re.fields.type = re.fields.type.value;
              re.fields.location = re.fields.location.value;
              re.fields.note = re.fields.note ? re.fields.note.value : null;
              re.fields.title = re.fields.title.value;
              re.fields.url = re.fields.url ? re.fields.url.value : null;
              re.fields.countryCode = data.addresses.length > 0 ? data.addresses[0].address.countryCode : "-";
              re.fields.countrySubdivision = data.addresses.length > 0 ? data.addresses[0].address.countrySubdivision : "-";

              CloudDatastore.saveRecord(re, function(re2) {
                _this.stars[i].countryCode = re.fields.countryCode;
                _this.setState({ stars: _this.stars });
              });
            });
          });

          return it;
        }
      }
      if (modified === false) {
        clearInterval(updateInterval);
        alert("done");
      }
    }, 2000);
  }

  renderRecords = this.renderRecords.bind(this);
  renderRecords(records) {

    console.debug(records);

    var countries_visited = this.state.countries_visited;
    this.loading = false;

    for (var i in records) {

      let date = new Date(records[i].created.timestamp);

      this.stars.push({
        title: records[i].fields.title ? records[i].fields.title.value : "Untitled",
        type: records[i].fields.type.value === 1 ? "Visisted" : "Want to visit",
        recordName: records[i].recordName,
        datetime: formatDate(date),
        coordinate: formatCoordinate(records[i].fields.location.value.latitude, records[i].fields.location.value.longitude),
        countryCode: records[i].fields.countryCode ? records[i].fields.countryCode.value : null,
        countrySubdivision: records[i].fields.countrySubdivision ? records[i].fields.countrySubdivision.value : null
      });

      if (records[i].fields.countryCode && records[i].fields.type.value === 1) {
        let tmp = records[i].fields.countryCode.value;
        if (tmp !== "" && tmp !== "-") {
          if (this.countries_visited_dict[tmp] === null) {
            this.countries_visited_dict[tmp] = 1;
            countries_visited.push(tmp);
          }
        }
      }

    }

    this.setState({ stars: this.stars, countries_visited: countries_visited });

  };

  render() {
    return (


      <div className="default">

        <SiteHeader selected="stars" />

        <main role="main" className="container">
          <h1 className="mt-5">Your star list</h1>
          <p className="lead"></p>

          <Table onDelete={this.onDelete} stars={this.state.stars} />

          <div className="countriesVisisted">
            <p className="lead">Countries visited in the above list [{this.state.countries_visited.length}]:</p>
            {this.state.countries_visited.map((row, i) =>
                                              <span>{row}</span>
                                             )}
          </div>

          <center>
            {this.state.moreComing && (<button type="button" className="btn btn-primary" onClick={this.loadMore}>Load More</button>)}

          </center>

          <h3>Actions</h3>
          <p>

            <button type="button" className="btn btn-secondary" onClick={this.updateCountryCode}>Update country code</button>

          </p>

          <p>Country code is powered by TomTom API</p>
        </main>
        <SiteFooter />
      </div>
    );
  }
}


export default StarsPage;
