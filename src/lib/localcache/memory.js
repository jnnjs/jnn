import Storage from './storage';

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
        this.data = {};
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
        this.data[ key ] = data;
        return Promise.resolve( data );
    }

    get( key, options = {} ) {
        const data = this.data[ key ];

        if( !data ) return Promise.reject();

        if( this.validate( data, options ) === false ) {
            options.autodelete !== false && this.delete( key );
            return Promise.reject();
        }

        return Promise.resolve( this.unwrap( data, 'page' ) );
    }

    delete( key ) {
        this.data[ key ] = null;
        delete this.data[ key ];
        return Promise.resolve();
    }

    keys() {
        return Promise.resolve( Object.keys( this.data ) );
    }

    clear() {
        this.data = {};
        return Promise.resolve();
    }
}
