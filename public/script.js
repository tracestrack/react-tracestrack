"use strict";


CloudKit.configure({
    locale: 'en-us',

    containers: [{

	// Change this to a container identifier you own.
	containerIdentifier: 'iCloud.fr.tsingtsai.Traces',

	apiTokenAuth: {
	    // And generate a web token through CloudKit Dashboard.
	    apiToken: '9a1954490c6dcee9fe5d3c952d609e722c27017be3400c39b6e1033aed2a38dc',
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
	environment: 'production'
	//environment: 'development'
    }]
});

function gotoAuthenticatedState(userIdentity) {
    var name = userIdentity.nameComponents;
    if(name) {
	$(".cover-heading").text('Welcome, ' + name.givenName);    
    } else {
	displayUserName('Welcome, user ' + userIdentity.userRecordName);
    }
    $("#comment").text("You can visit your map now.");
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
