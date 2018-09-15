import Events from '../util/events';
import is from '../util/is';

class Resource extends Events {
    constructor( resource, options = {} ) {
        super();

        if( resource instanceof Resource ) return resource;

        this.desc = null;
        this.async = false;
        Object.assign( this, options );
        this.resource = resource;
        this.response = null;
        this.error = false;
        this.status = 'loading';

        this.__ready = new Promise( ( resolve, reject ) => {
            if( is.function( resource.$ready ) ) {
                resource.$ready( resolve );
            } else if( is.promise( resource ) ) {
                resource.then( res => {
                    resolve( this.response = res );
                } ).catch( reason => {
                    reject( reason );
                } );
            } else {
                resolve( resource );
            }
        } ).then( res => {
            this.status = 'complete';
            this.emit( 'load' );
            return res;
        } ).catch( reason => {
            this.status = 'error';
            this.error = reason;
            this.emit( 'error' );
        } );
    }

    ready( f ) {
        return f ? this.__ready.then( () => f.call( this ) ) : this.__ready;
    }
}

export default Resource;
