'strict';
import IDatastore from './Datastore.js';
import STAR_RESULT from './results/stars.json';
import TRACES_RESULT from './results/traces.json';
import TRACES_MAP_RESULT from './results/traces_on_map.json';
import SETTING_RESULT from './results/settings.json';

export default class MockCloudDatastore extends IDatastore {

  static login() {


  }

  static getStars() {
    return new Promise((resolve, reject) => {
      setTimeout(function(){
        resolve(STAR_RESULT);
      }, 250);
    });
  }

  static getTrace(recordName) {
    return new Promise((resolve, reject) => {
      setTimeout(function(){
        resolve(TRACES_RESULT);
      }, 500);
    });
  }

  static getTraces() {
    return new Promise((resolve, reject) => {
      setTimeout(function(){
        resolve(TRACES_RESULT);
      }, 500);
    });
  }

  static queryTraces(maxLat, maxLng, minLat, minLng, loadDetail, types) {
    return new Promise((resolve, reject) => {
      setTimeout(function(){
        resolve(TRACES_MAP_RESULT);
      }, 500);
    });
  }

  static getSettings() {
    return new Promise((resolve, reject) => {
      setTimeout(function(){
        resolve(SETTING_RESULT);
      });
    });
  }
}
                       
