import Storage from './storage';

const DATA = Symbol( 'memory#data' );

/**
 * To create a Memory storage engine for LocalCache.
 * @class
 * @extends Storage
 */
export default class Memory extends Storage {
    /**
     * @param {string} name - Storage name
     */
    constructor( name ) {
        super( name );
        this[ DATA ] = {};
    }

    /**
     * Set data into memory
     *
     * @override
     */
    set( key, data, options = {} ) {
        data = this.wrap( data, options );
        this[ DATA ][ key ] = data;
        return Promise.resolve( data );
    }

    /**
     * get data from memory by the key.
     *
     * @override
     */
    get( key, options = {} ) {
        const data = this[ DATA ][ key ];

        if( !data ) return Promise.reject( new Error( 'Not Found' ) );

        if( this.validate( data, options ) === false ) {
            options.autodelete !== false && this.delete( key );
            return Promise.reject( new Error( 'Invalid Data' ) );
        }

        return Promise.resolve( this.unwrap( data, 'page' ) );
    }

    /**
     * delete data with the key from memeory
     *
     * @override
     */
    delete( key ) {
        this[ DATA ][ key ] = null;
        delete this[ DATA ][ key ];
        return Promise.resolve();
    }

    /**
     * @override
     */
    keys() {
        return Promise.resolve( Object.keys( this[ DATA ] ) );
    }

    /**
     * @override
     */
    clear() {
        this[ DATA ] = {};
        return Promise.resolve();
    }
}
