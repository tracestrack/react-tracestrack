import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker, InfoWindow } from "react-google-maps";
import Menu from './menu.js';
import CKComponent from './Cloud.js';
import DetailSidebar from './DetailSidebar.js';
import GreenStarImg from './img/star_green.png';
import RedStarImg from './img/star_red.png';
import PinImg from './img/pin.png';

const google = window.google;

const SimpleMapExampleGoogleMap = withGoogleMap(props => (
    <GoogleMap
      ref={props.onMapMounted}
      defaultOptions={{
	  mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.DEFAULT,
              position: google.maps.ControlPosition.TOP_LEFT
	  },
	  zoomControl: false,
	  streetViewControlOptions: {
              position: google.maps.ControlPosition.BOTTOM_CENTER
	  }
      }}
      defaultZoom={14}
      defaultCenter={{ lat: 48.852, lng: 2.350 }}
      onClick={props.onMapLeftClick}
      onRightClick={props.onMapRightClick}
      >
      {props.markers.map((marker, index) => {
	  const onClick = () => props.onMarkerClick(marker);

	  var icon;
	  
	  switch (marker.type) {
	  case MarkerType.red:
	      icon = {url: RedStarImg, scaledSize: new google.maps.Size(16, 16)};
	      break;
	  case MarkerType.green:
	      icon = {url: GreenStarImg, scaledSize: new google.maps.Size(16, 16)};
	      break;
	  case MarkerType.searchHit:
	      icon = {url: PinImg, scaledSize: new google.maps.Size(48, 48)};
	      break;
	  case MarkerType.new:
	      icon = {url: PinImg, scaledSize: new google.maps.Size(48, 48)};
	      break;
	  }
	  
	  return (
	      <Marker
		key={index}
		icon={icon}
		position={marker.position}
		title={(index + 1).toString()}
		onClick={onClick}
		>
	      </Marker>
	  );
      })}
    </GoogleMap>
));

class MarkerType {
    static get red() { return 0; }
    static get green() { return 1; }
    
    static get new() { return -1; }
    static get searchHit() { return -2; }
    static get wiki() { return -3; }
}

function createMarker(lat, lng, type, data) {

    const position = new google.maps.LatLng(
	lat, lng
    );

    return {
	position,
	showInfo: false,
	type: type,
	data: data
    };
}

class App extends Component {

    state = {
	markers: [],
	showContextMenu: false,
	showDetailSidebar: false,
	rightClickPosition: {left: 100, top: 100}
    }

    handleMapMounted = this.handleMapMounted.bind(this);
    handleMarkerClick = this.handleMarkerClick.bind(this);
    handleMapRightClick = this.handleMapRightClick.bind(this);
    handleMapLeftClick = this.handleMapLeftClick.bind(this);
    handleStarsLoad = this.handleStarsLoad.bind(this);
    handleAddStar = this.handleAddStar.bind(this);
    handleStarSaved = this.handleStarSaved.bind(this);
    handleStarRecordCreated = this.handleStarRecordCreated.bind(this);
    
    componentDidMount() {
	this._ck.loadStars();	
    }
    
    handleStarsLoad(re) {

	var markers = this.state.markers;

	for (var it in re) {

	    var fields = re[it].fields;
	    
	    var marker = createMarker(fields.location.value.latitude, fields.location.value.longitude, fields.type.value, re[it]);
	    
	    markers.push(marker);	    
	}

	this.setState({
	    markers: markers
	});

    }
    
    handleMapLeftClick(e) {
	this.setState({
	    showDetailSidebar: false,
	    showContextMenu: false
	});
	
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
		
		var icon = {
		    url: place.icon,
		    size: new google.maps.Size(71, 71),
		    origin: new google.maps.Point(0, 0),
		    anchor: new google.maps.Point(17, 34),
		    scaledSize: new google.maps.Size(25, 25)
		};

		// Create a marker for each place.

		var marker = createMarker(place.geometry.location.lat(), place.geometry.location.lng(), MarkerType.searchHit);
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

    createNewStar(title, coords, type, url, note) {
	return {
	    title: title,
	    coords: coords,
	    type: type,
	    url: url,
	    note: note
	};
    }
    
    handleAddStar() {

	let loc = this.state.rightClickEvent.latLng;
	var markers = this.state.markers;
	markers.push(createMarker(loc.lat(), loc.lng(), MarkerType.new));

	var newStar = this.createNewStar("Untitled", {lat: loc.lat(), lng: loc.lng()}, 0, "", "note");
	newStar.isNewStar = true;
	
	this.setState({
	    markers: markers,
	    showContextMenu: false,
	    selectedStar: newStar,
	    showDetailSidebar: true	    
	});
	
    }

    handleMarkerClick(targetMarker) {
	this.setState({
	    selectedStar: targetMarker,
	    showDetailSidebar: true
	});
    }

    handleStarSaved() {
/*	var markers = this.state.markers.filter(x => x.type != MarkerType.new);
	this.setState({markers: markers});*/
    }

    handleStarRecordCreated(e) {
	
	var markers = this.state.markers.filter(it => it.type != MarkerType.new);
	
	var fields = e[0].fields;

	var marker = createMarker(fields.location.value.latitude, fields.location.value.longitude, parseInt(fields.type.value), e[0]);
	markers.push(marker);

	console.log(marker);

	this.setState({
	    markers: markers,
	    selectedStar: marker
	});
	
    }
    
    render() {
	return (
	    <div className='full-height'>

	      <Menu active={this.state.showContextMenu} position={this.state.rightClickPosition} onAddStar={this.handleAddStar} />
	      
	      <CKComponent ref={(ck) => {this._ck = ck;}} onStarsLoad={this.handleStarsLoad} onStarRecordCreated={this.handleStarRecordCreated} />

	      {
		  this.state.showDetailSidebar && (
		      <DetailSidebar star={this.state.selectedStar} ck={this._ck} onStarSaved={this.handleStarSaved} />
		  )
	      }	      

	      <input type="text" id="searchTextField" className='searchBar' />
	      
	      <SimpleMapExampleGoogleMap
		markers={this.state.markers}
		onMarkerClick={this.handleMarkerClick}
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
