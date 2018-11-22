import is from '../../util/is';
import Sequence from '../sequence';
import md5 from './md5';

/**
 * The basic class for LocalCache Storage Enginees.
 * @class
 */
export default class Storage {
    /**
     * @param {string} name - storage name
     */
    constructor( name ) {
        if( !name ) {
            throw new TypeError( `Expect a name for the storage, but a(n) ${name} is given.` );
        }

        this.name = `#JNN-STORAGE-V-1.0#${name}#`;

        /**
         * abstract methods
         * all classes which inherits from this class should 
         */
        const abstracts = [ 'set', 'get', 'delete', 'clear', 'keys' ];

        for( let method of abstracts ) {

            if( !is.function( this[ method ] ) ) {
                throw new TypeError( `The method "${method}" must be declared in every class extends from Cache` );
            }
        }
    }

    /**
     * To wrap the data with some properties for storage.
     *
     * @param {string|object} data - the data which will be stored. If it's not a string, it'll be converted to a string with JSON.stringify.
     * @param {object} [options] - options for formating data.
     * @param {string} [options.type=] - the type of data, such as js, css or any other types you want to set.
     * @param {string} [options.mime=text/plain] - the MIME type of the source
     * @param {number} [options.rank=50] - to specify a rank for the data.
     * @param {number} [options.lifetime=0] - lifetime of the data, 0 means forever.
     * @param {mixed} [options.extra] - any extra data that will be stored with the main data, and the extra data should be able to be JSON stringify.
     * @param {boolean} [options.md5=false] - denoting if calculating and storing the md5 value.
     * @param {boolean} [options.cookie=false] - denoting if the cookie value need to be stored.
     *
     * @return {object} the wrapped object.
     */
    wrap( data, options = {} ) {

        const input = Object.assign( {
            type : '',
            mime : '',
            rank : 50,
            ctime : +new Date,
            lifetime : 0
        }, options );

        /**
         * supports {json} and {string}
         */
        if( !is.string( data ) ) {
            input.fmt = 'json';
            data = JSON.stringify( data );
        } else {
            input.fmt = 'string';
        }

        input.data = data;

        if( options.extra ) {
            input.extra = JSON.stringify( options.extra );
        }

        if( options.md5 ) {
            input.md5 = md5( data );
        }

        if( options.cookie ) {
            input.cookie = md5( document.cookie );
        }

        return input;
    }

    /**
     * To validate if a data item is valid.
     *
     * @param {Object} data - the data got from storage
     * @param {Object} [options={}] - options
     * @param {string} [options.md5] - the md5 value of the data for checking equivalent.
     * @param {Function} [options.validate] - the customized validating function which will be executed at the end of the validation process. The function will get one argument which expresses the result of the validing process. To return a {boolean} value.
     *
     * @return {boolean} 
     */
    validate( data, options = {} ) {
        let result = true;

        if( data.lifetime && new Date - data.ctime >= data.lifetime ) {
            result = false;
        }  else if( data.cookie && data.cookie !== md5( document.cookie ) ) {
            result = false;
        }  else if( data.md5 && options.md5 ) {
            if( data.md5 !== options.md5 ) {
                result = false;
            } else if( md5( data.data ) !== options.md5 ) {
                // to calucate the MD5 value again, in case that the data is manipulated
                result = false;
            }
        }

        if( options.validate ) {
            return options.validate( data, result );
        }

        return result;
    }

    /**
     * To remove data which match the filter(check) function
     *
     * @param {Function} check - the checker which will be executed for each data item, returning a `true` means the data should be removed.
     *
     * @return {Promise} 
     */
    clean( check ) {
        return this.keys().then( keys => {
            const steps = []

            for( let key of keys ) {
                steps.push( () => {
                    return this.get( key ).then( data => {
                        if( check( data, key ) === true ) {
                            return this.delete( key );
                        }
                    } );
                } );
            }

            return Sequence.chain( steps ).then( results => {
                const removed = [];

                for( let result of results ) {
                    if( result.status === Sequence.FAILURE ) {
                        removed.push( keys[ result.index ] );
                    }
                }
                return removed;
            } );
        } );
    }

    /**
     * to unwrap(parse) the data
     */
    unwrap( data, storage ) {

        if( !storage ) {
            throw new TypeError( 'Storage type is required' );
        }

        try {
            if( data.fmt === 'json' ) {
                data.data = JSON.parse( data.data );
            }

            if( data.extra ) {
                data.extra = JSON.parse( data.extra );
            }
            data.storage = storage;
            return data;
        } catch( e ) {
            console.warn( e );
            return false;
        }
    }
}
