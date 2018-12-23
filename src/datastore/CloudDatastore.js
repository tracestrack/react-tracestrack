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
  construct() {
    
  }

  static login() {

    let container = CloudKit.getDefaultContainer();

    return {
      done(cb) {
        container.setUpAuth()
          .then(function(userIdentity) {
            if (userIdentity) {

            } else {

            }
          });

        cb();
      }
    };
  }

  
  
}
