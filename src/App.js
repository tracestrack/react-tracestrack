import React, { Component } from 'react';
import Menu from './menu.js';
import CKComponent from './Cloud.js';
import StarSidebar from './StarSidebar.js';
import TraceSidebar from './TraceSidebar.js';
import {Map} from './Map.js';

const google = window.google;

export class MarkerType {
    static get red() { return 0; }
    static get green() { return 1; }
    
    static get new() { return -1; }
    static get searchHit() { return -2; }
    static get wiki() { return -3; }
    static get googlePlace() { return -4; }
}

/** Star model is used to render detailsidebar */
function createNewStar(coord, type, recordName, address, data) {
    return {
	coord: coord,
	type: type,
	recordName: recordName,
	address: address,
	data: data
    };
}

/** Trace Model */
function createTrace(detail, recordName) {
    return {
	detail: detail,
	recordName: recordName
    };
}

function Coord(lat, lng) {
    return {lat: lat, lng: lng};
}

class App extends Component {

    state = {
	markers: [],
	traces: [],
	showContextMenu: false,
	showStarSidebar: false,
	rightClickPosition: {left: 100, top: 100}
    }

    handleMapMounted = this.handleMapMounted.bind(this);
    handleMarkerClick = this.handleMarkerClick.bind(this);
    handleTraceClick = this.handleTraceClick.bind(this);    
    handleMapRightClick = this.handleMapRightClick.bind(this);
    handleMapLeftClick = this.handleMapLeftClick.bind(this);
    handleStarsLoad = this.handleStarsLoad.bind(this);
    handleTracesLoad = this.handleTracesLoad.bind(this);    
    handleAddStar = this.handleAddStar.bind(this);
    handleStarSaved = this.handleStarSaved.bind(this);
    handleStarRecordCreated = this.handleStarRecordCreated.bind(this);
    handleStarRecordRemoved = this.handleStarRecordRemoved.bind(this);    
    handleLoginSucess = this.handleLoginSucess.bind(this);
    
    componentDidMount() {
	this.setState({

	});		      
    }

    handleLoginSucess() {
	if (window.userIdentity) {
	    this._ck.loadStars();
	    this._ck.loadTraces();
	}
	
    }
    
    handleStarRecordRemoved(re) {
	var markers = this.state.markers.filter(e => e != this.state.selectedStar);
	this.setState({
	    markers: markers,
	    showStarSidebar: false
	});
    }

    handleTracesLoad(re) {
	console.log(re);

	var traces = [];
	for (var it in re) {
	    let trace = createTrace(re[it].fields.medium.value, re[it].recordName);
	    //createTrace(re[it].fields.title., re[it].fields.detail.value, re[it].recordName, f.type.value, f.distance.value, f.averageSpeed.value, f.duration.value, f.startDate.value, f.note.value, f.elevation.value);
	    traces.push(trace);
	}

	this.setState({traces: traces
		      });
    }
    
    handleStarsLoad(re) {

	var markers = this.state.markers;

	for (var it in re) {

	    var fields = re[it].fields;
	    
	    var marker = createNewStar({lat: fields.location.value.latitude, lng: fields.location.value.longitude}, fields.type.value, re[it].recordName);

	    markers.push(marker);
	}

	this.setState({
	    markers: markers
	});

    }
    
    handleMapLeftClick(e) {

	if (e.placeId) {
	    var newStar = createNewStar({lat: e.latLng.lat(), lng: e.latLng.lng()}, MarkerType.googlePlace, '', '', e.placeId);

	    this.setState({
		selectedStar: newStar,
		showStarSidebar: true,
		showContextMenu: false,
		showTraceSidebar: false
	    });
	    
	}
	else {
	    var state = {};
	    if (this.state.showStarSidebar) {
		state.showStarSidebar = false;
	    }
	    if (this.state.showContextMenu) {
		state.showContextMenu = false;
	    }
	    if (this.state.showTraceSidebar) {
		state.showTraceSidebar =  false;
	    }

	    if (Object.keys(state).length > 0) {
		this.setState(state);
	    }
	}
	
    }

    handleMapRightClick(e) {
	this.setState({
	    showContextMenu: true,
	    rightClickPosition: {left: e.pixel.x, top: e.pixel.y},
	    rightClickEvent: e
	});	
    }

    handleMapMounted(map) {

	window.map = map;

	var input = document.getElementById('searchTextField');
	var searchBox = new google.maps.places.SearchBox(input);
	var options = {
	    types: ['(regions)']
	};

	var _this = this;
	
	searchBox.addListener('places_changed', function() {
	    var places = searchBox.getPlaces();

	    if (places.length == 0) {
		return;
	    }

	    var markers = [];
	    for (var it in _this.state.markers) {
		if (_this.state.markers[it].type != MarkerType.searchHit) {
		    markers.push(_this.state.markers[it]);
		}
	    }

	    var bounds = new google.maps.LatLngBounds();
	    places.forEach(function(place) {
		if (!place.geometry) {
		    console.log("Returned place contains no geometry");
		    return;
		}		

		console.log(place);
		
		var marker = createNewStar(Coord(place.geometry.location.lat(), place.geometry.location.lng()), MarkerType.searchHit, '', place.formatted_address, place.name);

		markers.push(marker);
		
		_this.setState({
		    markers: markers
		});

		if (place.geometry.viewport) {
		    // Only geocodes have viewport.
		    bounds.union(place.geometry.viewport);
		} else {
		    bounds.extend(place.geometry.location);
		}
	    });
	    map.fitBounds(bounds);
	});
    }

    
    handleAddStar() {

	let loc = this.state.rightClickEvent.latLng;
	var markers = this.state.markers;

	var newStar = createNewStar(Coord(loc.lat(), loc.lng()), MarkerType.new);

	markers.push(newStar);

	this.setState({
	    markers: markers,
	    showContextMenu: false,
	    selectedStar: newStar,
	    showStarSidebar: true	    
	});
	
    }

    handleTraceClick(trace) {
	console.log(trace);
	this.setState({
	    selectedTrace: trace,
	    showTraceSidebar: true,
	    showStarSidebar: false
	    
	});

    }
    
    handleMarkerClick(targetMarker) {
	this.setState({
	    selectedStar: targetMarker,
	    showStarSidebar: true,
	    showTraceSidebar: false	    
	});
    }

    handleStarSaved() {
	/*	var markers = this.state.markers.filter(x => x.type != MarkerType.new);
		this.setState({markers: markers});*/
    }

    handleStarRecordCreated(e) {
	
	var markers = this.state.markers.filter(it => it.type != MarkerType.new);
	var fields = e.fields;

	let star = createNewStar({lat: fields.location.value.latitude, lng: fields.location.value.longitude}, fields.type.value);
	markers.push(star);
	
	this.setState({
	    markers: markers,
	    selectedStar: star
	});
	
    }
    
    render() {
	return (
	    <div className='full-height'>

	      <Menu active={this.state.showContextMenu} position={this.state.rightClickPosition} onAddStar={this.handleAddStar} />
	      
	      <CKComponent ref={(ck) => {this._ck = ck;}} onLoginSuccess={this.handleLoginSucess} onStarsLoad={this.handleStarsLoad} onTracesLoad={this.handleTracesLoad} onStarRecordCreated={this.handleStarRecordCreated} onStarRemoved={this.handleStarRecordRemoved}/>

		{
		    this.state.showStarSidebar && (
			<StarSidebar star={this.state.selectedStar} ck={this._ck} onStarSaved={this.handleStarSaved} />
		    )
	      }	      
		{
		    this.state.showTraceSidebar && (
			<TraceSidebar trace={this.state.selectedTrace} ck={this._ck} onStarSaved={this.handleStarSaved} />
		    )
	      }	      

		<input type="text" id="searchTextField" className='searchBar' />
		
		<Map
	    markers={this.state.markers}
	    traces={this.state.traces}
	    onMarkerClick={this.handleMarkerClick}
	    onTraceClick={this.handleTraceClick}
	    onMapMounted={this.handleMapMounted}
	    onMapLeftClick={this.handleMapLeftClick}
	    onMapRightClick={this.handleMapRightClick}
	    containerElement={
		    <div style={{ height: `100%` }} className='container' />
	    }
	    mapElement={
		    <div style={{ height: `100%` }} />
	    }
		/>
		</div>

	);
    }

}

export default App;
