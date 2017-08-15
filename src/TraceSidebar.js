import React, { Component } from 'react';
import {MarkerType} from './App.js';
import {LiveMarkedArea} from './LiveMarkedArea.js';
import {formatDistance, formatSpeed, formatDate, formatDuration} from './Formatter.js';

const google = window.google;


class TraceSidebar extends Component {

    constructor(props) {
	super(props);

	var state = this.convertProps2State(props);
	state.editMode = false;
	
	this.state = state;
	this.ck = props.ck;
	
    }

    convertProps2State(props) {
	let data = props.trace;
	console.log(data);
	if (data) {
	    return {
		title: data.title,
		distance: formatDistance(data.distance),
		averageSpeed: formatSpeed(data.averageSpeed),
		duration: formatDuration(data.duration),
		type: data.type,
		startDate: formatDate(new Date(data.startDate)),
		note: data.note ? data.note : '',
		elevation: data.elevation
	    };
	}
	return {
	    note: ""
	};
    }

    componentWillReceiveProps(props) {
	this.setState(this.convertProps2State(props));
    }

    render() {
	return (
		<div className='sidebar-right'>

	      <div className='controls'>
		{ !this.state.editMode ?
		    (<button onClick={this.enterEditMode}>Edit</button>):
		  (
		      <div>
			<button onClick={this.remove}>Delete</button>
			<button onClick={this.cancel}>Cancel</button> 
			<button onClick={this.save}>Save</button>
		      </div>
		  )
			}
	      </div>
		<h1 className='name'>
		{ !this.state.editMode ?
		  this.state.title :
		  (<input type='text' placeholder='Name' defaultValue={this.state.title} onChange={this.titleChange} />)
		}
	    </h1>
		<table className='infoBox'>
		<tbody>
		<tr>
		<td className='td-trace'>Distance</td><td>{this.state.distance}</td>
		</tr>

		<tr>
		<td className='td-trace'>Average Speed</td><td>{this.state.averageSpeed}</td>
		</tr>
		<tr>
		<td className='td-trace'>Date</td><td>{this.state.startDate}</td>
		</tr>
		<tr>
		<td className='td-trace'>Elevation</td><td>{this.state.elevation}</td>
		</tr>
		<tr>
		<td className='td-trace'>Duration</td><td>{this.state.duration}</td>
		</tr>

	    </tbody>
	    </table>
		<LiveMarkedArea editMode={this.state.editMode} label="Notes" defaultValue={this.state.note}  value={this.state.note} onChange={this.noteChange}/>

	    </div>
	);
    }

}

export default TraceSidebar;
