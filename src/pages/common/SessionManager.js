'strict';
import CloudDatastore from '../../datastore/CloudDatastore.js';

class SessionManager {

    static checkAuth() {
        CloudDatastore.login(function(user){
            SessionManager.setUserName(user.nameComponents.givenName + " " + user.nameComponents.familyName);
        });
    }

    static setUserName(val) {
        sessionStorage.setItem('userName', val);

    }

    static getUserName() {
        return sessionStorage.getItem('userName');
    }

}

export default SessionManager;
