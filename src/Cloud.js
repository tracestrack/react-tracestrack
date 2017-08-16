import React, { Component, PropTypes } from 'react';
import "./Cloud.css";

const CloudKit = window.CloudKit;

const zoneName = "Traces";

CloudKit.configure({
    locale: 'en-us',

    containers: [{

	// Change this to a container identifier you own.
	containerIdentifier: 'iCloud.fr.tsingtsai.Traces',

	apiTokenAuth: {
	    // And generate a web token through CloudKit Dashboard.
	    apiToken: '6b9e74116c6fda0d630b430b113508ba51cb2bd2faf78e6661eae0631a30facc',

	    persist: true, // Sets a cookie.

	    signInButton: {
		id: 'apple-sign-in-button',
		theme: 'black' // Other options: 'white', 'white-with-outline'.
	    },

	    signOutButton: {
		id: 'apple-sign-out-button',
		theme: 'black'
	    }
	},

	environment: 'development'
    }]
});


function displayUserName(name) {
    window.$("#apple-sign-in-button").text(name);    
}

function demoSaveRecordZones(zoneName) {
    var container = CloudKit.getDefaultContainer();
    var privateDB = container.privateCloudDatabase;

    return privateDB.saveRecordZones({zoneName: zoneName}).then(function(response) {
	if(response.hasErrors) {

	    console.log("error creating zone");
	    // Handle any errors.
	    throw response.errors[0];

	} else {

	    // response.zones is an array of zone objects.
	    console.log(response);
	    //return renderZone(response.zones[0]);

	}
    });
}

class CKComponent extends Component {

    demoPerformQuery = this.demoPerformQuery.bind(this);
    loadRecord= this.loadRecord.bind(this);
    loadStars = this.loadStars.bind(this);   
    loadTraces = this.loadTraces.bind(this);    
    demoSetUpAuth = this.demoSetUpAuth.bind(this);

    demoSetUpAuth() {

	// Get the container.
	var container = CloudKit.getDefaultContainer();
	let _this = this;

	function gotoAuthenticatedState(userIdentity) {
	    window.userIdentity = userIdentity;
	    
	    var name = userIdentity.nameComponents;
	    if(name) {
		displayUserName(name.givenName + ' ' + name.familyName);
	    } else {
		displayUserName('User record name: ' + userIdentity.userRecordName);
	    }

	    _this.props.onLoginSuccess();
	    
	    container
		.whenUserSignsOut()
		.then(gotoUnauthenticatedState);
	}
	function gotoUnauthenticatedState(error) {

	    if(error && error.ckErrorCode === 'AUTH_PERSIST_ERROR') {
		window.showDialogForPersistError();
	    }

	    container
		.whenUserSignsIn()
		.then(gotoAuthenticatedState)
		.catch(gotoUnauthenticatedState);
	}

	// Check a user is signed in and render the appropriate button.
	return container.setUpAuth()
	    .then(function(userIdentity) {

		// Either a sign-in or a sign-out button was added to the DOM.

		// userIdentity is the signed-in user or null.
		if(userIdentity) {
		    gotoAuthenticatedState(userIdentity);
		    demoSaveRecordZones(zoneName);
		} else {
		    gotoUnauthenticatedState();
		}
	    });
    }



    
    demoSaveRecords(
	databaseScope,recordName,recordChangeTag,recordType,zoneName,
	forRecordName,forRecordChangeTag,publicPermission,ownerRecordName,
	participants,parentRecordName,fields,createShortGUID
    ) {
	var _this = this;
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
	if(zoneName) {
	    options.zoneID = { zoneName: zoneName };

	    if(ownerRecordName) {
		options.zoneID.ownerRecordName = ownerRecordName;
	    }
	}

	var record = {

	    recordType: recordType

	};

	// If no recordName is supplied the server will generate one.
	if(recordName) {
	    record.recordName = recordName;
	}

	// To modify an existing record, supply a recordChangeTag.
	if(recordChangeTag) {
	    record.recordChangeTag = recordChangeTag;
	}

	// Convert the fields to the appropriate format.
	record.fields = Object.keys(fields).reduce(function(obj,key) {
	    obj[key] = { value: fields[key] };
	    return obj;
	},{});

	// If we are going to want to share the record we need to
	// request a stable short GUID.
	if(createShortGUID) {
	    record.createShortGUID = true;
	}

	// If we want to share the record via a parent reference we need to set
	// the record's parent property.
	if(parentRecordName) {
	    record.parent = { recordName: parentRecordName };
	}

	if(publicPermission) {
	    record.publicPermission = CloudKit.ShareParticipantPermission[publicPermission];
	}

	// If we are creating a share record, we must specify the
	// record which we are sharing.
	if(forRecordName && forRecordChangeTag) {
	    record.forRecord = {
		recordName: forRecordName,
		recordChangeTag: forRecordChangeTag
	    };
	}

	if(participants) {
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

	return database.saveRecords(record,options)
	    .then(function(response) {
		if(response.hasErrors) {

		    // Handle the errors in your app.
		    throw response.errors[0];

		} else {
		    if (typeof _this.props.onStarRecordCreated === 'function') {
			_this.props.onStarRecordCreated(record);
		    }
		}
	    });
    }

    
    demoPerformQuery(
	databaseScope,zoneName,ownerRecordName,recordType,
	desiredKeys,sortByField,ascending,latitude,longitude,
	filters, callback
    ) {

	var container = CloudKit.getDefaultContainer();
	var database = container.getDatabaseWithDatabaseScope(
	    CloudKit.DatabaseScope[databaseScope]
	);
	var _this = this;

	// Set the query parameters.
	var query = {
	    recordType: recordType
	};

	if(sortByField) {
	    var sortDescriptor = {
		fieldName: sortByField,
		ascending: ascending
	    };

	    if(!isNaN(latitude) && !isNaN(longitude)) {
		sortDescriptor.relativeLocation = {
		    latitude: latitude,
		    longitude: longitude
		};
	    }

	    query.sortBy = [sortDescriptor];
	}

	// Convert the filters to the appropriate format.
	query.filterBy = filters.map(function(filter) {
	    filter.fieldValue = { value: filter.fieldValue };
	    return filter;
	});


	// Set the options.
	var options = {

	    // Restrict our returned fields to this array of keys.
	    desiredKeys: desiredKeys,

	    // Fetch 5 results at a time.
	    resultsLimit: 100

	};

	if(zoneName) {
	    options.zoneID = { zoneName: zoneName };
	    if(ownerRecordName) {
		options.zoneID.ownerRecordName = ownerRecordName;
	    }
	}

	// Execute the query.
	return database.performQuery(query,options)
	    .then(function (response) {
		if(response.hasErrors) {
		    console.log(response.errors);
		    // Handle them in your app.
		    throw response.errors[0];

		} else {

		    var records = response.records;		    
		    callback(records);

		}
	    });
    }


    demoDeleteRecord(
	databaseScope,recordName,zoneName,ownerRecordName
    ) {
	var _this = this;
	var container = CloudKit.getDefaultContainer();
	var database = container.getDatabaseWithDatabaseScope(
	    CloudKit.DatabaseScope[databaseScope]
	);

	var zoneID,options;

	if(zoneName) {
	    zoneID = { zoneName: zoneName };
	    if(ownerRecordName) {
		zoneID.ownerRecordName = ownerRecordName;
	    }
	    options = { zoneID: zoneID };
	}

	return database.deleteRecords(recordName,options)
	    .then(function(response) {
		if(response.hasErrors) {

		    // Handle the errors in your app.
		    throw response.errors[0];

		} else {
		    var deletedRecord = response.records[0];

		    // Render the deleted record.
		    return _this.props.onStarRemoved(deletedRecord);
		}
	    });
    }

    
    saveRecord(re) {

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
	    _this.demoSaveRecords(databaseScope,recordName,recordChangeTag,recordType,zoneName,
				  forRecordName,forRecordChangeTag,publicPermission,ownerRecordName,
				  participants,parentRecordName,fields,createShortGUID);
	}

	if (recordName) {
	    database.fetchRecords(recordName,options)
		.then(function(response) {
		    if(response.hasErrors) {

			// Handle the errors in your app.
			throw response.errors[0];

		    } else {
			var record = response.records[0];
			doSave(record.recordChangeTag);
		    }
		});
	}
	else {
	    doSave();
	}
	

    }

    demoFetchRecord(
	databaseScope,recordName,zoneName,ownerRecordName, callback
    ) {
	var container = CloudKit.getDefaultContainer();
	var database = container.getDatabaseWithDatabaseScope(
	    CloudKit.DatabaseScope[databaseScope]
	);

	var zoneID,options;

	if(zoneName) {
	    zoneID = { zoneName: zoneName };
	    if(ownerRecordName) {
		zoneID.ownerRecordName = ownerRecordName;
	    }
	    options = { zoneID: zoneID };
	}

	return database.fetchRecords(recordName,options)
	    .then(function(response) {
		if(response.hasErrors) {

		    // Handle the errors in your app.
		    throw response.errors[0];

		} else {
		    var record = response.records[0];

		    // Render the fetched record.
		    callback(record);
		}
	    });
    }
    
    removeRecord(rn) {
	var databaseScope = "PRIVATE";
	var recordName = rn;
	var ownerRecordName = null;//re.zoneID.ownerRecordName;
	this.demoDeleteRecord(
	    databaseScope,recordName,zoneName,ownerRecordName
	);
    }

    
    loadStars() {

	var databaseScope = "PRIVATE";
	var ownerRecordName = null;
	var recordType = "Star";
	var desiredKeys = ["type", "location"];
//	var desiredKeys = ["title", "location", "note", "type", "url"];
	var sortByField = null;
	var ascending = null;
	var latitude = null;
	var longitude = null;
	var _this = this;

	this.demoPerformQuery(
	    databaseScope,zoneName,ownerRecordName,recordType,
	    desiredKeys,sortByField,ascending,latitude,longitude,[], function(records) {
		_this.props.onStarsLoad(records);
	    });

    }

    loadRecord(recordName, callback) {

	var databaseScope = "PRIVATE";
	var ownerRecordName = null;

	this.demoFetchRecord(
	    databaseScope,recordName,zoneName,ownerRecordName, callback
	);

    }

    loadTraces() {

	var databaseScope = "PRIVATE";
	var ownerRecordName = null;
	var recordType = "Trace";
	var desiredKeys = ["medium"];
	//var desiredKeys = ["title", "detail", 'type', 'averageSpeed', 'note', 'startDate', 'distance', 'duration', 'elevation'];
	var sortByField = null;
	var ascending = null;
	var latitude = null;
	var longitude = null;
	var _this = this;
	
	this.demoPerformQuery(
	    databaseScope,zoneName,ownerRecordName,recordType,
	    desiredKeys,sortByField,ascending,latitude,longitude,[], function(records) {
		_this.props.onTracesLoad(records);
	    });

    }

    
    constructor(props){
	super(props);
	this.demoSetUpAuth();
    }
    
    render() {
	return (<div>
		<div id='apple-sign-in-button'></div>
		<div id='apple-sign-out-button'></div>
		<div className='loadStarsButton'>
		<button onClick={this.loadStars}>Load</button>
		</div>
		</div>);
    }
    
}

export default CKComponent;
