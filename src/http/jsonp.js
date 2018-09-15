import { URLSearchParams } from '../url';

let id = 0;

const prefix = 'biu_jsonp_callback_' + (+new Date) + '_' + Math.random().toString().substr( 2 );

function createScriptTag( src, id ) {
    const target = document.getElementsByTagName( 'script' )[ 0 ] || document.head.firstChild;
    const  script = document.createElement( 'script' );
    script.src = src;
    script.id = id;
    return target.parentNode.insertBefore( script, target );
}

function jsonp( url, options = {} ) {

    const params = options.data || {};
    const callback = prefix + '_' + id++;

    let r1, r2;

    const promise = new Promise( ( resolve, reject ) => { 
        r1 = resolve;
        r2 = reject;
    } );

    params.callback || ( params.callback = callback );

    const querystring = new URLSearchParams( params ).toString();

    url += ( url.indexOf( '?' ) >= 0 ? '&' : '?' ) + querystring;

    window[ params.callback ] = function( response ) {
        r1( response );

        window[ params.callback ] = null;
        delete window[ params.callback ];
        const script = document.getElementById( params.callback );
        script && script.parentNode.removeChild( script );
    };

    const script = createScriptTag( url, params.callback );

    script.addEventListener( 'error', e => { r2( e ) } );

    return promise;
}

export default jsonp;
