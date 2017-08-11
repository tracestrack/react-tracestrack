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
	return this.props.star.isNewStar;
    }

    convertProps2State(props) {
	if (props.star != null) {
	    var data;
	    if (this.isNewStar()) {
	    	// new star
		data = props.star;
		
		return {
		    title: data.title,
		    note: data.note,
		    type: data.type,
		    url: data.url,
		    coordinate: {lat: data.coords.lat, lng: data.coords.lng},
		    editMode: true
		};

	    }
	    else {

		if (props.star.type == MarkerType.googlePlace) {

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
		else {
		    data = props.star.data.fields;
		    console.log(data);
		    return {
			title: data.title.value,
			note: data.note.value,
			type: data.type.value,
			url: (data.url.value === "http://" ? "": data.url.value),
			coordinate: {lat: props.star.position.lat(), lng: props.star.position.lng()}
		    };
		}
	    }
	}
	return null;
    }

    enterEditMode = this.enterEditMode.bind(this);
    remove = this.remove.bind(this);    
    cancel = this.cancel.bind(this);
    save = this.save.bind(this);

    loadGooglePlace = this.loadGooglePlace.bind(this);
    
    titleChange = this.titleChange.bind(this);
    urlChange = this.urlChange.bind(this);
    noteChange = this.noteChange.bind(this);    

    loadGooglePlace(id) {
	var request = {
	    placeId: id
	};

	let _this = this;
	let MAP = '__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED';
	var service = new google.maps.places.PlacesService(window.map.context[MAP]);
	service.getDetails(request, callback);

	function createNoteFromGooglePlace(place) {

	    var photo = place.photos[0];

	    let $ = window.$;

	    var el = $(photo.html_attributions[0]);
	    window.el = el;
	    return `![](`+photo.getUrl({maxWidth:300})+`)

Photo credit: [`+el.text()+`](`+el.prop('href')+`)

[View on Google Maps](`+place.url+`)
`;
    
	}

	function callback(place, status) {
	    if (status == google.maps.places.PlacesServiceStatus.OK) {

		let state = {
		    title: place.name,
		    address: {__html: place.adr_address},
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
	console.log(this.ck.removeRecord(star));
    }
    
    save() {

	var star;
	if (this.isNewStar()) {
	    star = {};
	    star.fields = {};
	    star.recordType = "Star";
	    star.fields.location = {latitude: this.state.coordinate.lat, longitude: this.state.coordinate.lng};
	}
	else {
	    star = {};
	    star.fields = {};
	    star.recordName = this.props.star.data.recordName;
	    star.recordType = this.props.star.data.recordType;
	}	
	
	star.fields.title = this.state.title;
	star.fields.note = this.state.note;
	star.fields.type = this.state.type;
	star.fields.url = this.state.url;

	console.log(star);
	
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
		<ul>
		<li className='address'><span className='label'>ADD</span><span dangerouslySetInnerHTML={this.state.address} /></li>

		<li className='coords'><span className='label'>COORDS</span><span>{this.state.coordinate.lat.toFixed(6)}, {this.state.coordinate.lng.toFixed(6)}</span></li>

	    {
		    (this.state.editMode === true || this.state.editMode === false && this.state.url != '') &&
			(<li className='url'>
			 <span className='label'>URL</span><span>{ !this.state.editMode ? this.state.url :		  (<input type='text' placeholder='URL' defaultValue={this.state.url} onChange={this.urlChange}/>) }
			 </span>
			 
			 </li>)
		}
	    
	    </ul>		    
		<LiveMarkedArea editMode={this.state.editMode} label="Notes" defaultValue={this.state.note}  value={this.state.note} onChange={this.noteChange}/>

	    </div>
	);
    }

}

export default DetailSidebar;
