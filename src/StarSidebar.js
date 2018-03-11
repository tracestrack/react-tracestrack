import React, { Component } from 'react';
import {Coord, MarkerType} from './Models.js';
import {LiveMarkedArea} from './LiveMarkedArea.js';
import GreenStarImg from './img/star_green.png';
import RedStarImg from './img/star_red.png';
import "./Sidebar.css";

const lang = window.lang;
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
		editMode: false
	    };

	    if (!ret.address) {

	    }

	    switch (props.star.type) {
	    case MarkerType.googlePlace:
		this.loadGooglePlace(data.data);
		break;
	    case MarkerType.new:
		ret.editMode = true;

		break;
	    case MarkerType.searchHit:
		ret = Object.assign({}, ret, this.getStateByGooglePlace(data.data));

		break;
	    default:
		this.loadStar(data);
		this.loadAddress(data.coord);
	    }
	    return ret;
	}
	return {};
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

	this.ck.loadRecord(star.recordName, null, function(re) {	    

	    console.log(re);
	    
    	    var state = {
		title: re.fields.title.value ? re.fields.title.value : 'non',
		note: re.fields.note ? re.fields.note.value : "",
		url: re.fields.url ? re.fields.url.value : ''
	    };
	    _this.setState(state);
	});

    }
    
    setGreenStar() {
	if (!window.checkLogin())
	    return;
	    
	this.state.type = MarkerType.green;
	this.save();

    }

    setRedStar() {
	if (!window.checkLogin())
	    return;

	this.state.type = MarkerType.red;
	this.save();
    }
    
    loadAddress(latlng) {

	var geocoder = new window.google.maps.Geocoder;
	let _this = this;
	geocoder.geocode({'location': latlng}, function(results, status) {

	    console.log(results);

	    if (status === 'OK') {
		if (results[0]) {

		    _this.setState({
			address: results[0].formatted_address
		    });
		    

		} else {
		    window.alert('No results found');
		}
	    } else {
		//window.alert('Geocoder failed due to: ' + status);
	    }
	});

    }

    getStateByGooglePlace = this.getStateByGooglePlace.bind(this);
    getStateByGooglePlace(place) {
	let state = {
	    title: place.name,
	    address: place.formatted_address,
	    url: place.website,
	    note: createNoteFromGooglePlace(place)
	};

	return state;
	
	function createNoteFromGooglePlace(place) {

	    var photos = place.photos;
	    var md = '';
	    let $ = window.$;
	    var count = 3;
	    console.log(place);
	    for (var it in photos) {
		var photo = photos[it];
		var el = $(photo.html_attributions[0]);

		md += `![Photo credit: [`+el.text()+`]](`+photo.getUrl({maxWidth:300})+`)`;
		if (count -- == 0)
		    break;
		
	    }
	    return `[View on Google Maps](`+place.url+`)` + md;
	    
	}

    }

    loadGooglePlace(id) {
	var request = {
	    placeId: id
	};

	let _this = this;
	let MAP = '__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED';
	var service = new window.google.maps.places.PlacesService(window.map.context[MAP]);
	service.getDetails(request, function (place, status) {
	    if (status == window.google.maps.places.PlacesServiceStatus.OK) {
		_this.setState(_this.getStateByGooglePlace(place));
	    }
	});
			   
    }
    
    enterEditMode() {
	if (!window.checkLogin())
	    return;

	this.setState({editMode: true});
    }

    cancel() {
	this.setState({editMode: false});
    }
    
    remove() {
	var rn = this.props.star.recordName;
	let _this = this;
	this.ck.removeRecord(rn, function(e){
	    _this.props.onStarRemoved(e)
	});
    }
    
    save() {

	var star = {};
	let _this = this;

	this.setState({isSaving: true});

	star.fields = {};

	star.recordName = this.props.star.recordName ? this.props.star.recordName :  '';

	star.fields.location = {latitude: this.state.coordinate.lat, longitude: this.state.coordinate.lng};
	star.recordType = "Star";

	star.fields.title = this.newTitle ? this.newTitle : this.state.title;
	star.fields.note = this.newNote ? this.newNote : this.state.note;
	star.fields.type = this.state.type >= 0 ? this.state.type : 0;
	star.fields.url = this.newURL ? this.newURL : this.state.url;
	
	this.ck.saveRecord(star, function(record) {

	    _this.setState({isSaving: false});

	    console.log(record);
	    _this.setState({
		title: star.fields.title,
		url: star.fields.url,
		note: star.fields.note,
		editMode: false
	    });
	    
	    if (typeof _this.props.onStarRecordCreated === 'function') {
		_this.props.onStarRecordCreated(record);
	    }

	});
    }

    componentWillReceiveProps(props) {
	this.ck = props.ck;
	this.setState(this.convertProps2State(props));
    }

    titleChange(e) {
	this.newTitle = e.target.value ? e.target.value : "Untitled";
    }
    urlChange(e) {
	this.newURL = e.target.value;
    }
    noteChange(e) {
	this.newNote = e.target.value;
    }
    
    render() {
	return (
		<div className='sidebar-right'>
		<div className='star-type'>
		<a onClick={this.setRedStar} className={this.state.type==0?"selected":""}><img src={RedStarImg} className='starSet' />Not</a>
		<a onClick={this.setGreenStar} className={this.state.type==1?"selected":""}><img src={GreenStarImg} className='starSet' />Been here</a>
	    </div>
	      <div className='controls'>
		{ !this.state.editMode ?
		  (<button className="btn btn-sm btn-primary" onClick={this.enterEditMode}>{lang.edit}</button>):
		  (
		      <div>
			  <button disabled={this.state.isSaving} className="btn btn-sm btn-danger" onClick={this.remove}>Delete</button>
			<button disabled={this.state.isSaving}  className="btn btn-sm btn-secondary" onClick={this.cancel}>Cancel</button> 
			<button disabled={this.state.isSaving}  className="btn btn-sm btn-primary" onClick={this.save}>Save</button>
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
