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


CloudKit.getDefaultContainer().setUpAuth()
