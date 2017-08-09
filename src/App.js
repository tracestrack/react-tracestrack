import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker, InfoWindow } from "react-google-maps";
import AccountDropdown from './menu.js';
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
		{marker.showInfo && (
		    <DetailSidebar />
		)}
	      </Marker>
	  );
      })}
    </GoogleMap>
));

class Traces {
    
}
Traces.Star = class {
    static get red() { return 1; }
    static get green() { return 2; }
};


function createMarker(lat, lng, type) {

    const position = new google.maps.LatLng(
	lat, lng
    );

    return {
	position,
	content: 'hi',
	showInfo: false,
	type: type
    };
}

class App extends Component {

    state = {
	markers: [],
	isShow: false,
	rightClickPosition: {left: 100, top: 100}
    }

    handleMapMounted = this.handleMapMounted.bind(this);
    handleMarkerClick = this.handleMarkerClick.bind(this);
    handleMapRightClick = this.handleMapRightClick.bind(this);
    handleMapLeftClick = this.handleMapLeftClick.bind(this);
    handleStarsLoad = this.handleStarsLoad.bind(this);
    
    handleStarsLoad(re) {

	var markers = this.state.markers;

	console.log(re);
	
	for (var it in re) {
	    var marker = createMarker(re[it].fields.location.value.latitude, re[it].fields.location.value.longitude, Traces.Star.red);
	    markers.push(marker);	    
	}

	this.setState({
	    markers: markers
	});

    }
    
    handleMapLeftClick(e) {
	this.setState({isShow: false, rightClickPosition: {left: e.pixel.x, top: e.pixel.y}});
    }
    
    handleMapRightClick(e) {
	
	this.setState({isShow: true, rightClickPosition: {left: e.pixel.x, top: e.pixel.y}});
	
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
	    markers: this.state.markers.map(marker => {
		if (marker === targetMarker) {
		    return {
			...marker,
			showInfo: true,
		    };
		}
		return marker;
	    }),
	});
    }

    
    render() {
	return (
	    <div className='full-height'>

	      <AccountDropdown active={this.state.isShow} position={this.state.rightClickPosition} />
	      <CKComponent onStarsLoad={this.handleStarsLoad}/>

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
