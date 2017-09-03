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
	    apiToken: '5348da234d4dd6a9195d4a9ca9502acf0adb5edfb52c35d29fb4b3ff54eef17b',

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

var sharedZoneIDs = [];
var discoveredUserIdentities = {};

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
	    window.$("#apple-sign-in-button").hide();
	    window.$("#apple-sign-out-button").show();
	    
	    container
		.whenUserSignsOut()
		.then(gotoUnauthenticatedState);
	}
	function gotoUnauthenticatedState(error) {

	    if(error && error.ckErrorCode === 'AUTH_PERSIST_ERROR') {
		window.showDialogForPersistError();
	    }

	    window.$("#apple-sign-in-button").show();
	    window.$("#apple-sign-out-button").hide();

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
	participants,parentRecordName,fields,createShortGUID, callback
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
		    callback(response._results[0]);
		}
	    });
    }

    
    demoPerformQuery(
	databaseScope,zoneName,ownerRecordName,recordType,
	desiredKeys,sortByField,ascending,latitude,longitude,
	filters, continuationMarker, callback, finishCallback
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
	    resultsLimit: 100
	};

	if (continuationMarker != null) {
	    options.continuationMarker = continuationMarker;
	}

	if(zoneName) {
	    options.zoneID = { zoneName: zoneName };
	    if(ownerRecordName) {
		options.zoneID.ownerRecordName = ownerRecordName;
	    }
	}

	function handleResponse(response) {
	    if(response.hasErrors) {
		console.log(response.errors);
		// Handle them in your app.
		throw response.errors[0];

	    } else {

		var records = response.records;
		console.log('got ' + records.length + ' records');

		callback(records);
		if (response.moreComing) {
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
	return database.performQuery(query,options)
	    .then(handleResponse);
    }

    shareWithUI(trace) {

	var databaseScope = trace.share ? "SHARED" : "PRIVATE";
	let share = trace.share;
	var ownerRecordName = trace.created.userRecordName;
	
	if (share && ownerRecordName == window.userIdentity.userRecordName) {
	    databaseScope = "PRIVATE";
	}
	
	var recordName = trace.recordName;
	var createShortGUID = false;

	var shareTitle = "XXX";
	var supportedAccess = ["PUBLIC", 'PRIVATE'];
	var supportedPermissions = ["READ_ONLY"];

	this.demoShareWithUI(
	    databaseScope,recordName,zoneName,ownerRecordName,
	    shareTitle,supportedAccess,supportedPermissions
	) ;
	
    }
    
    demoShareWithUI(
	databaseScope,recordName,zoneName,ownerRecordName,
	shareTitle,supportedAccess,supportedPermissions
    ) {
	var container = CloudKit.getDefaultContainer();
	var database = container.getDatabaseWithDatabaseScope(
	    CloudKit.DatabaseScope[databaseScope]
	);

	var zoneID = { zoneName: zoneName };

	if(ownerRecordName) {
	    zoneID.ownerRecordName = ownerRecordName;
	}

	return database.shareWithUI({

	    record: {
		recordName: recordName
	    },
	    zoneID: zoneID,
	    
	    shareTitle: shareTitle,

	    supportedAccess: supportedAccess,

	    supportedPermissions: supportedPermissions

	}).then(function(response) {
	    if(response.hasErrors) {

		// Handle the errors in your app.
		throw response.errors[0];

	    } else {

//		return renderShareResponse(response);
	    }
	});
    }


    demoDeleteRecord(
	databaseScope,recordName,zoneName,ownerRecordName, callback
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

		    callback(deletedRecord);

		}
	    });
    }

    
    saveRecord(re, callback) {

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
				  participants,parentRecordName,fields,createShortGUID, callback);
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

    demoFetchDatabaseChanges(databaseScope,syncToken) {
	var container = CloudKit.getDefaultContainer();
	var database = container.getDatabaseWithDatabaseScope(
	    CloudKit.DatabaseScope[databaseScope]
	);

	let _this = this;
	
	var opts = {

	    // Limit to 5 results.
	    resultsLimit: 5
	};

	if(syncToken) {
	    opts.syncToken = syncToken;
	}

	return database.fetchDatabaseChanges(opts).then(function(response) {

	    if(response.hasErrors) {

		// Handle the errors.
		throw response.errors[0];

	    } else {

		var newSyncToken = response.syncToken;
		var zones = response.zones;
		var moreComing = response.moreComing;

		for (var it in zones) {

		    let zoneId = zones[it].zoneID;
		    //_this.demoFetchRecordZoneChanges("SHARED", zoneId.zoneName, zoneId.ownerRecordName, '');

		    sharedZoneIDs.push(zoneId);
		}

		_this.refreshTrace();

	    }
	});
    }


    demoDiscoverAllUserIdentities() {
	var container = CloudKit.getDefaultContainer();

	return container.discoverAllUserIdentities().then(function(response) {
	    if(response.hasErrors) {

		// Handle the errors in your app.
		throw response.errors[0];

	    } else {
		let users = response.users;

		for (var it in users) {
		    discoveredUserIdentities[users[it].userRecordName] = users[it].nameComponents;
		}
		// response.users is an array of UserIdentity objects.
		//return renderUserIdentities(title, response.users);

	    }
	});
    }

    demoDiscoverUserIdentityWithUserRecordName(userRecordName) {
	var container = CloudKit.getDefaultContainer();

	return container.discoverUserIdentityWithUserRecordName(userRecordName)
	    .then(function(response) {

		console.log('xxxxx');

		console.log(response);
		if(response.hasErrors) {

		    // Handle the errors in your app.
		    throw response.errors[0];

		} else {
		    var title = 'Discovered users by record name:';

		    //return renderUserIdentity(title, response.users[0]);
		}
	    });
    }

    fetchDBChanges() {
	this.demoFetchDatabaseChanges("SHARED", "");
    }

    demoFetchRecordZoneChanges(
	databaseScope,zoneName,ownerRecordName,syncToken
    ) {
	var container = CloudKit.getDefaultContainer();
	var database = container.getDatabaseWithDatabaseScope(
	    CloudKit.DatabaseScope[databaseScope]
	);

	var zoneID = { zoneName: zoneName };

	if(ownerRecordName) {
	    zoneID.ownerRecordName = ownerRecordName;
	}

	var args = {
	    zoneID: zoneID,

	    // Limit to 5 results.
	    resultsLimit: 5
	};

	if(syncToken) {
	    args.syncToken = syncToken;
	}

	return database.fetchRecordZoneChanges(args).then(function(response) {
	    if(response.hasErrors) {

		console.log('----------- errro');

		// Handle the errors.
		throw response.errors[0];

	    } else {
		var zonesResponse = response.zones[0];
		var newSyncToken = zonesResponse.syncToken;
		var records = zonesResponse.records;
		var moreComing = zonesResponse.moreComing;

		console.log('-------');
		console.log(records);
/*		return renderRecords(
		    databaseScope,
		    zoneName,
		    ownerRecordName,
		    records,
		    newSyncToken,
		    moreComing
		);*/
	    }
	});
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
    
    removeRecord(rn, callback) {
	var databaseScope = "PRIVATE";
	var recordName = rn;
	var ownerRecordName = null;//re.zoneID.ownerRecordName;
	this.demoDeleteRecord(
	    databaseScope,recordName,zoneName,ownerRecordName, callback
	);
    }

    
    loadStars() {

	var databaseScope = "PRIVATE";
	var ownerRecordName = null;
	var recordType = "Star";
	var desiredKeys = ["type", "location"];
	var sortByField = null;
	var ascending = null;
	var latitude = null;
	var longitude = null;
	var _this = this;

	this.demoPerformQuery(
	    databaseScope,zoneName,ownerRecordName,recordType,
	    desiredKeys,sortByField,ascending,latitude,longitude,[], null, function(records) {
		_this.props.onStarsLoad(records);
	    });

    }

    loadRecord(recordName, share, callback) {

	var databaseScope = share ? "SHARED" : "PRIVATE";
	var ownerRecordName = share ? share.zoneID.ownerRecordName : null;

	if (share && ownerRecordName == window.userIdentity.userRecordName) {
	    databaseScope = "PRIVATE";
	}
	
	this.demoFetchRecord(
	    databaseScope,recordName,zoneName,ownerRecordName, callback
	);

    }

    refreshTrace() {
	let box = this.lastBox;
	console.log(box);
	this.loadTraces(box[0], box[1], box[2], box[3], this.lastLoadDetail, this.lastFinishCallback);
	
    }
    
    loadTraces(maxLat, maxLng, minLat, minLng, loadDetail, finishCallback) {

	this.lastBox = [maxLat, maxLng, minLat, minLng];
	this.lastLoadDetail = loadDetail;
	this.lastFinishCallback = finishCallback;
	
	var databaseScope = "PRIVATE";
	var databaseSharedScope = "SHARED";
	var ownerRecordName = null;
	var recordType = "Trace";
	var desiredKeys = [loadDetail?"detail":"medium", 'type'];
	var sortByField = null;
	var ascending = null;
	var latitude = null;
	var longitude = null;
	var _this = this;

	maxLat = parseInt(maxLat * 1000000);
	maxLng = parseInt(maxLng * 1000000);
	minLat = parseInt(minLat * 1000000);
	minLng = parseInt(minLng * 1000000);

	let gt = 'GREATER_THAN';
	let lt = 'LESS_THAN';
	
	var filters = [
	    { fieldName: 'maxLat', comparator: gt, fieldValue: minLat },
	    { fieldName: 'maxLng', comparator: gt, fieldValue: minLng },
	    { fieldName: 'minLat', comparator: lt, fieldValue: maxLat },
	    { fieldName: 'minLng', comparator: lt, fieldValue: maxLng }
	];

	// private database
	this.demoPerformQuery(
	    databaseScope,zoneName,ownerRecordName,recordType,
	    desiredKeys,sortByField,ascending,latitude,longitude,filters, null, function(records) {
		_this.props.onTracesLoad(records);
	    }, function() {
		finishCallback();
	    });

	// shared database

	databaseScope = databaseSharedScope;
	
	for (var i = 0; i < sharedZoneIDs.length; i++) {

	    ownerRecordName = sharedZoneIDs[i].ownerRecordName;
	    
	    this.demoPerformQuery(
		databaseScope,zoneName,ownerRecordName,recordType,
		desiredKeys,sortByField,ascending,latitude,longitude,filters, null, function(records) {
		    _this.props.onTracesLoad(records);
		}, function() {
		    finishCallback();
		});

	}

	
    }

    getUserNameByRecordName(userRecordName) {

	if (userRecordName == window.userIdentity.userRecordName) {
	    return "Me";
	}

	let userRecord = discoveredUserIdentities[userRecordName];
	return userRecord ? userRecord.givenName + " " + userRecord.familyName : userRecordName;
    }

    
    constructor(props){
	super(props);
	this.demoSetUpAuth();
    }
    
    render() {
	return (<div>
		<div id='apple-sign-in-button'></div>
		<div id='apple-sign-out-button'></div>
		</div>);
    }
    
}

export default CKComponent;
