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
     * Set data
     *
     * @param {string} key
     * @param {Object|string} data
     * @param {Object} [options={}]
     */
    set( key, data, options = {} ) {
        data = this.wrap( data, options );
        this[ DATA ][ key ] = data;
        return Promise.resolve( data );
    }

    get( key, options = {} ) {
        const data = this[ DATA ][ key ];

        if( !data ) return Promise.reject();

        if( this.validate( data, options ) === false ) {
            options.autodelete !== false && this.delete( key );
            return Promise.reject();
        }

        return Promise.resolve( this.unwrap( data, 'page' ) );
    }

    delete( key ) {
        this[ DATA ][ key ] = null;
        delete this[ DATA ][ key ];
        return Promise.resolve();
    }

    keys() {
        return Promise.resolve( Object.keys( this[ DATA ] ) );
    }

    clear() {
        this[ DATA ] = {};
        return Promise.resolve();
    }
}
