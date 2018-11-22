import is from '../../util/is';

const Response = class {
    constructor( {
        status = 200,
        statusText = 'OK',
        url = '',
        body = null,
        headers = {}
    } ) {
        if( !is.string( body ) ) {
            return new TypeError( 'Response body must be a string "' + body + '"' );
        }
        Object.assign( this, { 
            body,
            status,
            statusText,
            url,
            headers,
            ok : status >= 200 && status < 300 || status === 304
        } );
    }

    text() {
        return Promise.resolve( this.body );
    }

    json() {
        try {
            const json = JSON.parse( this.body );
            return Promise.resolve( json );
        } catch( e ) {
            return  Promise.reject( e );
        }
    }

    uncompress() {
    }

    compress() {
    }
};

export default Response;
