import IDatastore from './Datastore.js';

const CloudKit = window.CloudKit;
const zoneName = "Traces";

if (CloudKit) {
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
}


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

  static login(onAuth, onUnauth) {

    let container = CloudKit.getDefaultContainer();

    function gotoAuthenticatedState(userIdentity) {
      onAuth(userIdentity);
      container
        .whenUserSignsOut()
        .then(gotoUnauthenticatedState);
    }
    function gotoUnauthenticatedState(error) {
      onUnauth(error);
      container
        .whenUserSignsIn()
        .then(gotoAuthenticatedState)
        .catch(gotoUnauthenticatedState);
    }
    
    return container.setUpAuth()
      .then(function(userIdentity) {
        if(userIdentity) {
          gotoAuthenticatedState(userIdentity);
        } else {
          gotoUnauthenticatedState();
        }
      });
  }

  static getStars(params = {continuationMarker: null}) {
    
    var databaseScope = "PRIVATE";
    var ownerRecordName = null;
    var recordType = "Star";
    var desiredKeys = ["type", "location", "title", "countryCode", "countrySubdivision"];
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

  static demoFetchRecord(
    databaseScope, recordName, zoneName, callback
  ) {
    var container = CloudKit.getDefaultContainer();
    var database = container.getDatabaseWithDatabaseScope(
      CloudKit.DatabaseScope[databaseScope]
    );

    var zoneID, options;

    if (zoneName) {
      zoneID = { zoneName: zoneName };
      options = { zoneID: zoneID };
    }

    return database.fetchRecords(recordName, options)
      .then(function(response) {
        if (response.hasErrors) {

          // Handle the errors in your app.
          throw response.errors[0];

        } else {
          var record = response.records[0];
          console.log(record.modified);

          // Render the fetched record.
          callback(record);
        }
      });
  }

  static getRecord(recordName, callback) {
    var databaseScope = "PRIVATE";

    return CloudDatastore.demoFetchRecord(
      databaseScope, recordName, zoneName, callback
    );
  }
  
  static getTraces(params = {continuationMarker: null}) {
    var databaseScope = "PRIVATE";
    var ownerRecordName = null;
    var recordType = "Trace";
    var desiredKeys = ['type', 'startDate', 'title', 'secondsFromGMT', 'distance', 'averageSpeed', 'duration', 'elevation'];
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

  static queryTraces(maxLat, maxLng, minLat, minLng, loadDetail, types, tracesLoadedCallback) {
    this.lastBox = [maxLat, maxLng, minLat, minLng];

    var databaseScope = "PRIVATE";
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

    var filters = [
      { fieldName: 'maxLat', comparator: gt, fieldValue: minLat },
      { fieldName: 'maxLng', comparator: gt, fieldValue: minLng },
      { fieldName: 'minLat', comparator: lt, fieldValue: maxLat },
      { fieldName: 'minLng', comparator: lt, fieldValue: maxLng },
      { fieldName: "type", comparator: 'IN', fieldValue: types }
    ];

    CloudDatastore.performQuery(
      databaseScope, zoneName, ownerRecordName, recordType,
      desiredKeys, sortByField, ascending, latitude, longitude, filters, null, function(records) {
        tracesLoadedCallback(records);
      }, true);
  }

  static saveRecord(re, callback) {

    var databaseScope = "PRIVATE";
    var recordName = re.recordName;

    var forRecordName = null;
    var forRecordChangeTag = null;
    var publicPermission = null;
    var ownerRecordName = null;
    var participants = null;
    var parentRecordName = null;
    var fields = re.fields;
    var createShortGUID = false;
    var recordType = re.recordType;

    var zoneID = { zoneName: zoneName };
    var options = { zoneID: zoneID };

    var _this = this;

    var container = CloudKit.getDefaultContainer();
    var database = container.getDatabaseWithDatabaseScope(
      CloudKit.DatabaseScope[databaseScope]
    );


    function doSave(recordChangeTag) {
      return _this.demoSaveRecords(databaseScope, recordName, recordChangeTag, recordType, zoneName,
                                   forRecordName, forRecordChangeTag, publicPermission, ownerRecordName,
                                   participants, parentRecordName, fields, createShortGUID, callback);
    }


    if (recordName) {
      return database.fetchRecords(recordName, options)
        .then(function(response) {
          if (response.hasErrors) {

            // Handle the errors in your app.
            throw response.errors[0];

          } else {
            var record = response.records[0];
            return doSave(record.recordChangeTag);
          }
        });
    }
    else {
      return doSave();
    }
  }

  static demoSaveRecords(
    databaseScope, recordName, recordChangeTag, recordType, zoneName,
    forRecordName, forRecordChangeTag, publicPermission, ownerRecordName,
    participants, parentRecordName, fields, createShortGUID, callback
  ) {

    var container = CloudKit.getDefaultContainer();
    var database = container.getDatabaseWithDatabaseScope(
      CloudKit.DatabaseScope[databaseScope]
    );

    var options = {
      // By passing and fetching number fields as strings we can use large
      // numbers (up to the server's limits).
      numbersAsStrings: true

    };

    // If no zoneName is provided the record will be saved to the default zone.
    if (zoneName) {
      options.zoneID = { zoneName: zoneName };

      if (ownerRecordName) {
        options.zoneID.ownerRecordName = ownerRecordName;
      }
    }

    var record = {

      recordType: recordType

    };

    // If no recordName is supplied the server will generate one.
    if (recordName) {
      record.recordName = recordName;
    }

    // To modify an existing record, supply a recordChangeTag.
    if (recordChangeTag) {
      record.recordChangeTag = recordChangeTag;
    }

    // Convert the fields to the appropriate format.
    record.fields = Object.keys(fields).reduce(function(obj, key) {
      obj[key] = { value: fields[key] };
      return obj;
    }, {});

    // If we are going to want to share the record we need to
    // request a stable short GUID.
    if (createShortGUID) {
      record.createShortGUID = true;
    }

    // If we want to share the record via a parent reference we need to set
    // the record's parent property.
    if (parentRecordName) {
      record.parent = { recordName: parentRecordName };
    }

    if (publicPermission) {
      record.publicPermission = CloudKit.ShareParticipantPermission[publicPermission];
    }

    // If we are creating a share record, we must specify the
    // record which we are sharing.
    if (forRecordName && forRecordChangeTag) {
      record.forRecord = {
        recordName: forRecordName,
        recordChangeTag: forRecordChangeTag
      };
    }

    if (participants) {
      record.participants = participants.map(function(participant) {
        return {
          userIdentity: {
            lookupInfo: { emailAddress: participant.emailAddress }
          },
          permission: CloudKit.ShareParticipantPermission[participant.permission],
          type: participant.type,
          acceptanceStatus: participant.acceptanceStatus
        };
      });
    }

    database.saveRecords(record, options)
      .then(function(response) {
        if (response.hasErrors) {
          // Handle the errors in your app.
          console.log(response.errors);
          throw response.errors[0];
        } else {
          callback(response._results[0]);
        }
      });
  }

  static removeRecord(recordName) {
    var databaseScope = "PRIVATE";
    var ownerRecordName = null;
    //re.zoneID.ownerRecordName;

    return new Promise((resolve, reject) => {
      CloudDatastore.demoDeleteRecord(
        databaseScope, recordName, zoneName, ownerRecordName, records => {
          resolve(records);
        }
      );
    });
  }

  static demoDeleteRecord(
    databaseScope, recordName, zoneName, ownerRecordName, callback
  ) {
    var container = CloudKit.getDefaultContainer();
    var database = container.getDatabaseWithDatabaseScope(
      CloudKit.DatabaseScope[databaseScope]
    );

    var zoneID, options;

    if (zoneName) {
      zoneID = { zoneName: zoneName };
      if (ownerRecordName) {
        zoneID.ownerRecordName = ownerRecordName;
      }
      options = { zoneID: zoneID };
    }

    return database.deleteRecords(recordName, options)
      .then(function(response) {
        if (response.hasErrors) {

          // Handle the errors in your app.
          throw response.errors[0];

        } else {
          var deletedRecord = response.records[0];

          // Render the deleted record.

          callback(deletedRecord);

        }
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
