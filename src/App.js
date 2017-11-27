import React, { Component } from 'react';
import Menu from './menu.js';
import CKComponent from './Cloud.js';
import StarSidebar from './StarSidebar.js';
import TraceSidebar from './TraceSidebar.js';
import {Map, OverlayManager, LoadedAreaManager} from './Map.js';

const google = window.google;

var fnSet = google.maps.InfoWindow.prototype.set;
google.maps.InfoWindow.prototype.set = function () {
};

window.checkLogin = function() {

    if (!window.userIdentity) {
	alert("no");
	return false
    }
    return true;

}

export class MarkerType {
    static get red() { return 0; }
    static get green() { return 1; }
    static get newStar() { return -1; }
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
function createTrace(detail, type, recordName, zoneRecordName, share, linkingId) {
    return {
	detail: detail,
	recordName: recordName,
	zoneRecordName: zoneRecordName,
	share: share,
	type: type,
	linkingId: linkingId
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
	var loadDetail = z > 12;

	if (!this.loadedAreaManager.isLoaded(maxLat, maxLng, minLat, minLng, loadDetail)) {
	    console.log(loadDetail);
	    console.log('detal');
	    this._ck.loadTraces(nMaxLat, nMaxLng, nMinLat, nMinLng, loadDetail, function() {
		_this.setState({isLoadingTraces: false});
		_this.loadedAreaManager.addLoaded(nMaxLat, nMaxLng, nMinLat, nMinLng, loadDetail);
	    });
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
	    this._ck.demoDiscoverAllUserIdentities();
	}	
    }
    
    handleStarRecordRemoved(re) {
	var markers = this.state.markers.filter(e => e != this.state.selectedStar);
	this.setState({
	    markers: markers,
	    showStarSidebar: false
	});
    }

    handleTraceRemoved = this.handleTraceRemoved.bind(this);
    handleTraceRemoved(re) {
	console.log(re);
    }
    
    handleTracesLoad(re) {

	var traces = this.state.traces;

	for (var it in re) {

	    let isDetail = re[it].fields.detail != undefined;
	    if (this.overlayManager.shouldRedraw(re[it].recordName, isDetail)) {
		let pts = re[it].fields.detail == undefined ? re[it].fields.medium.value : re[it].fields.detail.value;

		let trace = createTrace(pts, re[it].fields.type.value, re[it].recordName, re[it].zoneRecordName, re[it].share, re[it].fields.linkingId.value);

		for (var it2 in traces) {
		    if (traces[it2].recordName == re[it].recordName) {
			traces.splice(it2, 1);
			break;
		    }
		}
		traces.push(trace);
		this.overlayManager.add(re[it].recordName, isDetail);
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

	    console.log(this.state.selectedTrace);
	    if (this.state.selectedTrace) {

		let traces = this.state.traces;
		for (var it in traces) {
		    if (traces[it].linkingId == -this.state.selectedTrace.linkingId) {
			traces[it].selected = false;
		    }
		}
	    }

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
	var selectedTrace = null;
	for (var it in traces) {
	    if (this.state.selectedTrace && traces[it].recordName == this.state.selectedTrace.recordName) {
		traces[it].selected = false;
	    }
	    if (traces[it].recordName == trace.recordName || trace.linkingId != 0 && (traces[it].linkingId == trace.linkingId || traces[it].linkingId == -trace.linkingId)) {
		traces[it].selected = true;
		if (traces[it].linkingId >= 0) {
		    selectedTrace = traces[it];
		}
	    }
	}
	console.log(selectedTrace);
		
	this.setState({
	    selectedTrace: selectedTrace,
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

    handleStarRecordCreated(e) {

	var markers = this.state.markers.filter(it => it.type != MarkerType.new && it.recordName != e.recordName);
	var fields = e.fields;
	var star = createNewStar(Coord(fields.location.value.latitude, fields.location.value.longitude), parseInt(fields.type.value), e.recordName);
	
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
	      
	      <CKComponent ref={(ck) => {this._ck = ck;}} onLoginSuccess={this.handleLoginSucess} onStarsLoad={this.handleStarsLoad} onTracesLoad={this.handleTracesLoad}/>

		{
		    this.state.showStarSidebar && (
			<StarSidebar star={this.state.selectedStar} ck={this._ck} onStarRecordCreated={this.handleStarRecordCreated} onStarRemoved={this.handleStarRecordRemoved}/>
		    )
	      }	      
		{
		    this.state.showTraceSidebar && (
			    <TraceSidebar trace={this.state.selectedTrace} ck={this._ck} onRemoved={this.handleTraceRemoved}/>
		    )
	      }	      

		<div className={this.state.isPanoramaView ? 'hidden' : 'shadow' }>
		<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="searchTextField" className='searchBar' />
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
