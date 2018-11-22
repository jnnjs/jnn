import LocalCache from '../localcache';
import Response from './response';

const localcache = new LocalCache( 'JNN-HTTP-VERSION-1.0.0' );

function set( key, data, options ) {
    const url = new URL( key );
    url.searchParams.sort();

    return localcache.set( url.toString(), data, options );
}

function get( key, options = {} ) {

    let url = new URL( key ); 
    url.searchParams.sort();
    url = url.toString();

    return localcache.get( url, LocalCache.STORAGES, options ).then( result => {
        const response = new Response( {
            url,
            body : result.data,
            status : 200,
            statusText : 'From LocalCache',
            headers : {
                'Content-Type' : result.mime
            }
        } );

        return response;
    } );
}

export default { localcache, set, get };
