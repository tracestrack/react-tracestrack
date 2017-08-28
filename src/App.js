import React, { Component } from 'react';
import Menu from './menu.js';
import CKComponent from './Cloud.js';
import StarSidebar from './StarSidebar.js';
import TraceSidebar from './TraceSidebar.js';
import {Map, OverlayManager, LoadedAreaManager} from './Map.js';

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
function createTrace(detail, type, recordName, zoneRecordName, share) {
    return {
	detail: detail,
	recordName: recordName,
	zoneRecordName: zoneRecordName,
	share: share,
	type: type
    };
}

export function Coord(lat, lng) {
    return {lat: lat, lng: lng};
}

class App extends Component {

    state = {
	markers: [],
	traces: [],
	showContextMenu: false,
	showStarSidebar: false,
	rightClickPosition: {left: 100, top: 100},
	isPanoramaView: false
    }

    handleMapMounted = this.handleMapMounted.bind(this);
    handleMapBoundsChanged = this.handleMapBoundsChanged.bind(this);    
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
	    isLoadingTraces: false
	});

	window.$("#apple-sign-out-button").hide();
	this.overlayManager = new OverlayManager();
	this.loadedAreaManager = new LoadedAreaManager();
	
    }
    
    handleMapBoundsChanged() {

	let _this = this;
	if (this.state.isLoadingTraces) {
	    console.log('loading, skip');
	    return;
	}

	this.setState({isLoadingTraces: true});

	let bounds = window.map.getBounds();
	let latDiff = bounds.getNorthEast().lat() - bounds.getSouthWest().lat();
	let lngDiff = bounds.getNorthEast().lng() - bounds.getSouthWest().lng();
	
	let maxLat = bounds.getNorthEast().lat();
	let maxLng = bounds.getNorthEast().lng();
	let minLat = bounds.getSouthWest().lat();
	let minLng = bounds.getSouthWest().lng();

	let nMaxLat = bounds.getNorthEast().lat() + latDiff;
	let nMaxLng = bounds.getNorthEast().lng() + lngDiff;
	let nMinLat = bounds.getSouthWest().lat() - latDiff;
	let nMinLng = bounds.getSouthWest().lng() - lngDiff;

	
	let z = window.map.getZoom();
	console.log(z);
	var loadDetail = z > 12;

	if (!this.loadedAreaManager.isLoaded(maxLat, maxLng, minLat, minLng, loadDetail)) {
	    this._ck.loadTraces(nMaxLat, nMaxLng, nMinLat, nMinLng, loadDetail, function() {
		console.log('finish');
		_this.setState({isLoadingTraces: false});
	    });
	    this.loadedAreaManager.addLoaded(nMaxLat, nMaxLng, nMinLat, nMinLng, loadDetail);
	}
	else {
	    console.log('loaded');
	    _this.setState({isLoadingTraces: false});
	}
    }

    handleLoginSucess() {
	if (window.userIdentity) {
	    this._ck.loadStars();
	    this.handleMapBoundsChanged();

	    this._ck.fetchDBChanges();
	    //this._ck.demoDiscoverUserIdentityWithUserRecordName('_7022d50b9d797f3775d0930d397ceaf4');
//	    this._ck.demoDiscoverAllUserIdentities();
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

	var traces = this.state.traces;

	let z = window.map.getZoom();
	var lod = 1;
	if (z > 11) {
	    lod = 2;
	}
	else {
	    lod = 1;
	}

	for (var it in re) {

	    if (this.overlayManager.shouldRedraw(re[it].recordName, lod)) {
		let pts = re[it].fields.detail == undefined ? re[it].fields.coarse.value : re[it].fields.detail.value;

		let trace = createTrace(pts, re[it].fields.type.value, re[it].recordName, re[it].zoneRecordName, re[it].share);

		for (var it2 in traces) {
		    if (traces[it2].recordName == re[it].recordName) {
			traces.splice(it2, 1);
			break;
		    }
		}
		traces.push(trace);
		this.overlayManager.add(re[it].recordName, lod);
	    }
	}

	this.setState({
	    traces: traces
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
	    if (this.state.selectedTrace)
		this.state.selectedTrace.selected = false;
	    
	    state.selectedTrace = null;

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

	map.getStreetView().addListener("visible_changed", function(e) {
	    let v = map.getStreetView().getVisible();
	    _this.setState({isPanoramaView: v});

	    if (v) {
		window.$("#apple-sign-in-button").addClass('hidden');
		window.$("#apple-sign-out-button").addClass('hidden');
	    }
	    else {
		window.$("#apple-sign-in-button").removeClass('hidden');
		window.$("#apple-sign-out-button").removeClass('hidden');
	    }

	});
	
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

	let traces = this.state.traces;
	
	for (var it in traces) {
	    if (this.state.selectedTrace && traces[it].recordName == this.state.selectedTrace.recordName) {
		traces[it].selected = false;
	    }
	    if (traces[it].recordName == trace.recordName) {
		traces[it].selected = true;
	    }
	}
		
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

		<div className={this.state.isPanoramaView ? 'hidden' : 'shadow' }>
		<input type="text" id="searchTextField" className='searchBar' />
		</div>
		
		<Map
	    markers={this.state.markers}
	    traces={this.state.traces}
	    onMarkerClick={this.handleMarkerClick}
	    onTraceClick={this.handleTraceClick}
	    onMapMounted={this.handleMapMounted}
	    onMapLeftClick={this.handleMapLeftClick}
	    onMapRightClick={this.handleMapRightClick}
	    onDragEnd={this.handleMapBoundsChanged}
	    onZoomChanged={this.handleMapBoundsChanged}
	    
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
