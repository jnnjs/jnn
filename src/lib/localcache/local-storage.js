import Storage from './storage';

/**
 * The LocalCache Storage Engine of localStorage
 * @class
 */
export default class LocalStorage extends Storage {

    /**
     * set data into localStorage
     *
     * @override
     */
    set( key, data, options = {} ) {
        data = this.wrap( data, options );
        try {
            localStorage.setItem( this.name + key, JSON.stringify( data ) );
            return Promise.resolve( data );
        } catch( e ) {
            return Promise.reject( e );
        }
    }

    /**
     * get data from localStorage by it's key
     *
     * @override
     */
    get( key, options = {} ) {
        try {
            const data = JSON.parse( localStorage.getItem( this.name + key ) );
            if( !data ) return Promise.reject( new Error( 'Data not found' ) );

            if( this.validate( data, options ) === false ) {
                options.autodelete !== false && this.delete( key );
                return Promise.reject( new Error( 'Invalid data' ) );
            }
            return Promise.resolve( this.unwrap( data, 'persistent' ) );
        } catch( e ) {
            this.delete( key );
            return Promise.reject( e );
        }
    }

    /**
     * delete specified data from localStorage
     * 
     * @override
     */
    delete( key ) {
        localStorage.removeItem( this.name + key );
        return Promise.resolve();
    }

    /**
     * to delete all data from localStorage
     *
     * @override
     */
    clear() {
        localStorage.clear();
        return Promise.resolve();
    }

    /**
     * get all keys of data that stored in localStorage
     *
     * @override
     */
    keys() {
        const keys = [];
        const name = this.name;
        const l = this.name.length;

        for( let key in localStorage ) {
            /**
             * if the key of the item does not start with the prefix, skip this item.
             */
            if( key.indexOf( name ) ) continue;
            keys.push( key.substr( l ) );
        }

        return Promise.resolve( keys );
    }
}
