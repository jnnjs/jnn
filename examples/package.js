J.define( ( exports, require, module, __filename, __dirname, J, Jnn, ctx ) => {
    const x = require( './x' );

    console.log( x, Jnn, ctx );

    module.exports = new J.Package( {
        init() {
            this.require( './y' ).then();
        }
    } );
} );

const x = require( './x' );

console.log( x );

module.exports = new J.Package( {
    init() {
        this.require( './y' ).then();
    }
} );
