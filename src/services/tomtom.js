import $ from 'jquery';

export function ReverseGeocodingStruct(address, countryCode, countrySubdivision) {
  return {
    address: address,
    countryCode:  countryCode,
    countrySubdivision: countrySubdivision
  };
}

export function getReverseGeocodingAPIURL(lat, lng) {
  return "https://api.tomtom.com/search/2/reverseGeocode/" + lat + "," + lng + ".json?key=" + process.env.REACT_APP_TomTom_key;
}


export function getReverseGeocode(lat, lng, callback) {

  $.getJSON(getReverseGeocodingAPIURL(lat, lng), function(data) {

    let result = ReverseGeocodingStruct(data.addresses[0].address.freeformAddress, data.addresses[0].address.countryCode, data.addresses[0].address.countrySubdivision);

    callback(result);

  });
  
}
