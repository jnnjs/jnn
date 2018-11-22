function assign( dest, ...src ) {
    const o = src[ 0 ];
    for( let prop in o ) {
        if( o.hasOwnProperty( prop ) && !dest.hasOwnProperty( prop ) ) {
            dest[ prop ] = o[ prop ];
        }

        if( src.length > 1 ) {
            return assign( dest, ...src.splice( 1, src.length - 1 ) );
        }
        return dest;
    }
}

export default assign;
