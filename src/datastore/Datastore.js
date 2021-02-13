'strict';

import MockDatastore from './MockDatastore.js';
import CloudDatastore from './CloudDatastore.js';

export default class Datastore {
  static getInstance() {
    if (process.env.REACT_APP_OFFLINE_DEV === "true") {
      return MockDatastore;
    }
    else {
      return CloudDatastore;
    }
  }

  static getCloudInstance() {
    return CloudDatastore;
  }
}
