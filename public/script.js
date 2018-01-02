"use strict";

var IS_DEV = true;

var apiToken = "9a1954490c6dcee9fe5d3c952d609e722c27017be3400c39b6e1033aed2a38dc";
var environment = "production";

if (IS_DEV) {
    apiToken = "33d1b5c507d11c053a816e42186299c750e44eef6e17f7dc09de03c95995e2bd";
    environment = "development";
}


CloudKit.configure({
    locale: 'en-us',

    containers: [{

	// Change this to a container identifier you own.
	containerIdentifier: 'iCloud.fr.tsingtsai.Traces',

	apiTokenAuth: {
	    // And generate a web token through CloudKit Dashboard.
	    apiToken: apiToken,
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
	environment: environment
    }]
});

function gotoAuthenticatedState(userIdentity) {
    var name = userIdentity.nameComponents;
    if(name) {
	$(".cover-heading").text('Welcome, ' + name.givenName);    
    } else {
	$(".cover-heading").text('Welcome!');
    }
    $("#comment").html("You can visit your map now. <br /><a href='/'>Go to trace map</a>");
}

function gotoUnauthenticatedState(error) {

    if(error && error.ckErrorCode === 'AUTH_PERSIST_ERROR') {
	window.showDialogForPersistError();
    }

    $("#comment").html("All your data is saved in Apple's iCloud. You are the only one who have access to your data. For more information, visit <a href='https://www.apple.com/icloud/'>iCloud intro page</a>.");
}

CloudKit.getDefaultContainer()
    .whenUserSignsIn()
    .then(gotoAuthenticatedState)
    .catch(gotoUnauthenticatedState);

CloudKit.getDefaultContainer().setUpAuth().then(function(userIdentity) {
    if(userIdentity) {
	gotoAuthenticatedState(userIdentity);
    } else {
	gotoUnauthenticatedState();
    }
});
