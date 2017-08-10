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
	  if (marker.type == Traces.Star.red) {
	      icon = {url: RedStarImg, scaledSize: new google.maps.Size(16, 16)};
	  }
	  else if (marker.type == Traces.Star.green) {
	      icon = {url: GreenStarImg, scaledSize: new google.maps.Size(16, 16)};
	  }
	  else {
	      icon = {url: PinImg, scaledSize: new google.maps.Size(48, 48)};
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

class Traces {
    
}
Traces.Star = class {
    static get red() { return 0; }
    static get green() { return 1; }
};


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

    componentDidMount() {
	this._ck.loadStars();	
    }
    
    handleStarsLoad(re) {

	var markers = this.state.markers;

	console.log(markers);
	
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
	
	this.setState({showContextMenu: true, rightClickPosition: {left: e.pixel.x, top: e.pixel.y}});
	
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
		if (_this.state.markers[it].type != -1) {
		    markers.push(_this.state.markers[it]);
		}
	    }

	    console.log(markers);
	    
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

		var marker = createMarker(place.geometry.location.lat(), place.geometry.location.lng(), -1);
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

    handleMarkerClick(targetMarker) {

	this.setState({
	    selectedStar: targetMarker,
	    showDetailSidebar: true
	});

    }
    
    render() {
	return (
	    <div className='full-height'>

	      <Menu active={this.state.showContextMenu} position={this.state.rightClickPosition} />
	      <CKComponent ref={(ck) => {this._ck = ck;}} onStarsLoad={this.handleStarsLoad} />

	      {
		  this.state.showDetailSidebar && (
		      <DetailSidebar star={this.state.selectedStar} ck={this._ck} />
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
