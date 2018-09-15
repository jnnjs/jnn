export default class extends Error {

    constructor( message, init = {} ) {
        super( message );

        if( Error.captureStackTrace ) {
            Error.captureStackTrace( this, Error );
        }

        this.name = 'JauntyError';
        Object.assign( this, init );
    }
}
