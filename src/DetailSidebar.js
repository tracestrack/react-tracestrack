import React, { Component } from 'react';
import {MarkerType} from './App.js';
import {
    MarkedInput,
    MarkedPreview } from 'react-markdown-area';

import "./DetailSidebar.css";


const google = window.google;

export class LiveMarkedArea extends React.Component {
    constructor(props) {
	super(props);
	this.state = {
	    value: props.defaultValue ? props.defaultValue : ''
	};
    }
    static defaultProps = {
	id: 'mmc-marked-area',
	label: '',
	editMode: false,
	classNames: {
	    root: 'marked-area',
	    header: 'marked-area-header',
	    activeButton: 'marked-area-button active',
	    defaultButton: 'marked-area-button',
	    helpLink: 'marked-area-help-link',
	    textContainer: 'marked-area-text-container',
	    liveDivider: 'marked-area-live-divider'
	}
    };

    componentWillReceiveProps(props) {
	this.setState({value: props.value});
    }

    handleTextChange = (e) => {
	this.setState({value: e.target.value});

	if (typeof this.props.onChange === 'function') {
	    this.props.onChange(e);
	}
    };    
    
    render() {
	let {id, label, classNames, placeholder} = this.props;
	let {value} = this.state;
	return (
	    <section className={classNames.root}>

	      <header className={classNames.header}>
		<label htmlFor={id}>{label}</label>
	      </header>

	      {
		  this.props.editMode &&
		      
		  (<MarkedInput
				placeholder={placeholder}
				classNames={classNames}
				onChange={this.handleTextChange}
				value={value} />)
	      }

              <MarkedPreview classNames={classNames}
			     value={value} />

	    </section>
	);
    }
}


class DetailSidebar extends Component {

    constructor(props) {
	super(props);

	var state = this.convertProps2State(props);
	this.state = state;
	this.ck = props.ck;
	
    }

    isNewStar() {
	return this.props.star.isNewStar === true;
    }

    convertProps2State(props) {
	if (props.star != null) {
	    var data;
	    
	    if (props.star.type == MarkerType.googlePlace) {
		// google place
		data = props.star;
		this.loadGooglePlace(data.title);
		return {
		    title: "",
		    note: '',
		    type: data.type,
		    url: '',
		    coordinate: {lat: data.coords.lat, lng: data.coords.lng},
		    editMode: false
		};		    
	    }
	    else if (props.star.type == MarkerType.new) {		    
	    	// new star
		data = props.star;
		console.log('error');
		var latlng = {lat: data.lat, lng: data.lng};
		
		this.loadAddress(latlng);
		
		return {
		    title: data.title,
		    note: data.note,
		    type: data.type,
		    url: data.url,
		    coordinate: latlng,
		    editMode: true
		};
	    }
	    else {

		// from cloudkit
		data = props.star.data.fields;
		console.log(data);
		var latlng = {lat: props.star.position.lat(), lng: props.star.position.lng()};
		this.loadAddress(latlng);
		
		return {
		    title: data.title.value,
		    note: data.note.value,
		    type: data.type.value,
		    url: (data.url != null ? (data.url.value === "http://" ? "": data.url.value) : ""),
		    coordinate: {lat: props.star.position.lat(), lng: props.star.position.lng()},
		    editMode: false
		};

	    }
	}

	return null;
    }

    

    enterEditMode = this.enterEditMode.bind(this);
    remove = this.remove.bind(this);    
    cancel = this.cancel.bind(this);
    save = this.save.bind(this);

    loadGooglePlace = this.loadGooglePlace.bind(this);
    loadAddress = this.loadAddress.bind(this);
    
    titleChange = this.titleChange.bind(this);
    urlChange = this.urlChange.bind(this);
    noteChange = this.noteChange.bind(this);

    loadAddress(latlng) {

	var geocoder = new google.maps.Geocoder;
	let _this = this;
	geocoder.geocode({'location': latlng}, function(results, status) {
	    if (status === 'OK') {
		if (results[0]) {
		    console.log(results[0]);
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
		
		console.log(place);
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
	var star = this.props.star.data;
	this.ck.removeRecord(star);
    }
    
    save() {

	var star = {};
	star.fields = {};
	if (this.isNewStar() == false) {
	    star.recordName = this.props.star.data.recordName;
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

export default DetailSidebar;
