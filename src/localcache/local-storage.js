import Storage from './storage';

export default class LocalStorage extends Storage {
    constructor( name ) {
        super( name );
    }

    set( key, data, options = {} ) {
        data = this.format( data, options );
        try {
            localStorage.setItem( this.name + key, JSON.stringify( data ) );
            return Promise.resolve( data );
        } catch( e ) {
            return Promise.reject( e );
        }
    }

    get( key, options = {} ) {
        let data;
        
        try {
            data = JSON.parse( localStorage.getItem( this.name + key ) );

            if( !data ) return Promise.reject();

            if( this.validate( data, options ) === false ) {
                options.autodelete !== false && this.delete( key );
                return Promise.reject();
            }
        } catch( e ) {
            this.delete( key );
            return Promise.reject();
        }

        return Promise.resolve( this.output( data, 'persistent' ) );
    }

    delete( key ) {
        localStorage.removeItem( this.name + key );  
        return Promise.resolve();
    }

    clear() {
        localStorage.clear();
        return Promise.resolve();
    }

    keys() {
        const keys = [];
        const name = this.name;
        const l = this.name.length;

        for( let key in localStorage ) {
            if( key.indexOf( name ) ) continue;
            keys.push( key.substr( l ) );
        }

        return Promise.resolve( keys );
    }
}
