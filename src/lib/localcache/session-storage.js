import Storage from './storage';

export default class SessionStorage extends Storage {
    constructor( name ) {
        super( name );
    }

    set( key, data, options = {} ) {
        data = this.wrap( data, options );
        try {
            sessionStorage.setItem( this.name + key, JSON.stringify( data ) );
            return Promise.resolve( data );
        } catch( e ) {
            return Promise.reject( e );
        }
    }

    get( key, options = {} ) {
        let data;
        
        try {
            data = JSON.parse( sessionStorage.getItem( this.name + key ) );

            if( !data ) return Promise.reject();

            if( this.validate( data, options ) === false ) {
                options.autodelete !== false && this.delete( key );
                return Promise.reject();
            }
        } catch( e ) {
            this.delete( key );
            return Promise.reject();
        }
        return Promise.resolve( this.unwrap( data, 'session' ) );
    }

    delete( key ) {
        sessionStorage.removeItem( this.name + key );  
        return Promise.resolve();
    }

    clear() {
        sessionStorage.clear();
        return Promise.resolve();
    }

    keys() {
        const keys = [];
        const name = this.name;
        const l = this.name.length;

        for( let key in sessionStorage ) {
            if( key.indexOf( name ) ) continue;
            keys.push( key.substr( l ) );
        }

        return Promise.resolve( keys );
    }
}
