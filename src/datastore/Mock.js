'strict';
import IDatastore from './Datastore.js';
import STAR_RESULT from './results/stars.json';
import TRACES_RESULT from './results/traces.json';

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

  static getTraces() {
    return new Promise((resolve, reject) => {
      setTimeout(function(){
        resolve(TRACES_RESULT);
      }, 500);
    });
  }  

}
