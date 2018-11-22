import Sequence from '../sequence';
import is from '../../util/is';
import Memory from './memory';
import SessionStorage from './session-storage';
import Persistent from './persistent';

/**
 * Create a LocalCache instance.
 * @class
 */
class LocalCache {
    /**
     * @param {string} name - The name of the storage
     */
    constructor( name ) {
        if( !name ) {
            throw new TypeError( 'Expect a name for your storage.' );
        }

        this.page = new Memory( name );
        this.session = new SessionStorage( name );
        this.persistent = new Persistent( name );

        this.clean();
    }

    /**
     * To set data into storage with specified level(s)
     *
     * @param {string} key - The key of the data.
     * @param {mixed} data - Data content.
     * @param {Object} options
     */
    set( key, data, options = {} ) {

        const steps = [];

        for( let mode of LocalCache.STORAGES ) {
            if( !options[ mode ] ) continue;

            let opts = options[ mode ];

            if( opts === false ) continue;

            if( !is.object( opts ) ) {
                opts = {};
            }

            if( !is.undefined( options.type ) ) {
                opts.type = options.type;
            }

            if( !is.undefined( options.extra ) ) {
                opts.extra = options.extra;
            }

            if( !is.undefined( options.mime ) ) {
                opts.mime = options.mime;
            }
            
            steps.push( () => this[ mode ].set( key, data, opts ) );
        }

        if( !steps.length ) {
            throw new TypeError( `You must specify at least one storage mode in [${LocalCache.STORAGES.join(', ')}]` );
        }

        return Sequence.all( steps ).then( () => data );
    }

    get( key, modes, options = {} ) {

        if( is.object( modes ) ) {
            modes = LocalCache.STORAGES;
            options = modes;
        }

        modes || ( modes = LocalCache.STORAGES );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                throw new TypeError( `Unexcepted storage mode "${mode}", excepted one of: ${LocalCache.STORAGES.join( ', ' )}` );
            }
            steps.push( () => this[ mode ].get( key, options ) );
        }

        return Sequence.any( steps ).then( results => {
            const result = results[ results.length - 1 ];
            const value = result.value;

            let store = false;

            for( const item of LocalCache.STORAGES ) {
                if( options[ item ] && item !== value.storage ) {
                    store = true;
                }
            }

            if( !store ) return value;

            const opts = Object.assign( value, options, {
                [ value.storage ] : false
            } );

            return this.set( key, value.data, opts ).then( () => value );
        } );
    }

    delete( key, modes ) {
        modes || ( modes = LocalCache.STORAGES );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                throw new TypeError( `Unexcepted mode "${mode}", excepted one of: ${LocalCache.STORAGES.join( ', ' )}` );
            }
            steps.push( () => this[ mode ].delete( key ) );
        }
        return Sequence.all( steps );
    }

    clear( modes ) {
        modes || ( modes = LocalCache.STORAGES );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                throw new TypeError( `Unexcepted mode "${mode}", excepted one of: ${LocalCache.STORAGES.join( ', ' )}` );
            }
            steps.push( () => this[ mode ].clear() );
        }

        return Sequence.all( steps );
    }

    clean( options = {} ) {
        const check = ( data, key ) => {
            let remove = false;

            const { rank, length, ctime, type } = options;

            if( !is.undefined( rank ) ) {
                if( data.rank < rank ) {
                    remove = true;
                }
            }

            if( !remove && !is.undefined( length ) ) {
                const content = data.data;
                if( is.number( length ) ) {
                    if( content.length >= length ) {
                        remove = true;
                    }
                } else if( Array.isArray( length ) ) {
                    if( content.length >= length[ 0 ] && content.length <= length[ 1 ] ) {
                        remove = true;
                    }
                }
            }

            if( !remove && !is.undefined( ctime ) ) {
                if( is.date( ctime ) || is.number( ctime ) ) {
                    if( data.ctime < +ctime ) {
                        remove = true;
                    }
                } else if( Array.isArray( ctime ) ) {
                    if( data.ctime > ctime[ 0 ] && data.ctime < ctime[ 1 ] ) {
                        remove = true;
                    }
                }
            }

            if( !remove ) {
                if( Array.isArray( type ) ) {
                    if( type.indexOf( data.type ) > -1 ) {
                        remove = true;
                    }
                } else if( type == data.type ) {
                    remove = true;
                }
            }

            if( !remove && is.function( options.remove ) ) {
                if( options.remove( data, key ) === true ) {
                    remove = true;
                }
            }

            return remove;
        };

        const steps = [];

        for( let mode of LocalCache.STORAGES ) {
            steps.push( this[ mode ].clean( check ) );
        }
        return Promise.all( steps );
    }
}

LocalCache.STORAGES = [ 'page', 'session', 'persistent' ];

export default LocalCache;
