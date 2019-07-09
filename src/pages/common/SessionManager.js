'strict';
import CloudDatastore from '../../datastore/CloudDatastore.js';

/**
SessionManager takes care of logging into iCloud and maintains states.
*/

class SessionManager {

    static isLogin = false;
    static checkAuth() {
        if (SessionManager.isLogin === false) {
            return new Promise((resolve, reject) => {
                CloudDatastore.login(function(user){
                    if (user !== null) {
                        SessionManager.setUserName(user.nameComponents.givenName + " " + user.nameComponents.familyName);
                        SessionManager.isLogin = true;
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
            });
        }
        else {
            return new Promise((resolve, reject) => {
                resolve(true);
            });
        }
    }

    static setUserName(val) {
        sessionStorage.setItem('userName', val);

    }

    static getUserName() {
        return sessionStorage.getItem('userName');
    }

}

export default SessionManager;
