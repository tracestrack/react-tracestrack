import IDatastore from './Datastore.js';

const CloudKit = window.CloudKit;
const zoneName = "Traces";

CloudKit.configure({
  locale: 'en-us',

  containers: [{

    // Change this to a container identifier you own.
    containerIdentifier: 'iCloud.fr.tsingtsai.Traces',

    apiTokenAuth: {
      // And generate a web token through CloudKit Dashboard.
      apiToken: process.env.REACT_APP_CloudKit_apiToken,
      persist: true, // Sets a cookie.
      signInButton: {
        id: 'apple-sign-in-button',
        theme: 'white-with-outline' // Other options: 'white', 'white-with-outline'.
      },
      signOutButton: {
        id: 'apple-sign-out-button',
        theme: 'white-with-outline'
      }
    },
    environment: process.env.REACT_APP_CloudKit_environment
  }]
});


/**
  * CloudDatastore is stateless.
  * To maintain states, for example continuationMarker, do so in react components.
  */
export default class CloudDatastore extends IDatastore {

  /**
   * The base query interface for CloudKit.
   */
  static performQuery(
    databaseScope, zoneName, ownerRecordName, recordType,
    desiredKeys, sortByField, ascending, latitude, longitude,
    filters, continuationMarker, callback, autoLoadMore
  ) {

    var container = CloudKit.getDefaultContainer();
    var database = container.getDatabaseWithDatabaseScope(
      CloudKit.DatabaseScope[databaseScope]
    );

    // Set the query parameters.
    var query = {
      recordType: recordType
    };

    if (sortByField) {
      var sortDescriptor = {
        fieldName: sortByField,
        ascending: ascending
      };

      query.sortBy = [sortDescriptor];
    }

    // Convert the filters to the appropriate format.
    var clonedMap = JSON.parse(JSON.stringify(filters));

    query.filterBy = clonedMap.map(filter => {
      filter.fieldValue = { value: filter.fieldValue };
      return filter;
    });

    // Set the options.
    var options = {
      desiredKeys: desiredKeys,
      resultsLimit: 50
    };

    if (continuationMarker != null) {
      options.continuationMarker = continuationMarker;
    }

    if (zoneName) {
      options.zoneID = { zoneName: zoneName };
      if (ownerRecordName) {
        options.zoneID.ownerRecordName = ownerRecordName;
      }
    }

    function handleResponse(response) {
      if (response.hasErrors) {
        console.log(response.errors);
        // Handle them in your app.
        throw response.errors[0];

      } else {

        var records = response.records;
        console.log('got ' + records.length + ' records');

        callback(response);
        
        if (response.moreComing && autoLoadMore) {
          console.log('auto load more');
          database.performQuery(response).then(handleResponse);
        }
      }
      return null;
    }

    // Execute the query.

    database.performQuery(query, options)
      .then(handleResponse);

  }

  static login() {

    let container = CloudKit.getDefaultContainer();

    container.setUpAuth()
      .then(function(userIdentity) {
        if (userIdentity) {
          alert(userIdentity);
        } else {

        }
      });
  }

  static getStars(params = {continuationMarker: null}) {
    
    var databaseScope = "PRIVATE";
    var ownerRecordName = null;
    var recordType = "Star";
    var desiredKeys = ["type", "location", "title", "countryCode"];
    var sortByField = "___createTime";
    var ascending = false;
    var latitude = null;
    var longitude = null;

    return new Promise((resolve, reject) => {
      CloudDatastore.performQuery(
      databaseScope, zoneName, ownerRecordName, recordType,
      desiredKeys, sortByField, ascending, latitude, longitude, [], params.continuationMarker,
      records => {
        resolve(records);
      }, false);
    });
  }

  static getTraces(params = {continuationMarker: null}) {
    var databaseScope = "PRIVATE";
    var ownerRecordName = null;
    var recordType = "Trace";
    var desiredKeys = ['type', 'startDate', 'path', 'title', 'secondsFromGMT'];
    var sortByField = 'startDate';
    var ascending = false;

    // private database
    return new Promise((resolve, reject) => {
      CloudDatastore.performQuery(
      databaseScope, zoneName, ownerRecordName, recordType,
      desiredKeys, sortByField, ascending, null, null, [], params.continuationMarker, records => {
        resolve(records);
      }, false);
    });
  }

  static queryTraces(maxLat, maxLng, minLat, minLng, loadDetail, types) {
    this.lastBox = [maxLat, maxLng, minLat, minLng];

    var databaseScope = "PRIVATE";
    var databaseSharedScope = "SHARED";
    var ownerRecordName = null;
    var recordType = "Trace";
    var desiredKeys = [loadDetail ? "detail" : "medium", 'type', 'linkingId'];
    var sortByField = null;
    var ascending = null;
    var latitude = null;
    var longitude = null;

    maxLat = Math.round(maxLat * 1000000);
    maxLng = Math.round(maxLng * 1000000);
    minLat = Math.round(minLat * 1000000);
    minLng = Math.round(minLng * 1000000);

    let gt = 'GREATER_THAN';
    let lt = 'LESS_THAN';
    alert(types);

    var filters = [
      { fieldName: 'maxLat', comparator: gt, fieldValue: minLat },
      { fieldName: 'maxLng', comparator: gt, fieldValue: minLng },
      { fieldName: 'minLat', comparator: lt, fieldValue: maxLat },
      { fieldName: 'minLng', comparator: lt, fieldValue: maxLng },
      { fieldName: "type", comparator: 'IN', fieldValue: types }
    ];

    return new Promise((resolve, reject) => {
      CloudDatastore.performQuery(
      databaseScope, zoneName, ownerRecordName, recordType,
        desiredKeys, sortByField, ascending, latitude, longitude, filters, null, function(records) {
          resolve(records);
        }, true);
    });
  }

  static getSettings() {
    var databaseScope = "PRIVATE";
    var ownerRecordName = null;
    var recordType = "Setting";
    var desiredKeys = ['types', 'lastMapZoom', 'lastMapLocation'];

    // private database
    return new Promise((resolve, reject) => {
      CloudDatastore.performQuery(
        databaseScope, zoneName, ownerRecordName, recordType,
        desiredKeys, null, null, null, null, [], null, function(re) {
          resolve(re);
        }, true);      
    });
  }

}
