import is from '../util/is';
import Sequence from '../util/sequence';

import md5 from './md5';

export default class Storage {
    constructor( name ) {
        if( !name ) {
            throw new TypeError( `Expect a name for the storage, but a(n) ${name} is given.` );
        }

        this.name = `#LC-STORAGE-V-1.0#${name}#`;

        const abstracts = [ 'set', 'get', 'delete', 'clear', 'keys' ];

        for( let method of abstracts ) {

            if( !is.function( this[ method ] ) ) {
                throw new TypeError( `The method "${method}" must be declared in every class extends from Cache` );
            }
        }
    }

    format( data, options = {} ) {
        let string = true;
        if( !is.string( data ) ) {
            string = false;
            data = JSON.stringify( data );
        }

        const input = {
            data,
            type : options.type || 'localcache',
            mime : options.mime || 'text/plain',
            string,
            priority : options.priority === undefined ? 50 : options.priority,
            ctime : options.ctime || +new Date,
            lifetime : options.lifetime || 0
        };

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

    validate( data, options = {} ) {
        let result = true;

        if( data.lifetime ) {
            if( new Date - data.ctime >= data.lifetime ) {
                result = false;
            }
        } 
        
        if( data.cookie ) {
            if( data.cookie !== md5( document.cookie ) ) {
                result = false;
            }
        } 
        
        if( data.md5 && options.md5 ) {
            if( data.md5 !== options.md5 ) {
                result = false;
            }
            if( md5( data.data ) !== options.md5 ) {
                result = false;
            }
        }

        if( options.validate ) {
            return options.validate( data, result );
        }

        return result;
    }

    clean( check ) {
        return this.keys().then( keys => {
            const steps = []

            for( let key of keys ) {
                steps.push( () => {
                    return this.get( key ).then( data => {
                        if( check( data, key ) === true ) {
                            return this.delete( key );
                        }
                    } )
                } );
            }

            return Sequence.chain( steps ).then( results => {
                const removed = [];

                for( let result of results ) {

                    if( result.status === Sequence.FAILED ) {
                        removed.push( keys[ result.index ] );
                    }
                }

                return removed;
            } );
        } );
    }

    output( data, storage ) {

        if( !storage ) {
            console.error( 'Storage type is required.' );
        }

        if( !data.string ) {
            data.data = JSON.parse( data.data );
        }

        if( data.extra ) {
            data.extra = JSON.parse( data.extra );
        }

        data.storage = storage;

        return data;
    }
}
