import React from 'react'
import {Component} from 'react';
import ReactMapGL from 'react-map-gl';

class Map2 extends Component {

    state = {
	viewport: {
	    width: 1000,
	    height: 1000,
	    latitude: 37.7577,
	    longitude: -122.4376,
	    zoom: 8
	}
    };

    render() {
	return (

	        <ReactMapGL
            {...this.state.viewport}
            onViewportChange={(viewport) => this.setState({viewport})}
		/>
	);
    }
}

export default Map2;
