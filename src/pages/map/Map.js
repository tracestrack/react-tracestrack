import React from "react";
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Polyline } from "react-google-maps";
import { MarkerType } from '../common/Models.js';
import GreenStarImg from '../../resources/img/star_green.png';
import RedStarImg from '../../resources/img/star_red.png';
import exports from '../../utils/transformation.js';
import LightStyle from "../../resources/mapstyles/light.json";

const transform = exports;

function getColor(type) {
    switch (type) {
    case 0:
        return '#999505';
    case 1:
        return '#ae41fb';
    case 2:
        return '#ec1313';
    case 3:
        return '#008000';
    case 4:
        return '#045cc8';
    case 5:
        return '#ff8c00';
    case 6:
        return '#447F84';
    default:
        return '#000000';
    }
}

export class LoadedAreaManager {

    constructor() {
        this.bboxes = [];
    }

    clear() {
        console.log("loaded area cleared");
        this.bboxes = [];
    }

    addLoaded(maxLat, maxLng, minLat, minLng, loadDetail) {
        console.log("loaded area added");
        this.bboxes.push([maxLat, maxLng, minLat, minLng, loadDetail]);
    }

    isLoaded(maxLat, maxLng, minLat, minLng, loadDetail) {
        for (var it in this.bboxes) {
            let bit = this.bboxes[it];
            if ((maxLat <= bit[0] && maxLng <= bit[1] && minLat >= bit[2] && minLng >= bit[3]) && (bit[4] || bit[4] === loadDetail)) {
                //loaded
                return true;
            }
        }
        return false;
    }
}

export class OverlayManager {

    constructor() {
        this.overlayDict = {};
    }

    getCount() {
        return Object.keys(this.overlayDict).length;
    }

    shouldRedraw(recordName, isDetail) {
        if (recordName in this.overlayDict === false) {
            return true;
        }
        return isDetail && !this.overlayDict[recordName];
    }

    add(recordName, isDetail) {
        this.overlayDict[recordName] = isDetail;
    }

    remove(recordName) {
        delete this.overlayDict[recordName];
    }

    clear() {
        this.overlayDict = {};
    }
}

function convertCKPointToLatLng(points) {

  let coords = [];
  
  for (var i = 0; i < points.length; i += 2) {
    coords.push({lat: points[i] / 1000000.0, lng: points[i + 1] / 1000000.0});
  }

  return coords;
}

export const Map = withScriptjs(withGoogleMap((props) =>

                                              <GoogleMap
                                                ref={props.onMapMounted}
                                                defaultOptions={{
                                                    mapTypeControlOptions: {
                                                        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                                                        position: window.google.maps.ControlPosition.TOP_RIGHT
                                                    },
                                                  styles: LightStyle,
                                                    zoomControl: true,
                                                    clickableIcons: true,
                                                    fullscreenControl: false,
                                                    minZoom: 8,
                                                    maxZoom: 18,
                                                    streetViewControlOptions: {
                                                        position: window.google.maps.ControlPosition.BOTTOM_CENTER
                                                    }
                                                }}

                                                zoom={props.zoom}
                                                onClick={props.onMapLeftClick}
                                                onZoomChanged={props.onZoomChanged}
                                                onRightClick={props.onMapRightClick}
                                                onBoundsChanged={props.onBoundsChanged}
                                                onDragStart={props.onDragStart}
                                                onDragEnd={props.onDragEnd}
                                              >


                                                {props.traces && props.traces.map((trace, index) => {

                                                    const onClick = () => props.onTraceClick(trace);

                                                    var coords = [];

                                                    for (var i = 0; i < trace.detail.length; i += 2) {

                                                        let gcj = transform.wgs2gcj(trace.detail[i] / 1000000, trace.detail[i + 1] / 1000000);
                                                        coords.push({
                                                            lat: gcj.lat,
                                                            lng: gcj.lng
                                                        });
                                                    }

                                                    var opt = {
                                                        strokeColor: getColor(trace.type),
                                                        strokeOpacity: 0.7,
                                                        strokeWeight: trace.selected ? 5 : 2
                                                    };

                                                    return (
                                                        <Polyline
                                                          key={index}
                                                          path={coords}
                                                          options={opt}
                                                          onClick={onClick}
                                                        />
                                                    );
                                                })}

                                                {props.uploadedTrace && (
                                                        <Polyline
                                                          key="uploadedTrace"
                                                          path={convertCKPointToLatLng(props.uploadedTrace.detail)}
                                                          options={{
                                                            strokeColor: '0x333333',
                                                            strokeOpacity: 0.7,
                                                            strokeWeight: 4
                                                          }}
                                                        />
                                                )}


                                                {props.markers && props.markers.map((marker, index) => {
                                                    const onClick = () => props.onMarkerClick(marker);

                                                    let position = new window.google.maps.LatLng(
                                                        marker.coord.lat, marker.coord.lng
                                                    );

                                                    var icon;

                                                    switch (marker.type) {
                                                    case MarkerType.red:
                                                        icon = { url: RedStarImg, scaledSize: new window.google.maps.Size(24, 24) };
                                                        break;
                                                    case MarkerType.green:
                                                        icon = { url: GreenStarImg, scaledSize: new window.google.maps.Size(24, 24) };
                                                        break;
                                                    case MarkerType.searchHit:
                                                        //icon = {url: PinImg, scaledSize: new window.google.maps.Size(32, 32)};
                                                        break;
                                                    case MarkerType.new:
                                                        //icon = {url: PinImg, scaledSize: new window.google.maps.Size(48, 48)};
                                                        break;
                                                    default:

                                                    };

                                                    return (
                                                        <Marker
                                                          key={marker.recordName}
                                                          icon={icon}
                                                          position={position}
                                                          title={(index + 1).toString()}
                                                          onClick={onClick}
                                                        >
                                                        </Marker>
                                                    );
                                                })}


                                              </GoogleMap>
                                             ));

