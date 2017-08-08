import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";

const SimpleMapExampleGoogleMap = withGoogleMap(props => (
    <GoogleMap
      defaultZoom={8}
      defaultCenter={{ lat: -34.397, lng: 150.644 }}
      />
));


class App extends Component {

    render() {
	return (
	    <div className='full-height'>

	    <SimpleMapExampleGoogleMap
	      containerElement={
		      <div style={{ height: `100%` }} />
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
