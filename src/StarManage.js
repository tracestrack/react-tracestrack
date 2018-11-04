import React, { Component } from 'react';
import {SiteHeader, SiteFooter} from './Account.js';
import CKComponent from './Cloud.js';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import {formatCoordinate, formatDistance, formatSpeed, formatDate, formatDuration} from './Formatter.js';

class Table extends React.Component {

    constructor(props) {
	super(props);
    }

    delete(rn, title) {
	console.log(this.props);
	this.props.onDelete(rn, title);
    }
    
    render() {
	return (
	    
	    <table className="activity-table">
		<tbody>
		<tr>
		<th width="40"></th>
		<th width="400">Title</th>
		<th width="200">Creation</th>
		<th width="200">Coordinate</th>
		<th>Type</th>
		<th width="200">Country</th>
		</tr>
		
		{this.props.stars.map((row,i) =>
				       
				       <tr key={row.recordName}>
				       <td>{i}</td>
				       <td>{row.title}</td>
				       <td>{row.datetime}</td>
				       <td>{row.coordinate}</td>
				       <td>{row.type}</td>
				      <td>{row.countryCode}</td>

				       </tr>
				       
				      )}
		</tbody>
		</table>
	       );
    }
}

class StarManage extends React.Component {

    constructor(props) {
	super(props);
	this.state = {stars: [], hasMore: true, countries_visited: []};
	this.countries_visited_dict = {};
    }

    onDelete = this.onDelete.bind(this);
    onDelete (recordName, title) {
	var _this = this;
	if (window.confirm("You're going to delete trace: \n" + title)) {
	    _this.ck.removeRecord(recordName, function(p) {
		console.log("done", p);
		_this.traces = [];
		_this.ck.loadTracesOrderByDate(null, _this.renderRecords);

	    });
	}
    }

    updateCountryCode = this.updateCountryCode.bind(this);
    updateCountryCode() {

	if (window.confirm("Updating country code requires this page to be open. It may take a few minutes. Status can be seen in the country column. Continue?") == false) {
	    return;
	}
	
	var _this = this;
	var updateInterval = setInterval(function(){
	    var modified = false;
	    for (var i in _this.stars) {
		var it = _this.stars[i];
		if (it.countryCode == null) {

		    modified = true;
		    
		    window.jQuery.getJSON("https://api.tomtom.com/search/2/reverseGeocode/" + it.coordinate +".json?key=rAdhraHZaRG4cJg9j9umkAW8u9tZRxs1", function( data ) {

			_this.ck.loadRecord(it.recordName, false, function(re) {
			    re.fields.type = re.fields.type.value;
			    re.fields.location = re.fields.location.value;
			    re.fields.note = re.fields.note ? re.fields.note.value : null;
			    re.fields.title = re.fields.title.value;
			    re.fields.url = re.fields.url ? re.fields.url.value : null;
			    re.fields.countryCode = data.addresses.length > 0 ? data.addresses[0].address.countryCode : "-";
			    re.fields.countrySubdivision = data.addresses.length > 0 ? data.addresses[0].address.countrySubdivision : "-";

			    _this.ck.saveRecord(re, function (re2) {
				_this.stars[i].countryCode = re.fields.countryCode;
				_this.setState({stars: _this.stars});
			    });

			});
		    });
		    
		    return it;
		}
	    }
	    if (modified == false) {
		clearInterval(updateInterval);
		alert("done");
	    }
	}, 2000);
    }

    renderRecords = this.renderRecords.bind(this);
    renderRecords(records) {

	var countries_visited = this.state.countries_visited;

	for (var i in records) {

	    let date = new Date(records[i].created.timestamp);
	    
	    this.stars.push({title: records[i].fields.title.value,
			     type: records[i].fields.type.value == 1?"Visisted":"Want to visit",
			     recordName: records[i].recordName,
			     datetime: formatDate(date),
			     coordinate: formatCoordinate(records[i].fields.location.value.latitude, records[i].fields.location.value.longitude),
			     countryCode: records[i].fields.countryCode ? records[i].fields.countryCode.value : null,
			     countrySubdivision: records[i].fields.countrySubdivision ? records[i].fields.countrySubdivision.value : null
			});

	    if (records[i].fields.countryCode && records[i].fields.type.value == 1) {
		let tmp = records[i].fields.countryCode.value;
		if (tmp != "" && tmp != "-") {
		    if (this.countries_visited_dict[tmp] == null) {
			this.countries_visited_dict[tmp] = 1;
			countries_visited.push(tmp);
		    }
		}	
	    }
		
	}		

	console.log(countries_visited);
	this.setState({stars: this.stars, countries_visited: countries_visited});

    };
    
    handleLoginSuccess = this.handleLoginSuccess.bind(this);
    handleLoginSuccess() {
	if (window.userIdentity) {

	    this.stars = [];	    
	    this.ck.loadStarsOrderByDate(null, this.renderRecords, false);
	}	
    }

    loadMore = this.loadMore.bind(this);
    loadMore() {
	var _this = this;
	this.ck.loadStarsOrderByDateNext(this.renderRecords, false, function() {
	    _this.setState({hasMore: false});
	});
    }

    
    render() {
	return (
		<div className='default'>

		<CKComponent ref={(_ck) => {this.ck = _ck;}} onLoginSuccess={this.handleLoginSuccess} />
		
		<SiteHeader selected='stars' />


	    <center>
	      { this.state.hasMore && (<button className="btn btn-primary" onClick={this.loadMore}>Load More</button>) }

		<button className="btn btn-primary" onClick={this.updateCountryCode}>Update country code</button>
		   
	    </center>
		
		<div className="countriesVisisted">
		  <h5>Countries visited in the following list [{this.state.countries_visited.length}]:</h5>
		    {this.state.countries_visited.map((row,i) =>
						      <span>{row}</span>
						     )}
		</div>
		
		<Table onDelete={this.onDelete} stars={this.state.stars}/>

	    <center>
	      { this.state.hasMore && (<button className="btn btn-primary" onClick={this.loadMore}>Load More</button>) }

		<button className="btn btn-primary" onClick={this.updateCountryCode}>Update country code</button>

	    <p className="starFooter">Country code is powered by TomTom API</p>
		   
		</center>
		
		<SiteFooter />
		</div>
	);
    }
}


export default StarManage;
