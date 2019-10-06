import React from "react";
import { SiteHeader, SiteFooter } from "../common/Page.js";
import CloudDatastore from "../../datastore/CloudDatastore.js";
//import CloudDatastore from "../../datastore/Mock.js";
import { formatDate } from "../../utils/Formatter.js";
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
                                  <td>{row.countrySubdivision}, {row.countryCode}</td>
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
    this.continuationMarker = null;

    this.stars = [];

    let _this = this;
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
    this.setState({moreComing: results.continuationMarker !== undefined});
  }

  loadMore = this.loadMore.bind(this);
  loadMore() {
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

  renderRecords = this.renderRecords.bind(this);
  renderRecords(records) {

    var countries_visited = this.state.countries_visited;

    for (var i in records) {

      let date = new Date(records[i].created.timestamp);

      this.stars.push({
        title: records[i].fields.title ? records[i].fields.title.value : "Untitled",
        type: records[i].fields.type ? (records[i].fields.type.value === 1 ? "Visisted" : "Want to visit") : "Nil",
        recordName: records[i].recordName,
        datetime: formatDate(date),
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

        <main role="main">
          <div className="col">
          <h1 className="mt-5">Your star list</h1>
            <p className="lead">all your stars are listed here</p>

          <Table onDelete={this.onDelete} stars={this.state.stars} />

          <center>
            {this.state.moreComing && (<button type="button" className="btn btn-primary" onClick={this.loadMore}>Load More</button>)}

          </center>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }
}


export default StarsPage;
