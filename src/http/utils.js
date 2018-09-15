import { URL, URLSearchParams } from '../url';

function isURL( url ) {
    if( window.URL.prototype.isPrototypeOf( url ) ) return true;
    return URL.prototype.isPrototypeOf( url );
}

function isURLSearchParams( obj ) {
    if( window.URLSearchParams.prototype.isPrototypeOf( obj ) ) return true;
    return URLSearchParams.prototype.isPrototypeOf( obj );
}

function mergeParams( dest, src ) {
    if( !isURLSearchParams( dest ) ) {
        dest = new URLSearchParams( dest );
    }

    if( !src ) return dest;

    if( isURLSearchParams( src ) ) {
        for( let item of src.entries() ) {
            dest.append( item[ 0 ], item[ 1 ] );
        }
    } else {
        const keys = Object.keys( src );

        for( let item of keys ) {
            dest.append( item, src[ item ] );
        }
    }
    return dest;
}

export { isURL, isURLSearchParams, mergeParams };
