import $ from "jquery";

function GooglePlaceStruct(name, address, countryCode, countrySubdivision, url, note) {
  return {name: name, address: address, countryCode: countryCode, countrySubdivision: countrySubdivision, url: url, note: note};
}

function createNoteFromGooglePlace(place) {

  var photos = place.photos;
  var md = "";
  var count = 3;
  console.log(place);
  for (var it in photos) {
    var photo = photos[it];
    var el = $(photo.html_attributions[0]);

    md += `![Photo credit: [` + el.text() + `]](` + photo.getUrl({ maxWidth: 300 }) + `)`;
    if (count-- === 0)
      break;

  }
  return `[View on Google Maps](` + place.url + `)` + md;
}

export function getCountryCode(place) {
  for (var it in place.address_components) {
    if (place.address_components[it].types.indexOf("country") > -1) {
      return place.address_components[it].short_name;
    }
  }
  return "nil";
}

export function getCountrySubdivision(place) {
  for (var it in place.address_components) {
    if (place.address_components[it].types.indexOf("administrative_area_level_1") > -1) {
      return place.address_components[it].long_name;
    }
  }
  return "nil";
}

export function getGooglePlaceById(id, callback) {
  let MAP = "__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED";
  var service = new window.google.maps.places.PlacesService(window.map.context[MAP]);
  service.getDetails({placeId: id}, function(place, status) {
    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
      let result = GooglePlaceStruct(place.name, place.formatted_address, getCountryCode(place), getCountrySubdivision(place), place.website, createNoteFromGooglePlace(place));
      callback(result);
    }
  });
}
