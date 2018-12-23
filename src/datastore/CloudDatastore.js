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

export default class CloudDatastore extends IDatastore {

  static performQuery(
    databaseScope, zoneName, ownerRecordName, recordType,
    desiredKeys, sortByField, ascending, latitude, longitude,
    filters, continuationMarker, callback, finishCallback, autoLoadMore
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

    query.filterBy = clonedMap.map(function(filter) {
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

        callback(records);
        
        if (response.moreComing && autoLoadMore) {
          console.log('auto load more');
          database.performQuery(response).then(handleResponse);
        }
        else {
          console.log('end');
          if (finishCallback) finishCallback();
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

        } else {

        }
      });

  }

  static getStars() {
    
    var databaseScope = "PRIVATE";
    var ownerRecordName = null;
    var recordType = "Star";
    var desiredKeys = ["type", "location"];
    var sortByField = null;
    var ascending = null;
    var latitude = null;
    var longitude = null;

    return new Promise(function(resolve, reject) {
    CloudDatastore.performQuery(
      databaseScope, zoneName, ownerRecordName, recordType,
      desiredKeys, sortByField, ascending, latitude, longitude, [], null,
      records => {
        resolve(records);
      },
      () => { }, false);

    });
  }  
}
