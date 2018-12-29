'strict';
import IDatastore from './Datastore.js';
import STAR_RESULT from './results/stars.json';

export default class MockCloudDatastore extends IDatastore {

  static login() {


  }

  static getStars() {
    return new Promise((resolve, reject) => {
      setTimeout(function(){
        var ret = STAR_RESULT;
        resolve(STAR_RESULT);
      }, 250);
    });
  }  

}
