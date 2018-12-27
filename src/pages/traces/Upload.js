import React from 'react';
import './css.css';

class App extends React.Component {

  componentDidMount() { 

    const script = document.createElement('script');
    script.src = '/tomtom/tomtom.min.js';
    document.body.appendChild(script);
    script.async = false;
    script.onload = function () {

      
    };
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
      const tomtom = window.tomtom;

    if (this.props.geojson == null) return;
    
    const map = tomtom.L.map('map', {
      key: 'rAdhraHZaRG4cJg9j9umkAW8u9tZRxs1',
      source: 'vector',
      basePath: '/tomtom'
    });

    var polygon = {
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': this.props.geojson
          }
        }
      ]
    };
    var geoJson = tomtom.L.geoJson(polygon, { style: { color: '#00d7ff', opacity: 0.8 } }).addTo(map);
    map.fitBounds(geoJson.getBounds(), { padding: [5, 5] });
  }
  
  render() {
    return (<div id = 'map'></div>);
  }
}

export default App;
