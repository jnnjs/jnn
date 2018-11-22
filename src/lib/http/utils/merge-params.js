export default ( dest, src ) => {
    if( !src ) return dest;

    if( src instanceof URLSearchParams ) {
        for( let item of src.entries() ) {
            dest.set( item[ 0 ], item[ 1 ] );
        }
    } else {
        const keys = Object.keys( src );
        for( let item of keys ) {
            dest.set( item, src[ item ] );
        }
    }
    return dest;
}
