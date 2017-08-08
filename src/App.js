import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker, InfoWindow } from "react-google-maps";
import AccountDropdown from './menu.js'

const SimpleMapExampleGoogleMap = withGoogleMap(props => (
    <GoogleMap
      ref={props.onMapMounted}      
      defaultZoom={8}
      defaultCenter={{ lat: -34.397, lng: 150.644 }}
      onClick={props.onMapLeftClick}
      onRightClick={props.onMapRightClick}
      >
      {props.markers.map((marker, index) => {
	  const onClick = () => props.onMarkerClick(marker);

	  return (
              <Marker
		key={index}
		position={marker.position}
		title={(index + 1).toString()}
		onClick={onClick}
		>
		{marker.showInfo && (
		    <InfoWindow>
		      <div>
			<strong>{marker.content}</strong>
			<br />
			<em>The contents of this InfoWindow are actually ReactElements.</em>
		      </div>
		    </InfoWindow>
		)}
              </Marker>
	  );
      })}
    </GoogleMap>
));
const google = window.google;

function createMarker(latLng) {

    const markers = [];
    const position = new google.maps.LatLng(
	latLng.lat(), latLng.lng()
    );

    markers.push({
	position,
	content: 'hi',
	showInfo: false,
    });

    return markers;
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

	var markers = [];
	var _this = this;
	
	searchBox.addListener('places_changed', function() {
	    var places = searchBox.getPlaces();

	    if (places.length == 0) {
		return;
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

		var marker = createMarker(place.geometry.location)
		
		_this.setState({
		    markers: marker
		});
		
		/*
		markers.push(new google.maps.Marker({
		    map: window.map,
		    icon: icon,
		    title: place.name,
		    position: place.geometry.location
		}));*/

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
