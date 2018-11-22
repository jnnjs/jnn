import Sequence from '../lib/sequence';
import Events from '../lib/events';
import is from '../util/is';
//import Resource from './resource';
import Error from './error';

class Base extends Events {
    constructor( ...args ) {
        super();
        this.$status = 'created';
        this._ready = new Promise( r => this._resolve = r );
        this._args = args;
        setTimeout( () => this._construct( ...args ) );
    }

    _construct( ...args ) {
        this._resources = [];

        const resources = [];

        /**
         * To execute all hook functions in order:
         * _preinit -> _init -> _init.+ -> _afterinit -> init -> action
         */
        return Sequence.all( [
            () => is.function( this._preinit ) ? this._preinit( ...args ) : true,
            () => is.function( this._init ) ? this._init( ...args ) : true,
            () => {
                const getPrototypeOf = Object.getPrototypeOf;
                const getOwnPropertyNames = Object.getOwnPropertyNames;
                
                /**
                 * to get all methods of current instance and prototypies till the Base class.
                 */
                const properties = x => {
                    const proto = getPrototypeOf( x );
                    if( proto.constructor !== Base.prototype.constructor ) {
                        return new Set( [ ...getOwnPropertyNames( x ), ...getOwnPropertyNames( proto ), ...properties( proto ) ] );
                    }
                    return new Set( [ ...getOwnPropertyNames( x ), ...getOwnPropertyNames( proto ) ] );
                }

                const promises = [];

                for( const property of properties( this ) ) {
                    /**
                     * Don't change the order of the conditions in the if statement
                     * because this[ property ] will execute the getter properties
                     */
                    if( /^_init.+/.test( property ) && typeof this[ property ] === 'function' ) {
                        promises.push( this[ property ]( ...args ) );
                    }
                }
                return Promise.all( promises );
            },
            () => typeof this._afterinit === 'function' ? this._afterinit( ...args ) : true,
            () => typeof this.init === 'function' ? this.init( ...args ) : true,
            () => {
                const list = [];

                for( const resource of this._resources ) {
                    resources.push( resource.$ready() );
                    resource.async || list.push( resource.$ready() );
                }
                return Promise.all( list );
            },
        ] ).catch( results => {
            const reason = results[ results.length - 1 ].reason;
            this._setStatus( 'error', reason );
            console.warn( 'Failed while initializing:', reason );
            throw new Error( 'Failed while initializing.', { reason } );
        } ).then( () => {
            this._setStatus( 'ready' );
            this._resolve();
            if( typeof this.action === 'function' ) {
                this.action();
            }
        } ).then( () => {
            Promise.all( resources ).then( () => this._setStatus( 'loaded' ) )
        } );
    }

    _setStatus( status, data ) {
        this.$status = status;
        this.$emit( status, data );
    }

    $ready( f ) {
        return f ? this._ready.then( () => f.call( this, this ) ) : this._ready;
    }

    //$resource( resource, options = {} ) {
        //resource = new Resource( resource, options );
        //this._resources.push( resource );
        //return resource;
    //}

    $reload() {
        return this._construct( ...this._args );
    }
}
export default Base;
