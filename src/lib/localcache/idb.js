import Storage from './storage';

const OBJECT_STORE = 'storage';
const DB_VERSION =1;

/**
 * The LocalCache Storage Engine of IndexedDB
 * @class
 */
export default class IDB extends Storage {
    constructor( name ) {
        super( name );
        this.idb = null;
        /**
         * @todo to maintain the version number in config file
         */
        this.ready = this.open( this.name, DB_VERSION ).then( idb => {
            return this.idb = idb;
        } ).catch( e => {
            console.warn( e );
        } );

        this.ready.then( idb => {
            idb.onerror = e => {
                console.warn( e );
            };
        } );
    }

    /**
     * to request openning a connection to IndexedDB.
     *
     * @param {string} name - name of database
     * @param {Integer} [version=1] - version number of the database.
     *
     * @param {Promise<ReqestResult, InvalidStateError>}
     */
    open( name, version = 1 ) {
        const idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        if( !idb ) return Promise.reject( new Error( 'IndexedDB is not supported' ) );

        /**
         * to request openning a connection to the database
         */
        const request = idb.open( name, version );

        return new Promise( ( resolve, reject ) => {

            request.addEventListener( 'success', () => {
                resolve( request.result );
            } );

            request.addEventListener( 'error', e => {
                reject( e );
            } );

            request.addEventListener( 'upgradeneeded', e => {
                this.onupgradeneeded( e )
            } );
        } );
    }

    /**
     * the event handler for the event upgradeneeded of IDBOpenDBRequest
     *
     * @param {IDBVersionChangeEvent} e - the IDBVersionChangeEvent object.
     *
     * @return 
     */
    onupgradeneeded( e ) {
        const os = e.target.result.createObjectStore( OBJECT_STORE, { keyPath : 'key' } );

        os.createIndex( 'key', 'key', { unique : true } );
        os.createIndex( 'data', 'data', { unique : false } );
        os.createIndex( 'type', 'type', { unique : false } );
        os.createIndex( 'mime', 'mime', { unique : false } );
        os.createIndex( 'fmt', 'fmt', { unique : false } );
        os.createIndex( 'ctime', 'ctime', { unique : false } );
        os.createIndex( 'rank', 'rank', { unique : false } );
        os.createIndex( 'lifetime', 'lifetime', { unique : false } );
        os.createIndex( 'md5', 'md5', { unique : false } );
        os.createIndex( 'cookie', 'cookie', { unique : false } );
        os.createIndex( 'extra', 'extra', { unique : false } );
    }

    /**
     * to create a transaction and return the store of the transaction
     */
    store( write = false ) {
        return this.idb.transaction( [ OBJECT_STORE ], write ? 'readwrite' : 'readonly' ).objectStore( OBJECT_STORE );
    }

    /**
     * set data into indexedDB
     *
     * @override
     */
    set( key, data, options = {} ) {
        data = this.wrap( data, options );

        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store( true );
                // don't manipulate the origin data
                const request = store.put( Object.assign( { key }, data ) );
                request.addEventListener( 'success', () => resolve( data ) );
                request.addEventListener( 'error', reject );
            } );
        } );
    }

    /**
     * delete data from indexedDB
     *
     * @override
     */
    delete( key ) {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store( true );
                const request = store.delete( key );
                request.addEventListener( 'success', () => resolve() );
                request.addEventListener( 'error', reject );
            } );
        } );
    }

    /**
     * get data from indexedDB
     *
     * @override
     */
    get( key, options = {} ) {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store();
                const request = store.get( key );
                request.addEventListener( 'success', () => {
                    const data = request.result;
                    if( !data ) return reject( new Error( 'Data not found' ) );

                    if( this.validate( data, options ) === false ) {
                        options.autodelete !== false && this.delete( key ); 
                        return reject( new Error( 'Invalid data' ) );
                    }
                    delete data.key;
                    resolve( this.unwrap( data, 'persistent' ) );
                } );
                request.addEventListener( 'error', reject );
            } );
        } );
    }

    /**
     * deleting all data from indexedDB
     *
     * @override
     */
    clear() {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store( true );
                const request = store.clear();
                request.addEventListener( 'success', () => resolve() );
                request.addEventListener( 'error', reject );
            } );
        } );
    }

    /**
     * getting all keys in indexedDB
     *
     * @override
     */
    keys() {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store();

                if( store.getAllKeys ) {
                    const request = store.getAllKeys();
                    request.addEventListener( 'success', () => { 
                        resolve( request.result );
                    } );
                    request.addEventListener( 'error', reject );
                } else {
                    const keys = [];
                    const request = store.openCursor();
                    request.addEventListener( 'success', () => {
                        const cursor = request.result;
                        if( !cursor ) return resolve( keys );
                        keys.push( cursor.key );
                        cursor.continue();
                    } );
                }
            } );
        } );
    }

    static isSupported() {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    }
}
