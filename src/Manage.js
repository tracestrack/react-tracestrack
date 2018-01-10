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
		<td width="400">Title</td>
		<td>Path</td>
		<td width="200">Date</td>
		</tr>
		
		{this.props.traces.map((row) => 
				       <tr>
				       <td>{row.title}</td>
				       <td>{row.path}</td>
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

    handleLoginSuccess = this.handleLoginSuccess.bind(this);

    handleLoginSuccess() {
	var _this = this;
	if (window.userIdentity) {
	    this._ck.loadTracesOrderByDate(function(records) {

		var traces = [];

		console.log(records);
		
		for (var i in records) {

		    let date = new Date(records[i].fields.startDate.value + records[i].fields.secondsFromGMT.value * 1000);

		    traces.push({path: records[i].fields.path.value,
				 title: records[i].fields.title.value,
				 date: formatDate(date),
				});
		}		


		_this.setState({traces: traces});
	    });
	}	
    }


    render() {
	return (
		<div>

	    <h1> List latest 100 traces </h1>

		<CKComponent ref={(ck) => {this._ck = ck;}} onLoginSuccess={this.handleLoginSuccess} />
		
		<SiteHeader selected='activities' />

		<Table traces={this.state.traces}/>

	    <div>Only showing first 100 traces. There can be duplicates. Will add a function to remove these.</div>

		<SiteFooter />
		</div>
	);
    }
}


export default Manage;
