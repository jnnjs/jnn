import Events from './lib/events';
import Script from '../script';

const MODULE_LOAD = Symbol( 'module#load' );

export default class Module extends Events {
    constructor( url, parent, options = {} ) {
        super();
        Object.assign( this, options );
        this.children = [];
        this.exports = {};
        this.url = url;
        this.loaded = false;
        this.parent = parent;
        this._ready = new Promise( r => this._resolve = r );
    }

    [MODULE_LOAD]() {
        return new Promise( ( resolve, reject ) => {
            Script.create( this.url ).then( () => {
                this._resolve();
            } ).catch( reject );
        } );
    }

    $ready( f ) {
        return f ? this._ready.then( () => f.call( this, this ) ) : this._ready;
    }

    require() {
    }
}
