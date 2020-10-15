import React, { Component } from 'react';
import ContextMenu from './ContextMenu.js';
import { SiteHeader } from '../common/Page.js';
import CloudDatastore from '../../datastore/CloudDatastore.js';
//import CloudDatastore from '../../datastore/Mock.js';
import StarSidebar from './StarSidebar.js';
import TraceSidebar from './TraceSidebar.js';
import FilterBox from './FilterBox.js';
import UploadBox from './UploadBox.js';
import SettingManager from '../common/SettingManager.js';
import { Map, OverlayManager, LoadedAreaManager } from './Map.js';
import { Star, Trace, MarkerType, Coord } from '../common/Models.js';
import SessionManager from '../common/SessionManager.js';
//import AppleStyle from '../../resources/mapstyles/apple.json';
//import GrayStyle from '../../resources/mapstyles/grayscale.json';


var google = window.google;

var settingManager;

class MapPage extends Component {

  selectedTrace = null
  selectedStar = null
  
  constructor() {
    super();

    var lang = "en";
    this.mapURL = "https://maps.googleapis.com/maps/api/js?key=" +
      process.env.REACT_APP_GoogleMap_key + "&libraries=places&language=" + lang;

    this.lastResetTime = Date.now();

    this.overlayManager = new OverlayManager();
    this.loadedAreaManager = new LoadedAreaManager();
    this.types = [0];
    this.is_dragging = false;

    const queryString = require('query-string');
    const parsed = queryString.parse(window.location.hash);
    if (parsed["trace"] !== undefined) {
      this.selectedTrace = parsed["trace"];
    }
  }

  state = {
    zoom: 10,
    markers: [],
    traces: [],
    showContextMenu: false,
    showStarSidebar: false,
    showFilterBox: false,
    showUploadBox: false,
    rightClickPosition: { left: 100, top: 100 },
    isPanoramaView: false,
    isLoadingTraces: false
  }

  handleMapMounted = this.handleMapMounted.bind(this);
  handleMapBoundsChanged = this.handleMapBoundsChanged.bind(this);
  handleMarkerClick = this.handleMarkerClick.bind(this);
  handleTraceClick = this.handleTraceClick.bind(this);
  handleMapRightClick = this.handleMapRightClick.bind(this);
  handleMapLeftClick = this.handleMapLeftClick.bind(this);
  handleDragStart = this.handleDragStart.bind(this);
  handleDragEnd = this.handleDragEnd.bind(this);
  handleStarsLoad = this.handleStarsLoad.bind(this);
  handleTracesLoad = this.handleTracesLoad.bind(this);
  handleAddStar = this.handleAddStar.bind(this);
  handleStarRecordCreated = this.handleStarRecordCreated.bind(this);
  handleStarRecordRemoved = this.handleStarRecordRemoved.bind(this);
  gotoCurrentLocation = this.gotoCurrentLocation.bind(this);

  onFilterApply = this.onFilterApply.bind(this);
  onSetStartMap = this.onSetStartMap.bind(this);

  onSetStartMap() {
    var center = window.map.getCenter();

    settingManager.lastMapLocation = { latitude: center.lat(), longitude: center.lng() };
    settingManager.lastMapZoom = window.map.getZoom();
    console.log(settingManager.lastMapLocation);

    CloudDatastore.saveRecord(settingManager.packRecord(), function(re) {
      alert("Default region set.");
    });

  }

  reset() {
    this.loadedAreaManager.clear();
    this.overlayManager.clear();
    this.setState({ traces: [], isLoadingTraces: false, showFilterBox: false });
  }

  gotoCurrentLocation() {
    function showPosition(position) {
      let pos = Coord(position.coords.latitude, position.coords.longitude);
      window.map.panTo(pos);
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("Browser doesn't support");
    }
  }

  onFilterApply(b) {

    this.reset();
    
    this.types = b;
    var _this = this;

    settingManager.types = b;

    CloudDatastore.saveRecord(settingManager.packRecord(), function(re) {
      _this.handleMapBoundsChanged();
    });


    this.handleStarsLoad(this.starsRecords);
  }

  /** OnLoad */
  componentDidMount() {
    SessionManager.checkAuth(null);
  }

  handleDragStart(e) {
    this.is_dragging = true;
  }

  handleDragEnd(e) {
    this.is_dragging = false;
    this.handleMapBoundsChanged();
  }

  /** Map Moved */
  handleMapBoundsChanged() {
    if (this.is_dragging) return;

    let _t = this;
    if (this.state.isLoadingTraces) {
      console.log('loading, skip');
      return;
    }

    let bounds = window.map.getBounds();
    if (bounds === null) return;

    this.setState({ isLoadingTraces: true });

    let latDiff = bounds.getNorthEast().lat() - bounds.getSouthWest().lat();
    let lngDiff = bounds.getNorthEast().lng() - bounds.getSouthWest().lng();

    // Current bounds
    let maxLat = bounds.getNorthEast().lat();
    let maxLng = bounds.getNorthEast().lng();
    let minLat = bounds.getSouthWest().lat();
    let minLng = bounds.getSouthWest().lng();

    // Bigger bounds to load
    let nMaxLat = bounds.getNorthEast().lat() + latDiff;
    let nMaxLng = bounds.getNorthEast().lng() + lngDiff;
    let nMinLat = bounds.getSouthWest().lat() - latDiff;
    let nMinLng = bounds.getSouthWest().lng() - lngDiff;

    if (Date.now() - this.lastResetTime > 60 * 1000 && this.overlayManager.getCount() > 500) {
      // Reset

      this.loadedAreaManager.clear();
      this.overlayManager.clear();
      this.setState({ traces: [] });
      this.lastResetTime = Date.now();

    }

    let z = window.map.getZoom();
    var loadDetail = z > 12;

    if (!this.loadedAreaManager.isLoaded(maxLat, maxLng, minLat, minLng, loadDetail)) {

      CloudDatastore.queryTraces(nMaxLat, nMaxLng, nMinLat, nMinLng, loadDetail,
                                 this.types, function(result) {
	  _t.setState({ isLoadingTraces: false });
	  _t.loadedAreaManager.addLoaded(nMaxLat, nMaxLng, nMinLat, nMinLng, loadDetail);
	  _t.handleTracesLoad(result.records);
	}
      );
    }
    else {
      console.log('loaded');
      _t.setState({ isLoadingTraces: false });
    }
  }

  /** Star record is removed */
  handleStarRecordRemoved(re) {
    var markers = this.state.markers.filter(e => e !== this.state.selectedStar);
    this.setState({
      markers: markers,
      showStarSidebar: false
    });
  }

  handleTraceDeleted = this.handleTraceDeleted.bind(this);
  handleTraceDeleted(rn) {
    this.overlayManager.remove(rn);

    var traces = this.state.traces.filter(e => e.recordName !== rn);

    this.setState({
      traces: traces,
      showTraceSidebar: false,
      dbTraceCount: this.overlayManager.getCount()
    });

  }

  /** Traces are loaded */
  handleTracesLoad(re) {

    console.log(re);

    var _this = this;
    this.setState(function(prevState, props) {

      var ret = prevState.traces;

      for (var it in re) {

	let isDetail = re[it].fields.detail !== undefined;
	if (_this.overlayManager.shouldRedraw(re[it].recordName, isDetail)) {
	  let pts = re[it].fields.detail === undefined ? re[it].fields.medium.value
              : re[it].fields.detail.value;

	  let trace = Trace(pts, re[it].fields.type.value, re[it].recordName,
                            re[it].zoneRecordName, re[it].share, re[it].fields.linkingId.value);

	  for (var it2 in ret) {
	    if (ret[it2].recordName === re[it].recordName) {
	      ret.splice(it2, 1);
	      break;
	    }
	  }

          if (re[it].recordName === _this.selectedTrace) {
            trace.selected = true;
          }
          
	  ret.push(trace);
          
	  _this.overlayManager.add(re[it].recordName, isDetail);
          console.log("overlay added");
	}
        else {
          console.log("XXX");
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

    var markers = [];
    var showS0 = (this.types.indexOf(7) > -1 ? true : false);
    var showS1 = (this.types.indexOf(8) > -1 ? true : false);

    for (var it in re) {
      var fields = re[it].fields;

      if (fields.type === undefined) {
        fields.type = {value: 0};
      }
      if ((showS0 && fields.type.value === 0) ||
	  (showS1 && fields.type.value === 1)) {

	var marker = Star(Coord(fields.location.value.latitude, fields.location.value.longitude),
                          fields.type.value, re[it].recordName);

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

    /*
      if (this.waypoints === null) {
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
      var poi = Star({ lat: e.latLng.lat(), lng: e.latLng.lng() }, MarkerType.googlePlace, '', e.placeId);

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
      state.showTraceSidebar = false;

      if (this.state.selectedTrace) {
	/** Unselect traces */
	let traces = this.state.traces;
	for (var it in traces) {
	    traces[it].selected = false;
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
      rightClickPosition: { left: e.pixel.x, top: e.pixel.y },
      rightClickEvent: e
    });
  }

  /** Map is loaded */
  handleMapMounted(map) {

    window.map = map;
    google = window.google;

    /** Disable default infoWindow */
    if (google) {
      google.maps.InfoWindow.prototype.set = function() {
      };
    }

    // Load settings
    var _t = this;
    var pos;

    settingManager = new SettingManager(() => {
      if (this.selectedTrace === null) {
        var loc = settingManager.getLastMapLocation();
        pos = Coord(loc.latitude, loc.longitude);
        window.map.panTo(pos);
      }
      else {
        CloudDatastore.getRecord(this.selectedTrace, (record) => {
          let r = record.fields;
          const bounds = new google.maps.LatLngBounds({lat: r.minLat.value / 1000000,
                                                       lng: r.minLng.value / 1000000},
                                                      {lat: r.maxLat.value / 1000000,
                                                       lng: r.maxLng.value / 1000000});
          window.map.fitBounds(bounds);

          _t.setState({ selectedTrace: record });
          
          console.log(bounds);
          console.log(r);          
        });
      }
      
      _t.types = settingManager.getTypes();
      _t.setState({ zoom: settingManager.getLastMapZoom() });
      
      if (_t.types.indexOf(7) + _t.types.indexOf(8) >= -1) {
	CloudDatastore.getStars().then(
	  result => {
            _t.starsRecords = result.records;
	    _t.handleStarsLoad(_t.starsRecords);
	  }
	);
      }
    });

    var input = document.getElementById('searchTextField');
    input.setAttribute('spellcheck', 'false');

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
      _t.setState({ isPanoramaView: v });

    });

    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      var markers = [];
      var isLocality = false;

      if (places.length === 0) {
	return;
      }
      else if (places.length === 1 && places[0].types.indexOf('political') > -1) {
	isLocality = true;
      }
      else {

	for (var it in _t.state.markers) {

	  if (_t.state.markers[it].type !== MarkerType.searchHit) {
	    markers.push(_t.state.markers[it]);
	  }
	}

      }

      var bounds = new google.maps.LatLngBounds();

      places.forEach(function(place) {
	if (!place.geometry) {
	  console.log("Returned place contains no geometry");
	}

	var marker = Star(Coord(place.geometry.location.lat(), place.geometry.location.lng()),
                          MarkerType.searchHit, '', place);

	markers.push(marker);

	if (place.geometry.viewport) {
	  // Only geocodes have viewport.
	  bounds.union(place.geometry.viewport);
	} else {
	  bounds.extend(place.geometry.location);
	}

      });

      if (isLocality === false) {
	_t.setState({
	  markers: markers
	});
      }

      map.fitBounds(bounds);
    });
  }

  /** When star is added by click on the context menu*/
  handleAddStar() {

    alert("Under development");
    return;

    // eslint-disable-next-line    
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

    console.log(trace);
    let traces = this.state.traces;

    // Use on trace to represent merged traces
    var selectedTrace = null;
    for (var it in traces) {
      if (this.state.selectedTrace && traces[it].recordName === this.state.selectedTrace.recordName) {
	traces[it].selected = false;
      }
      if ((traces[it].recordName === trace.recordName) ||
          ((trace.linkingId !== 0) && (traces[it].linkingId === trace.linkingId)) ||
          ((trace.linkingId !== 0) && traces[it].linkingId === -trace.linkingId)) {
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

    var markers = this.state.markers.filter(it => it.type !== MarkerType.new &&
                                            it.recordName !== e.recordName);
    var fields = e.fields;
    var star = Star(Coord(fields.location.value.latitude, fields.location.value.longitude),
                    Math.round(fields.type.value), e.recordName);

    markers.push(star);

    this.setState({
      markers: markers,
      selectedStar: star
    });

  }

  showFilterBox = this.showFilterBox.bind(this);
  showFilterBox() {
    this.setState({ showFilterBox: true });
  }

  onFilterCancel = this.onFilterCancel.bind(this);
  onFilterCancel() {
    this.setState({ showFilterBox: false });
  }

  showUpload = this.showUpload.bind(this);
  showUpload() {
    this.setState({ showUploadBox: true });
  }

  onUploadApply = this.onUploadApply.bind(this);
  onUploadApply(ckModel) {
    let trace = {};
    let _this = this;
    trace.recordName = "";
    trace.recordType = "Trace";
    trace.fields = ckModel;
    
    console.log(trace);

    CloudDatastore.saveRecord(trace, re => {
      console.log("SAVE RE: ", re);
      _this.setState({ uploadedTrace: null });
      _this.reset();
      _this.handleMapBoundsChanged();
    });
    
    this.setState({ showUploadBox: false });
  }

  onUploadCancel = this.onUploadCancel.bind(this);
  onUploadCancel() {
    this.setState({ showUploadBox: false, uploadedTrace: null });
  }

  onUploadPreview = this.onUploadPreview.bind(this);
  onUploadPreview(ckModel) {
    this.setState({ uploadedTrace: ckModel });
    const bounds = new google.maps.LatLngBounds({lat: ckModel.minLat / 1000000,
                                                 lng: ckModel.minLng / 1000000},
                                                {lat: ckModel.maxLat / 1000000,
                                                 lng: ckModel.maxLng / 1000000});
    window.map.fitBounds(bounds);
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

	{
	  this.state.showUploadBox && (
	    <UploadBox onCancel={this.onUploadCancel} onApply={this.onUploadApply} onPreview={this.onUploadPreview}/>
	  )
	}

	<SiteHeader selected="map" />


	<div className="header-bar">


	  <div className="shadow">
	    <input type="text" id="searchTextField" className='form-control form-control-sm' />
	  </div>

	  <div className="toolbox">
	    <button className="btn btn-info btn-sm" onClick={this.showFilterBox}>Filter</button>

	    <button className="btn btn-info btn-sm" onClick={this.onSetStartMap}>Set current map region as default</button>

	    <button className="btn btn-info btn-sm" onClick={this.showUpload}>Upload GPX</button>

	    <button className="btn btn-info btn-sm" onClick={this.gotoCurrentLocation}>Go to current location</button>
	  </div>

	</div>

	<ContextMenu active={this.state.showContextMenu} position={this.state.rightClickPosition} onAddStar={this.handleAddStar} />

	{
	  !this.state.isPanoramaView && this.state.showStarSidebar && (
	    <StarSidebar star={this.state.selectedStar} onStarRecordCreated={this.handleStarRecordCreated} onStarRemoved={this.handleStarRecordRemoved} />
	  )
	}
	{
	  !this.state.isPanoramaView && this.state.showTraceSidebar && (
	    <TraceSidebar trace={this.state.selectedTrace} onTraceDeleted={this.handleTraceDeleted} />
	  )
	}

	{!this.state.isPanoramaView && (<div className='xxxx'>T: {this.state.dbTraceCount}, S: {this.state.dbStarCount}</div>)}

	<Map

	  loadingElement={<div style={{ height: `100%` }} />}
	  containerElement={<div className='mapContainer' />}
	  mapElement={<div style={{ height: `100%` }} />}
	  googleMapURL={this.mapURL}
	  zoom={this.state.zoom}
	  markers={this.state.markers}
	  traces={this.state.traces}
	  uploadedTrace={this.state.uploadedTrace}
	  onMarkerClick={this.handleMarkerClick}
	  onTraceClick={this.handleTraceClick}
	  onMapMounted={this.handleMapMounted}
	  onMapLeftClick={this.handleMapLeftClick}
	  onMapRightClick={this.handleMapRightClick}
	  onBoundsChanged={this.handleMapBoundsChanged}
	  onDragStart={this.handleDragStart}
	  onDragEnd={this.handleDragEnd}
	  directions={this.state.directions}

	/>
      </div>

    );
  }

}

export default MapPage;
