import { URL } from '../url';
import is from '../util/is';
import { mergeParams } from './utils';
import Response from './response';

export default ( url, options = {} ) => {

    let {
        data,
        params,
        timeout,
        asynchronous = true,
        method = 'GET',
        headers = {},
        onprogress,
        credentials = 'omit',
        responseType = 'text',
        xhr = new XMLHttpRequest()
    } = options;

    method = method.toUpperCase();

    xhr.timeout = timeout;

    return new Promise( ( resolve, reject ) => {

        xhr.withCredentials = credentials === 'include';

        const onreadystatechange = () => {
            if( xhr.readyState != 4 ) return;
            if( xhr.status === 0 ) return;

            const response = new Response( {
                body : responseType !== 'text' ? xhr.response : xhr.responseText,
                status : xhr.status,
                statusText : xhr.statusText,
                headers : xhr.getAllResponseHeaders()
            } );

            resolve( response );
            xhr = null;
        };

        url = new URL( url, location.href );

        mergeParams( url.searchParams, params );

        xhr.open( method, url.href, asynchronous );

        xhr.onerror = e => {
            reject( e );
            xhr = null;
        };
        
        xhr.ontimeout = () => {
            reject( 'Timeout' );
            xhr = null;
        };

        if( is.function( onprogress ) ) {
            xhr.onprogress = onprogress;
        }

        const isFormData = FormData.prototype.isPrototypeOf( data );

        for( let key in headers ) {
            if( ( is.undefined( data ) || isFormData ) && key.toLowerCase() === 'content-type' ) {
                // if the data is undefined or it is an instance of FormData
                // let the client to set "Content-Type" in header
                continue;
            }
            xhr.setRequestHeader( key, headers[ key ] );
        }

        asynchronous && ( xhr.onreadystatechange = onreadystatechange );
        xhr.send( is.undefined( data ) ? null : data );
        asynchronous || onreadystatechange();
    } );
};
