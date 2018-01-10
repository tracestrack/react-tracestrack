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

    render() {
	return (
		<div>

		<CKComponent ref={(ck) => {this._ck = ck;}} onLoginSuccess={this.handleLoginSuccess} />
		
		<SiteHeader selected='activities' />

		<Table traces={this.state.traces}/>

		<button onClick={this.loadMore}>Load More</button>

		<SiteFooter />
		</div>
	);
    }
}


export default Manage;
