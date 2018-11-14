import React, { Component } from 'react';
import {SiteHeader, SiteFooter} from './Account.js';
import CKComponent from './Cloud.js';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import {formatDistance, formatSpeed, formatDate, formatDuration} from './Formatter.js';
import gpxParser from './GPXParser.js';


class UploadView extends React.Component {

   constructor(props) {
	super(props);
    }

    upload(e) {
        let file = document.getElementById('fileUpload').files[0];

        let gpx = new gpxParser();

        var reader = new FileReader();
        reader.onload = function(event) {
            gpx.parse(reader.result);
	    console.log(gpx.tracks[0].points);
	};
        reader.readAsText(file);

    }
        
    render() {
	return (<div className="uploadBg">

		<div className="form-group">
		<input type="file" className="form-control-file" id="fileUpload" onChange={this.upload} />
		</div>

		</div>		

	       );
    }
    
};

class Table extends React.Component {

    constructor(props) {
	super(props);
    }

    delete(rn, title) {
	console.log(this.props);
	this.props.onDelete(rn, title);
    }
    
    render() {
	return (<table className="activity-table">
		<tbody>
		<tr>
		<th width="50"/>
		<th>Path</th>
		<th width="200">Title</th>
		<th width="200">Date</th>
		</tr>
		
		{this.props.traces.map((row,id) =>
				       
				       <tr key={row.recordName}>
				       <td>{id}</td>
				       <td>{row.path}</td>
				       <td>{row.title}</td>
				       <td>{row.date}</td>
				       <td><button record={row.recordName} className="btn btn-sm btn-outline-danger" onClick={this.delete.bind(this, row.recordName, row.title)}>Delete</button></td>
				       </tr>
				       
				      )}
		</tbody>
		</table>
	       );
    }
}

class ActivityManage extends React.Component {

    constructor(props) {
	super(props);
	this.state = {traces: []};
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
	    this.ck.loadTracesOrderByDate(null, this.renderRecords);
	}	
    }

    loadMore = this.loadMore.bind(this);
    loadMore() {
	    this.ck.loadTracesOrderByDateNext(this.renderRecords);
    }

    removeDuplis = this.removeDuplis.bind(this);
    removeDuplis() {
	var _this = this;
	this.ck.loadTracesOrderByDateNext(function(records) {

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

		var count = 0;
		Object.keys(m).forEach(function(key) {

		    for (var i = 0; i < m[key].length - 1; i++) {
			count ++;
			setTimeout(function(){

			    return function(k) {

				_this.ck.removeRecord(m[key][k].recordName, function(p) {
				    console.log("done", p);
				});
			    }(i);

			}, 600 * count);
		    }
		});

	    }
	});
    }

    
    render() {
	return (
		<div className='default'>

		<CKComponent ref={(_ck) => {this.ck = _ck;}} onLoginSuccess={this.handleLoginSuccess} />
		
		<SiteHeader selected='activities' />

		<main role="main" className="container">
		  <h1 className="mt-5">Your activity list</h1>
		  <p className="lead"></p>

		  { this.state.traces.length > 0 && (
		      <div>
			<Table onDelete={this.onDelete} traces={this.state.traces}/>			
			<center>
			  <button className="btn btn-primary" onClick={this.loadMore}>Load More</button>		    
		      </center></div>)
		      }


	    { this.state.traces.length == 0 && (
		<center>There is no activities yet.</center>
	    )}

		<p>
		<h3>Actions</h3>

		<button className="btn btn-primary" onClick={this.removeDuplis}>Upload</button>
		<button className="btn btn-danger" onClick={this.removeDuplis}>Remove Duplicates</button>


	    <UploadView />

	    </p>

		</main>
		<SiteFooter />
		</div>
	);
    }
}


export default ActivityManage;

