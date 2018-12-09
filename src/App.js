import React, { Component } from 'react';
import Menu from './menu.js';
import {SiteHeader, SiteFooter} from './Account.js';
import CKComponent from './Cloud.js';
import StarSidebar from './StarSidebar.js';
import TraceSidebar from './TraceSidebar.js';
import FilterBox from './FilterBox.js';
import SettingManager from './SettingManager.js';
import {Map, OverlayManager, LoadedAreaManager} from './Map.js';
import {Star, Trace, MarkerType, Coord} from './Models.js';

var google = window.google;
var lStorage = window.localStorage;
const lang = window.lang;

window.checkLogin = function() {
    if (!window.userIdentity) {
	alert("no");
	return false;
    }
    return true;
};

var settingManager;

class App extends Component {

    constructor() {
	super();

	var lang = "en";
	if (window.localStorage.getItem('lang') == 'zh-cn') {
	    lang = 'zh-cn';
	}
	this.mapURL = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAiFrzH5XL9pCzQ7AYcBafwUNF8usBm2eU&libraries=places&language=" + lang;

	this.lastResetTime = Date.now(); 

    }

    state = {
	zoom: 10,
	markers: [],
	traces: [],
	showContextMenu: false,
	showStarSidebar: false,
	showFilterBox: false,
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
    handleLoginSuccess = this.handleLoginSuccess.bind(this);

    
    onFilterApply = this.onFilterApply.bind(this);
    onSetStartMap = this.onSetStartMap.bind(this);

    onSetStartMap() {
	var _this = this;
	var center = window.map.getCenter();

	settingManager.lastMapLocation = {latitude: center.lat(), longitude: center.lng()};
	settingManager.lastMapZoom = window.map.getZoom();
	console.log(settingManager.lastMapLocation);

	this._ck.saveRecord(settingManager.packRecord(), function (re) {
	    _this.handleMapBoundsChanged();
	    alert("Default region set.");
	});
    }

    onFilterApply(b) {

	this.loadedAreaManager.clear();
	this.overlayManager.clear();
	this.setState({traces: [], isLoadingTraces: false, showFilterBox: false});
	this.types = b;
	var _this = this;

	settingManager.types = b;
	
	this._ck.saveRecord(settingManager.packRecord(), function (re) {
	    _this.handleMapBoundsChanged();
	    //console.log(re);		
	});

	if (b.indexOf(7) || b.indexOf(8)) {
	    this._ck.loadStars();
	}

    }

    /** OnLoad */
    componentDidMount() {
	this.setState({
	    isLoadingTraces: false
	});

	window.$("#apple-sign-out-button").hide();

	this.overlayManager = new OverlayManager();
	this.loadedAreaManager = new LoadedAreaManager();
	this.types = [0];
	
    }

    /** Map Moved */
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

	let nMaxLat = bounds.getNorthEast().lat() + latDiff * 0.01;
	let nMaxLng = bounds.getNorthEast().lng() + lngDiff * 0.01;
	let nMinLat = bounds.getSouthWest().lat() - latDiff * 0.01;
	let nMinLng = bounds.getSouthWest().lng() - lngDiff * 0.01;

	if (Date.now() - this.lastResetTime > 60*1000 && this.overlayManager.getCount() > 300) {
	    // reset

	    this.loadedAreaManager.clear();
	    this.overlayManager.clear();
	    this.setState({traces: []});

	    this.lastResetTime = Date.now();

	}	

	let z = window.map.getZoom();
	var loadDetail = z > 12;

	if (!this.loadedAreaManager.isLoaded(maxLat, maxLng, minLat, minLng, loadDetail)) {

	    this._ck.loadTraces(nMaxLat, nMaxLng, nMinLat, nMinLng, loadDetail, this.types, function() {
		_this.setState({isLoadingTraces: false});
		_this.loadedAreaManager.addLoaded(nMaxLat, nMaxLng, nMinLat, nMinLng, loadDetail);
	    });
	}
	else {
	    console.log('loaded');
	    _this.setState({isLoadingTraces: false});
	}
    }

    /** Login ok */
    handleLoginSuccess() {
	if (window.userIdentity) {
	    //this._ck.loadStars();

	    //this._ck.demoDiscoverUserIdentityWithUserRecordName('_7022d50b9d797f3775d0930d397ceaf4');
	    //this._ck.demoDiscoverAllUserIdentities();

	    var _this = this;
	    this._ck.loadSettings(function(re) {
		if (re.length == 0) {
		    _this._ck.insertSetting(function(re) {
			console.log(re);
		    });
		    
		    var pos = Coord(51.443416, 5.479131);
		    window.map.panTo(pos);
		    
		    _this.handleMapBoundsChanged();
		    _this._ck.loadStars();
		    
		}
		else {
		    settingManager = new SettingManager(re[0]);

		    var loc = settingManager.getLastMapLocation();
		    var pos = Coord(loc.latitude, loc.longitude);

		    window.map.panTo(pos);
		    _this.setState({zoom: settingManager.getLastMapZoom()});

		    _this.types = settingManager.getTypes();
		    _this.handleMapBoundsChanged();

		    if (_this.types.indexOf(7) || _this.types.indexOf(8)) {
			_this._ck.loadStars();
		    }

		}


	    });

	}
    }

    /** Star record is removed */
    handleStarRecordRemoved(re) {
	var markers = this.state.markers.filter(e => e != this.state.selectedStar);
	this.setState({
	    markers: markers,
	    showStarSidebar: false
	});
    }

    handleTraceDeleted = this.handleTraceDeleted.bind(this);
    handleTraceDeleted(rn) {
	this.overlayManager.remove(rn);
	
	var traces = this.state.traces.filter(e => e.recordName != rn);

	this.setState({
	    traces: traces,
	    showTraceSidebar: false,
	    dbTraceCount: this.overlayManager.getCount()
	});

    }

    /** Traces are loaded */
    handleTracesLoad(re) {

	var _this = this;
	this.setState(function(prevState, props) {

	    var ret = prevState.traces;
	    
	    for (var it in re) {

		let isDetail = re[it].fields.detail != undefined;
		if (_this.overlayManager.shouldRedraw(re[it].recordName, isDetail)) {
		    let pts = re[it].fields.detail == undefined ? re[it].fields.medium.value : re[it].fields.detail.value;

		    let trace = Trace(pts, re[it].fields.type.value, re[it].recordName, re[it].zoneRecordName, re[it].share, re[it].fields.linkingId.value);

		    for (var it2 in ret) {
			if (ret[it2].recordName == re[it].recordName) {
			    ret.splice(it2, 1);
			    break;
			}
		    }
		    ret.push(trace);
		    _this.overlayManager.add(re[it].recordName, isDetail);
		}
	    }

	    return {
		traces: ret,
		dbTraceCount: _this.overlayManager.getCount()
		
	    };
	});
    }

    /** Stars are loaded */
    handleStarsLoad(re) {

	var markers = this.state.markers;
	var showS0 = (this.types.indexOf(7) > -1 ? true : false);
	var showS1 = (this.types.indexOf(8) > -1 ? true : false);
	
	for (var it in re) {
	    var shouldCont = false;
	    for (var m in markers) {
		if (markers[m].recordName == re[it].recordName) {
		    shouldCont = true;
		    break;
		}
	    }
	    if (shouldCont) continue;

	    var fields = re[it].fields;

	    if (showS0 && fields.type.value == 0 ||
		showS1 && fields.type.value == 1) {

		var marker = Star(Coord(fields.location.value.latitude, fields.location.value.longitude), fields.type.value, re[it].recordName);

		markers.push(marker);
	    }
	}

	this.setState({
	    markers: markers,
	    dbStarCount: markers.length
	});

    }

    /** Left click on the map */
    handleMapLeftClick(e) {

	var _this = this;
/*
	if (this.waypoints == null) {
	    this.waypoints = [];

	}

	if (this.waypoints.length > 0) {

	    const DirectionsService = new google.maps.DirectionsService();
	    this.waypoints.push({ location: e.latLng });

	    DirectionsService.route({
		origin: this.waypoints[0].location,
		destination: e.latLng,
		travelMode: google.maps.TravelMode.BICYCLING,
		waypoints: this.waypoints.slice(1, this.waypoints.length - 1)
	    }, (result, status) => {
		if (status === google.maps.DirectionsStatus.OK) {
		    _this.setState({
			directions: result,
		    });

		    console.log(result);
		} else {
		    console.error(`error fetching directions ${result}`);
		}
	    });

	}
	else {
	    this.origin = e.latLng;

	    const wp = { location: e.latLng };
	    this.waypoints.push(wp)
	}
*/

	if (e.placeId) {
	    /** Clicked Google Map POI */
	    var poi = Star({lat: e.latLng.lat(), lng: e.latLng.lng()}, MarkerType.googlePlace, '', e.placeId);

	    this.setState({
		selectedStar: poi,
		showStarSidebar: true,
		showContextMenu: false,
		showTraceSidebar: false
	    });
	    
	}
	else {

	    var state = {};
	    state.showStarSidebar = false;
	    state.showContextMenu = false;
	    state.showTraceSidebar =  false;

	    if (this.state.selectedTrace) {
		/** Unselect traces */
		let traces = this.state.traces;
		for (var it in traces) {
		    if (traces[it].linkingId == -this.state.selectedTrace.linkingId) {
			traces[it].selected = false;
		    }
		}
		state.selectedTrace = null;
	    }

	    
	    if (Object.keys(state).length > 0) {
		this.setState(state);
	    }
	}
	
    }

    /** Right click context menu */
    handleMapRightClick(e) {
	this.setState({
	    showContextMenu: true,
	    rightClickPosition: {left: e.pixel.x, top: e.pixel.y},
	    rightClickEvent: e
	});	
    }

    /** Map is loaded */
    handleMapMounted(map) {


	
	window.map = map;
	google = window.google;

	/** Disable default infoWindow */
	if (google) {
	    google.maps.InfoWindow.prototype.set = function () {
	    };
	}

	var input = document.getElementById('searchTextField');
	input.setAttribute('spellcheck', 'false');
	var _this = this;
	
	var searchBox = new google.maps.places.SearchBox(input);



/*
	// Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {

	      var pos = Coord(position.coords.latitude, position.coords.longitude);
              map.panTo(pos);
	      
          }, function() {
              //handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
            //handleLocationError(false, infoWindow, map.getCenter());
        }
*/	

	  map.getStreetView().addListener("visible_changed", function(e) {
	    let v = map.getStreetView().getVisible();
	    _this.setState({isPanoramaView: v});

	});
	
	searchBox.addListener('places_changed', function() {
	    var places = searchBox.getPlaces();
	    var markers = [];
	    var isLocality = false;
	    
	    if (places.length == 0) {
		return;
	    }
	    else if (places.length == 1 && places[0].types.indexOf('political') > -1) {
		isLocality = true;

	    }
	    else {

		for (var it in _this.state.markers) {

		    if (_this.state.markers[it].type != MarkerType.searchHit) {
			markers.push(_this.state.markers[it]);
		    }
		}

	    }

	    var bounds = new google.maps.LatLngBounds();

	    places.forEach(function(place) {
		if (!place.geometry) {
		    console.log("Returned place contains no geometry");
		}

		var marker = Star(Coord(place.geometry.location.lat(), place.geometry.location.lng()), MarkerType.searchHit, '', place);

		markers.push(marker);
		
		if (place.geometry.viewport) {
		    // Only geocodes have viewport.
		    bounds.union(place.geometry.viewport);
		} else {
		    bounds.extend(place.geometry.location);
		}
		
	    });

	    if (isLocality == false) {
		_this.setState({
		    markers: markers
		});
	    }

	    map.fitBounds(bounds);
	});
    }

    /** When star is added by click on the context menu*/
    handleAddStar() {

	let loc = this.state.rightClickEvent.latLng;
	var markers = this.state.markers;

	var newStar = Star(Coord(loc.lat(), loc.lng()), MarkerType.new);

	markers.push(newStar);

	this.setState({
	    markers: markers,
	    showContextMenu: false,
	    selectedStar: newStar,
	    showStarSidebar: true	    
	});
	
    }

    /** Click on the trace */
    handleTraceClick(trace) {

	let traces = this.state.traces;

	// Use on trace to represent merged traces
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
	
	this.setState({
	    selectedTrace: selectedTrace,
	    showTraceSidebar: true,
	    showStarSidebar: false	    
	});
    }
    
    /** Marker is clicked
     *  Marker could be either stars or pois or search results
     */
    handleMarkerClick(targetMarker) {
	this.setState({
	    selectedStar: targetMarker,
	    showStarSidebar: true,
	    showTraceSidebar: false	    
	});
    }

    /** Star is created */
    handleStarRecordCreated(e) {

	var markers = this.state.markers.filter(it => it.type != MarkerType.new && it.recordName != e.recordName);
	var fields = e.fields;
	var star = Star(Coord(fields.location.value.latitude, fields.location.value.longitude), parseInt(fields.type.value), e.recordName);
	
	markers.push(star);
	
	this.setState({
	    markers: markers,
	    selectedStar: star
	});
	
    }


    showFilterBox = this.showFilterBox.bind(this);
    showFilterBox() {
	this.setState({showFilterBox: true});
    }

    onFilterCancel = this.onFilterCancel.bind(this);
    onFilterCancel() {
	this.setState({showFilterBox: false});
    }
    
    /** Render the app */
    render() {
	
	return (
		<div className='full-height'>

	    	    {
			this.state.showFilterBox && (
				<FilterBox onFilterApply={this.onFilterApply} types={this.types} onCancel={this.onFilterCancel} />
			)
		    }

		<SiteHeader selected="map" />


		<div className="header-bar">


		<div className="shadow">
		<input type="text" id="searchTextField" className='form-control form-control-sm' />
		</div>

		<div className="toolbox">
		<button className="btn btn-info btn-sm" onClick={this.showFilterBox}>{lang.filter}</button>

		<button className="btn btn-info btn-sm" onClick={this.onSetStartMap}>{lang.setDefaultMap}</button>
		</div>

	    </div>

		<Menu active={this.state.showContextMenu} position={this.state.rightClickPosition} onAddStar={this.handleAddStar} />
		
		<CKComponent ref={(ck) => {this._ck = ck;}} onLoginSuccess={this.handleLoginSuccess} onStarsLoad={this.handleStarsLoad} onTracesLoad={this.handleTracesLoad}/>

	    {
		    !this.state.isPanoramaView && this.state.showStarSidebar && (
			<StarSidebar star={this.state.selectedStar} ck={this._ck} onStarRecordCreated={this.handleStarRecordCreated} onStarRemoved={this.handleStarRecordRemoved}/>
		)
	    }	      
	    {
		!this.state.isPanoramaView && this.state.showTraceSidebar && (
		    <TraceSidebar trace={this.state.selectedTrace} ck={this._ck} onTraceDeleted={this.handleTraceDeleted}/>
		)
	    }	      

	    { !this.state.isPanoramaView && (<div className='xxxx'>T: {this.state.dbTraceCount}, S: {this.state.dbStarCount}</div>) }

		<Map

	    loadingElement = {<div style={{ height: `100%` }} />}
	    containerElement = {<div className='mapContainer' />}
	    mapElement = {<div style={{ height: `100%` }} />}
	    googleMapURL={this.mapURL}
	    zoom={this.state.zoom}
	    markers={this.state.markers}
	    traces={this.state.traces}
	    onMarkerClick={this.handleMarkerClick}
	    onTraceClick={this.handleTraceClick}
	    onMapMounted={this.handleMapMounted}
	    onMapLeftClick={this.handleMapLeftClick}
	    onMapRightClick={this.handleMapRightClick}
	    onDragEnd={this.handleMapBoundsChanged}
	    onZoomChanged={this.handleMapBoundsChanged}
	    directions={this.state.directions}
	    
		/>
		</div>

	);
    }

}

export default App;
