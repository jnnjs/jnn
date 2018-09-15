// @flow
import Set from '@lvchengbin/set';
import Sequence from '../util/sequence';
import Resource from './resource';
import Error from './error';
import Events from '../util/events';
import is from '../util/is';

const aliases = [ 'on', 'once', 'removeListener', 'emit', 'removeAllListeners' ];

class Base extends Events {
    constructor( ...args: Array<mixed> ) {
        super();

        for( let item of aliases ) {
            this[ '$' + item ] = this[ item ].bind( this );
        }

        this.$status = 'created';
        this._ready = new Promise( ( r: () => void ) => {
            this._resolve = r;
        } );
        this._args = args;
        setTimeout( () => this._construct( ...args ) );
    }

    _construct( ...args: Array<mixed> ) {
        this._resources = [];

        const resources = [];

        return Sequence.all( [
            () => is.function( this._init ) ? this._init() : true,
            (): mixed => is.function( this._init ) ? this._init( ...args ) : true,
            (): mixed => {
                const getPrototypeOf = Object.getPrototypeOf;
                const getOwnPropertyNames = Object.getOwnPropertyNames;
                
                const properties = ( x: string ): Set => {
                    const proto = getPrototypeOf( x );
                    if( proto.constructor !== Base.prototype.constructor ) {
                        return new Set( [ ...getOwnPropertyNames( x ), ...getOwnPropertyNames( proto ), ...properties( proto ) ], false );
                    }
                    return new Set( [ ...getOwnPropertyNames( x ), ...getOwnPropertyNames( proto ) ], false );
                }

                const promises = [];

                for( const property of properties( this ) ) {
                    /**
                     * please don't change the order of the conditions in the if statement
                     * because this[ property ] will execute the getter properties
                     */
                    if( /^_init.+/.test( property ) && is.function( this[ property ] ) ) {
                        promises.push( this[ property ]( ...args ) );
                    }
                }
                return Promise.all( promises );
            },
            (): mixed => is.function( this._afterinit ) ? this._afterinit( ...args ) : true,
            (): mixed => is.function( this.init ) ? this.init( ...args ) : true,
            (): mixed => {
                const list = [];

                for( const resource of this._resources ) {
                    resources.push( resource.ready() );
                    resource.async || list.push( resource.ready() );
                }
                return Promise.all( list );
            },
        ] ).catch( ( results: Array ) => {
            const reason = results[ results.length - 1 ].reason;
            this._setStatus( 'error', reason );
            console.warn( 'Failed while initializing:', reason );
            throw new Error( 'Failed while initializing.', { reason } );
        } ).then( () => {
            this._setStatus( 'ready' );
            this._resolve();
            is.function( this.action ) && this.action();
        } ).then( () => {
            Promise.all( resources ).then( (): mixed => this._setStatus( 'loaded' ) )
        } );
    }

    _setStatus( status: string, data?: mixed ) {
        this.$status = status;
        this.$emit( status, data );
    }

    $ready( f?: () => mixed | void ): mixed {
        return f ? this._ready.then( (): ?mixed => f.call( this, this ) ) : this._ready;
    }

    $resource( resource: mixed, options: mixed = {} ): Resource {
        if( !resource ) return this._resources;
        resource = new Resource( resource, options );
        this._resources.push( resource );
        return resource;
    }

    $reload(): Promise {
        return this._construct( ...this._args );
    }

    $call( method: string, ...args: Array<mixed> ): mixed {
        return this[ method ].call( this, ...args );
    }
}
export default Base;
