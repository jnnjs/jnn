import Storage from './storage';

export default class IDB extends Storage {
    constructor( name ) {
        super( name );

        this.idb = null;

        this.ready = this.open().then( () => {
            this.idb.onerror = e => {
                console.warn( 'IDB Error', e );
            };
            return this.idb;
        } );

    }

    open() {

        const request = window.indexedDB.open( this.name );

        return new Promise( ( resolve, reject ) => {

            request.onsuccess = e => {
                this.idb = e.target.result;
                resolve( e );
            };

            request.onerror = e => {
                reject( e );
            };

            request.onupgradeneeded = e => {
                this.onupgradeneeded( e );
            };
        } );
    }

    onupgradeneeded( e ) {
        const os = e.target.result.createObjectStore( 'storage', {
            keyPath : 'key'
        } );

        os.createIndex( 'key', 'key', { unique : true } );
        os.createIndex( 'data', 'data', { unique : false } );
        os.createIndex( 'type', 'type', { unique : false } );
        os.createIndex( 'string', 'string', { unique : false } );
        os.createIndex( 'ctime', 'ctime', { unique : false } );
        os.createIndex( 'md5', 'md5', { unique : false } );
        os.createIndex( 'lifetime', 'lifetime', { unique : false } );
        os.createIndex( 'cookie', 'cookie', { unique : false } );
        os.createIndex( 'priority', 'priority', { unique : false } );
        os.createIndex( 'extra', 'extra', { unique : false } );
        os.createIndex( 'mime', 'mime', { unique : false } );
    }

    store( write = false ) {
        return this.idb.transaction( [ 'storage' ], write ? 'readwrite' : 'readonly' ).objectStore( 'storage' );
    }

    set( key, data, options = {} ) {

        data = this.format( data, options );

        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store( true );
                // don't manipulate the origin data
                const request = store.put( Object.assign( { key }, data ) );

                request.onsuccess = () => {
                    resolve( data );
                };

                request.onerror = e => {
                    reject( e );
                };
            } );
        } );
    }

    delete( key ) {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store( true );
                const request = store.delete( key );

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = e => {
                    reject( e );
                };
            } );
        } );
    }

    get( key, options = {} ) {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store();
                const request = store.get( key );

                request.onsuccess = () => {
                    const data = request.result;
                    if( !data ) {
                        return reject();
                    }

                    if( this.validate( data, options ) === false ) {
                        options.autodelete !== false && this.delete( key ); 
                        return reject();
                    }
                    delete data.key;
                    resolve( this.output( data, 'persistent' ) );
                };

                request.onerror = e => {
                    reject( e );
                };
                
            } );
        } );
    }

    clear() {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store( true );
                const request = store.clear();

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = e => {
                    reject( e );
                };
            } );
        } );
    }

    keys() {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store();

                if( store.getAllKeys ) {
                    const request = store.getAllKeys();

                    request.onsuccess = () => {
                        resolve( request.result );
                    };

                    request.onerror = () => {
                        reject();
                    };
                } else {
                    try {
                        const request = store.openCursor();
                        const keys = [];

                        request.onsuccess = () => {
                            const cursor = request.result;

                            if( !cursor ) {
                                resolve( keys );
                                return;
                            }

                            keys.push( cursor.key );
                            cursor.continue();
                        };
                    } catch( e ) {
                        reject( e );
                    }
                }
            } );
        } );
    }
}
