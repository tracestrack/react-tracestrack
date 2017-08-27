import React, { Component } from 'react';
import {Coord, MarkerType} from './App.js';
import {LiveMarkedArea} from './LiveMarkedArea.js';
import GreenStarImg from './img/star_green.png';
import RedStarImg from './img/star_red.png';

import "./Sidebar.css";


const google = window.google;


class StarSidebar extends Component {

    constructor(props) {
	super(props);

	this.ck = props.ck;
	this.lastPoint = Coord(0, 0);
	this.lastType = -111;
	this.state = this.convertProps2State(props);
    }
    
    convertProps2State(props) {
	if (props.star != null) {
	    var data;
	    data = props.star;

	    if (this.lastPoint.lat == data.coord.lat && this.lastPoint.lng == data.coord.lng && this.lastType == data.type) {
		return;
	    }
	    else {
		this.lastPoint = data.coord;
		this.lastType = data.type;
	    }

	    var ret = {
		title: '',
		note: '',
		type: data.type,
		url: '',
		coordinate: data.coord,
		editMode: false,
		address: data.address
	    };

	    if (!ret.address) {
		this.loadAddress(data.coord);
	    }

	    console.log('xxx');
	    switch (props.star.type) {
	    case MarkerType.googlePlace:
		this.loadGooglePlace(data.data);
		break;
	    case MarkerType.new:
		ret.editMode = true;
		break;
	    case MarkerType.searchHit:

		break;
	    default:
		console.log('here');
		this.loadStar(data);
		
	    }
	    return ret;
	}
	return null;
    }

    

    enterEditMode = this.enterEditMode.bind(this);
    remove = this.remove.bind(this);    
    cancel = this.cancel.bind(this);
    save = this.save.bind(this);

    loadStar = this.loadStar.bind(this);    
    loadGooglePlace = this.loadGooglePlace.bind(this);
    loadAddress = this.loadAddress.bind(this);
    
    titleChange = this.titleChange.bind(this);
    urlChange = this.urlChange.bind(this);
    noteChange = this.noteChange.bind(this);

    setGreenStar = this.setGreenStar.bind(this);
    setRedStar = this.setRedStar.bind(this);

    loadStar(star) {

	let _this = this;
	
	this.ck.loadRecord(star.recordName, function(re) {	    
	    
    	    var states = {
		title: re.fields.title.value,
		note: re.fields.note.value,
		url: re.fields.url.value
	    };
	    _this.setState(states);
	});

    }
    
    setGreenStar() {
	this.state.type = MarkerType.green;
	this.save();
    }

    setRedStar() {
	this.state.type = MarkerType.red;
	this.save();
    }
    
    loadAddress(latlng) {

	var geocoder = new google.maps.Geocoder;
	let _this = this;
	geocoder.geocode({'location': latlng}, function(results, status) {
	    if (status === 'OK') {
		if (results[0]) {

		    _this.setState({
			address: results[0].formatted_address
		    });
		    

		} else {
		    window.alert('No results found');
		}
	    } else {
		window.alert('Geocoder failed due to: ' + status);
	    }
	});

    }

    loadGooglePlace(id) {
	var request = {
	    placeId: id
	};

	let _this = this;
	let MAP = '__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED';
	var service = new google.maps.places.PlacesService(window.map.context[MAP]);
	service.getDetails(request, callback);

	function createNoteFromGooglePlace(place) {

	    var photo = place.photos;
	    var md = '';
	    if (photo && photo.length > 0) {

		photo = photo[0];
		let $ = window.$;
		var el = $(photo.html_attributions[0]);
		window.el = el;

		md = '![]('+photo.getUrl({maxWidth:300})+`)

Photo credit: [`+el.text()+`](`+el.prop('href')+`)

`;
		
	    }	    
	    return md + `[View on Google Maps](`+place.url+`)`;
    
	}

	function callback(place, status) {
	    if (status == google.maps.places.PlacesServiceStatus.OK) {

		let state = {
		    title: place.name,
		    address: place.formatted_address,
		    url: place.website,
		    note: createNoteFromGooglePlace(place)
		};

		_this.setState(state);
		
	    }
	}

    }
    
    enterEditMode() {
	this.setState({editMode: true});
    }

    cancel() {
	this.setState({editMode: false});
    }
    remove() {

	var rn = this.props.star.recordName;
	console.log(rn);
	
	this.ck.removeRecord(rn);
    }
    
    save() {

	var star = {};
	star.fields = {};
	if (this.type == MarkerType.new) {
	    star.recordName = this.props.star.recordName;
	}

	star.fields.location = {latitude: this.state.coordinate.lat, longitude: this.state.coordinate.lng};
	star.recordType = "Star";	
	star.fields.title = this.state.title;
	star.fields.note = this.state.note;

	if (this.state.type < 0) {
	    this.state.type = 0;
	}
	star.fields.type = this.state.type;
	star.fields.url = this.state.url;
	
	console.log(this.ck.saveRecord(star));

	this.setState({editMode: false});
    }

    componentWillReceiveProps(props) {
	this.ck = props.ck;
	this.setState(this.convertProps2State(props));
    }

    titleChange(e) {
	this.setState({
	    title: e.target.value
	});
    }
    urlChange(e) {
	this.setState({
	    url: e.target.value
	});
    }
    noteChange(e) {
	console.log(e);
	this.setState({
	    note: e.target.value
	});
    }
    
    render() {
	return (
		<div className='sidebar-right'>
		<div className='star-type'>
		<a onClick={this.setRedStar}><img src={RedStarImg} className='starSet' /></a>
		<a onClick={this.setGreenStar}><img src={GreenStarImg} className='starSet' /></a>
	    </div>
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
		<td className='td'>ADD</td><td>{this.state.address} </td>
		</tr>
		<tr>
		<td className='td'>COORDS</td><td>{this.state.coordinate.lat.toFixed(6)}, {this.state.coordinate.lng.toFixed(6)}</td>
		</tr>

	    {
		    (this.state.editMode === true || this.state.editMode === false && this.state.url != '') &&
			(<tr>
			 <td className='td'>URL</td>
			 <td>{ !this.state.editMode ? (<a href={this.state.url}>{this.state.url}</a>) : (<input type='text' placeholder='URL' defaultValue={this.state.url} onChange={this.urlChange}/>) }
			 </td>			 
			 </tr>)
		}
	    </tbody>
	    </table>
		<LiveMarkedArea editMode={this.state.editMode} label="Notes" defaultValue={this.state.note}  value={this.state.note} onChange={this.noteChange}/>

	    </div>
	);
    }

}

export default StarSidebar;
