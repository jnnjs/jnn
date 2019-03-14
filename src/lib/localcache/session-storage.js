import Storage from './storage';

/**
 * The LocalCache Storage Engine of SessionStorage
 * @class
 */
export default class SessionStorage extends Storage {

    /**
     * set data into sessionStorage
     *
     * @override
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
     * get data from sessionStorage
     * 
     * @override
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
     * @override
     */
    delete( key ) {
        sessionStorage.removeItem( this.name + key );
        return Promise.resolve();
    }

    /**
     * to delete all data from localStorage
     *
     * @override
     */
    clear() {
        sessionStorage.clear();
        return Promise.resolve();
    }

    /**
     * get all keys of data that stored in localStorage
     * @override
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
