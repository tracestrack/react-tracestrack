import React, { Component } from 'react';
import {SiteHeader, SiteFooter} from './Account.js';
import CKComponent from './Cloud.js';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import {formatDistance, formatSpeed, formatDate, formatDuration} from './Formatter.js';

class Table extends React.Component {

    constructor(props) {
	super(props);
    }

    render() {
	return (<table className="activity-table">
		<tr>
		<th>Path</th>
		<th width="200">Title</th>
		<th width="200">Date</th>
		</tr>
		
		{this.props.traces.map((row) => 
				       <tr>
				       <td>{row.path}</td>
				       <td>{row.title}</td>
				       <td>{row.date}</td>
				       </tr>
				       
				      )}
		</table>
	       )
    }
}

class Manage extends React.Component {

    constructor(props) {
	super(props);
	this.state = {traces: []};
    }

    renderRecords = this.renderRecords.bind(this);
    renderRecords(records) {

	console.log(records);
	
	for (var i in records) {

	    let date = new Date(records[i].fields.startDate.value + records[i].fields.secondsFromGMT.value * 1000);

	    this.traces.push({path: records[i].fields.path.value,
			      title: records[i].fields.title.value,
			      date: formatDate(date),
			      recordName: records[i].recordName
			});
	}		

	this.setState({traces: this.traces});

    }
    
    handleLoginSuccess = this.handleLoginSuccess.bind(this);
    handleLoginSuccess() {
	if (window.userIdentity) {

	    this.traces = [];	    
	    this._ck.loadTracesOrderByDate(null, this.renderRecords);
	}	
    }

    loadMore = this.loadMore.bind(this);
    loadMore() {
	    this._ck.loadTracesOrderByDateNext(this.renderRecords);
    }

    removeDuplis = this.removeDuplis.bind(this);
    removeDuplis() {
	var _this = this;
	this._ck.loadTracesOrderByDateNext(function(records) {

	    document.body.scrollTop = document.body.scrollHeight;
	    _this.renderRecords(records);

	}, true, function() {

	    var m = {};
	    var traces = _this.state.traces;
	    for (var i in traces) {
		if (m[traces[i].path] == null) {
		    m[traces[i].path] = [traces[i]];
		}
		else {
		    m[traces[i].path].push(traces[i]);
		}
	    }

	    if (window.confirm("You have " + Object.keys(m).length + " unique Traces. Found " + (traces.length - Object.keys(m).length) + " duplicates. Are you sure to remove them?")) {

		var count = 0
		Object.keys(m).forEach(function(key) {

		    for (var i = 0; i < m[key].length - 1; i++) {
			count ++;
			setTimeout(function(){
			    var k = i;
			    
			    _this._ck.removeRecord(m[key][k].recordName, function(p) {
				console.log("done", p);
			    });
			}, 600 * count);
		    }


		})

	    }
	});
    }

    
    render() {
	return (
		<div className='default'>

		<CKComponent ref={(ck) => {this._ck = ck;}} onLoginSuccess={this.handleLoginSuccess} />
		
		<SiteHeader selected='activities' />

		<Table traces={this.state.traces}/>

	    <center>
		<button onClick={this.loadMore}>Load More</button>
		<button onClick={this.removeDuplis}>Remove Duplicates</button>
		</center>
		
		<SiteFooter />
		</div>
	);
    }
}


export default Manage;
