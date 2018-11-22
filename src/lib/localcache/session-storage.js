import Storage from './storage';

/**
 * The LocalCache Storage Engine of SessionStorage
 * @class
 */
export default class SessionStorage extends Storage {

    /**
     * set data into sessionStorage
     *
     * @param {string} key - the key of the data.
     * @param {string|object} data - the data which will be stored.
     * @param {object} [options={}] - the options for storing, same as the options for Storage.prototype.wrap function.
     *
     * @return {Promise<string|object, Error>}
     */
    set( key, data, options = {} ) {
        data = this.wrap( data, options );
        try {
            sessionStorage.setItem( this.name + key, JSON.stringify( data ) );
            return Promise.resolve( data );
        } catch( e ) {
            return Promise.reject( e );
        }
    }

    /**
     * get data from sessionStorage by it's key
     *
     * @param {string} key - the key of the data
     * @param {object} [options={}] - options for getting data, such as validation options.
     * @param {boolean} [options.autodelete] - denoting if to delete the data if the data exists but it's invalid.
     * @param {string} [options.md5] - the md5 value for validation, to see more information in Storage.prototype.validate.
     * @param {Function} [options.validate] - function for validation, to see more information in Storage.prototype.validate.
     *
     * @return {Promise<mixed>}
     */
    get( key, options = {} ) {
        try {
            const data = JSON.parse( sessionStorage.getItem( this.name + key ) );
            if( !data ) return Promise.reject( new Error( 'Not Found' ) );

            if( this.validate( data, options ) === false ) {
                options.autodelete !== false && this.delete( key );
                return Promise.reject( new Error( 'Invalid Data' ) );
            }
            return Promise.resolve( this.unwrap( data, 'session' ) );
        } catch( e ) {
            this.delete( key );
            return Promise.reject( e );
        }
    }

    /**
     * delete specified data from sessionStorage
     *
     * @param {string} key - the key of the data.
     *
     * @return {Promise<undefined>}
     */
    delete( key ) {
        sessionStorage.removeItem( this.name + key );
        return Promise.resolve();
    }

    /**
     * to delete all data from localStorage
     *
     * @return {Promise<undefined>}
     */
    clear() {
        sessionStorage.clear();
        return Promise.resolve();
    }

    /**
     * get all keys of data that stored in localStorage
     *
     * @return {Promise<string[]>} Promise object with the full list of keys.
     */
    keys() {
        const keys = [];
        const name = this.name;
        const l = this.name.length;

        for( let key in sessionStorage ) {
            if( key.indexOf( name ) ) continue;
            keys.push( key.substr( l ) );
        }

        return Promise.resolve( keys );
    }
}
