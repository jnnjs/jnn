import URLSearchParams from './url-search-params';
import parse from './parse';

const attrs = [
    'href', 'origin',
    'host', 'hash', 'hostname',  'pathname', 'port', 'protocol', 'search',
    'username', 'password', 'searchParams'
];

export default class URL {
    constructor( path, base ) {
        if( URL.prototype.isPrototypeOf( path ) ) {
            return new URL( path.href );
        }

        if( URL.prototype.isPrototypeOf( base ) ) {
            return new URL( path, base.href );
        }

        path = String( path );

        if( base !== undefined ) {
            if( !parse( base ) ) {
                throw new TypeError( 'Failed to construct "URL": Invalid base URL' );
            }
            if( /^[a-zA-Z][0-9a-zA-Z.-]*:/.test( path ) ) {
                base = null;
            }
        } else {
            if( !/^[a-zA-Z][0-9a-zA-Z.-]*:/.test( path ) ) {
                throw new TypeError( 'Failed to construct "URL": Invalid URL' );
            }
        }

        if( base ) {
            base = new URL( base );
            if( path.charAt( 0 ) === '/' && path.charAt( 1 ) === '/' ) {
                path = base.protocol + path;
            } else if( path.charAt( 0 ) === '/' ) {
                path = base.origin + path;
            } else {
                const pathname = base.pathname;
                
                if( pathname.charAt( pathname.length - 1 ) === '/' ) {
                    path = base.origin + pathname + path;
                } else {
                    path = base.origin + pathname.replace( /\/[^/]+\/?$/, '' ) + '/' + path;
                }
            }
        }

        const dotdot = /([^/])\/[^/]+\/\.\.\//;
        const dot = /\/\.\//g;

        path = path.replace( dot, '/' );

        while( path.match( dotdot ) ) {
            path = path.replace( dotdot, '$1/' );
        }

        const node = document.createElement( 'a' );
        node.href = path;

        for( const attr of attrs ) {
            this[ attr ] = attr in node ? node[ attr ] : '';
        }

        /**
         * set origin for IE
         */
        if( !this.origin ) {
            this.origin = this.protocol + '//' + this.host;
        }

        /**
         * add a slash before the path for IE
         */
        if( this.pathname && this.pathname.charAt( 0 ) !== '/' ) {
            this.pathname = '/' + this.pathname;
        }
        this.searchParams = new URLSearchParams( this.search ); 
    }
    toString() {
        return this.href;
    }
    toJSON() {
        return this.href;
    }
}