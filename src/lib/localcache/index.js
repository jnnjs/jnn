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
     * @param {Object} [options={}]
     * @param {Object} [options.page]
     * @param {Object} [options.persistent]
     * @param {Object} [options.session]
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
            return Promise.reject( new TypeError( `You must specify at least one storage mode in [${LocalCache.STORAGES.join(', ')}]` ) );
        }

        return Sequence.all( steps ).then( () => data );
    }

    /**
     * getting data from certain modes
     *
     * @param {string} key
     * @param {Array|string} modes
     */
    get( key, modes, options = {} ) {

        /**
         * to seek in all storage engines by default.
         */
        if( is.object( modes ) ) {
            modes = LocalCache.STORAGES;
            options = modes;
        }

        modes || ( modes = LocalCache.STORAGES );

        Array.isArray( modes ) || ( modes = [ modes ] );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                return Promise.reject( new TypeError( `Unexcepted storage mode "${mode}", excepted one of: ${LocalCache.STORAGES.join( ', ' )}` ) );
            }
            steps.push( () => this[ mode ].get( key, options ) );
        }

        return Sequence.any( steps ).then( r => r[ r.length - 1 ].value );
    }

    /**
     * deleting data from certain storage engines
     *
     * @param {string} key
     * @param {string|array} modes
     */
    delete( key, modes ) {
        modes || ( modes = LocalCache.STORAGES );
        Array.isArray( modes ) || ( modes = [ modes ] );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                return Promise.reject( new TypeError( `Unexcepted mode "${mode}", excepted one of: ${LocalCache.STORAGES.join( ', ' )}` ) );
            }
            steps.push( () => this[ mode ].delete( key ) );
        }
        return Sequence.all( steps );
    }

    /**
     * removing all data in certain engines
     *
     * @param {string|Array} modes
     */
    clear( modes ) {
        modes || ( modes = LocalCache.STORAGES );
        Array.isArray( modes ) || ( modes = [ modes ] );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                return Promise.reject( new TypeError( `Unexcepted mode "${mode}", excepted one of: ${LocalCache.STORAGES.join( ', ' )}` ) );
            }
            steps.push( () => this[ mode ].clear() );
        }

        return Sequence.all( steps );
    }

    /**
     * to clean all data that stored by removing useless.
     *
     * @param {Object} [options={}]
     * @param {number} [options.rank]
     * @param {number|Array} [options.length] - a number or a section for denoting removing datas which have content length match the specified length.
     * @param {number} [options.ctime]
     * @param {string} [options.type]
     * @param {Function} [options.filter]
     */
    clean( options = {} ) {
        /**
         * the function for filtering the data with specified options.
         */
        const filter = ( data, key ) => {
            let remove = false;

            let { rank, length, ctime, type } = options;

            /**
             * removing all data whose rank little than the specified rank.
             */
            if( !is.undefined( rank ) && data.rank < rank ) {
                remove = true;
            }

            /**
             * to filter data by the content length
             */
            if( !remove && !is.undefined( length ) ) {
                const content = data.data;
                if( Array.isArray( length ) ) {
                    // if the specified length is a section, such as [ 0, 100 ]
                    if( content.length >= length[ 0 ] && content.length <= length[ 1 ] ) {
                        remove = true;
                    }
                } else if( content.length >= length ) {
                    remove = true;
                }
            }

            /**
             * to filter data by creation time
             */
            if( !remove && !is.undefined( ctime ) ) {
                if( Array.isArray( ctime ) ) {
                    if( data.ctime > ctime[ 0 ] && data.ctime < ctime[ 1 ] ) {
                        remove = true;
                    }
                } else if( data.ctime < +ctime ) {
                    remove = true;
                }
            }

            if( !remove ) {
                Array.isArray( type ) || ( type = [ type ] );
                if( type.indexOf( data.type ) > -1 ) {
                    remove = true;
                }
            }

            if( !remove && is.function( options.filter ) && options.filter( data, key ) === false ) {
                remove = true;
            }
            return remove;
        };

        const steps = [];

        for( let mode of LocalCache.STORAGES ) {
            steps.push( this[ mode ].clean( filter ) );
        }
        return Promise.all( steps );
    }
}

LocalCache.STORAGES = [ 'page', 'session', 'persistent' ];

export default LocalCache;
