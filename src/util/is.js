const is = {
    // check function
    function( f ) {
        return typeof f === 'function'
    },

    // check string
    string( s ) {
        return typeof s === 'string' || s instanceof String;
    },

    // check object
    object( o ) {
        return !!o && typeof o === 'object' && !Array.isArray( o );
    },

    date( d ) {
        return ({}).toString.call( d ) === '[object Date]';
    },

    // check promise
    promise( p ) {
        return !!p && is.function( p.then ) && is.function( p.catch );
    },

    // check undefined
    undefined( u ) {
        return arguments.length > 0 && typeof u === 'undefined';
    },

    // check HTML Node
    node( n ) {
        return typeof Node === 'object' ? n instanceof Node :  !!n && typeof n === 'object' && typeof n.nodeType === 'number' && typeof n.nodeName === 'string';
    },

    // check HTML Element Node
    enode( n ) {
        return !!n && n.nodeType === 1 && is.node( n );
    },

    // check HTML Text Node
    tnode( n ) {
        return !!n && n.nodeType === 3 && is.node( n );
    },

    number( n, strict = false ) {
        if( ({}).toString.call( n ) === '[object Number]' ) return true;
        if( strict || !is.string( n ) ) return false;
        return !isNaN( parseFloat( n ) ) && isFinite( n ) && !/\.$/.test( n );
    },

    int( i, strict = false ) {
        if( is.number( i, true ) ) return i % 1 === 0;
        if( strict ) return false;
        if( is.string( i ) ) {
            if( i === '-0' ) return true;
            return i.indexOf( '.' ) < 0 && String( parseInt( i ) ) === i;
        }
        return false;
    },

    // check IPv4 address
    ipv4( ip ) {
        if( !is.string( ip ) ) return false;
        const pieces = ip.split( '.' );
        if( pieces.length !== 4 ) return false;
        for( const i of pieces ) {
            if( !is.int( i ) || i < 0 || i > 255 ) return false;
        }
        return true;
    },

    ipv6( ip ) {

        /**
         * BNF of IPv6:
         *
         * IPv6address =                             6( h16 ":" ) ls32
         *              /                       "::" 5( h16 ":" ) ls32
         *              / [               h16 ] "::" 4( h16 ":" ) ls32
         *              / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
         *              / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
         *              / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
         *              / [ *4( h16 ":" ) h16 ] "::"              ls32
         *              / [ *5( h16 ":" ) h16 ] "::"              h16
         *              / [ *6( h16 ":" ) h16 ] "::"
         *
         *  ls32 = ( h16 ":" h16 ) / IPv4address
         *       ; least-significant 32 bits of address
         *
         *  h16 = 1 * 4HEXDIG
         *      ; 16 bits of address represented in hexadcimal
         */

        /**
         * An IPv6 address should have at least one colon(:)
         */
        if( ip.indexOf( ':' ) < 0 ) return false;

        /**
         * An IPv6 address can start or end with '::', but cannot start or end with a single colon.
         */
        if( /(^:[^:])|([^:]:$)/.test( ip ) ) return false;

        /**
         * An IPv6 address should consist of colon(:), dot(.) and hexadecimel
         */
        if( !/^[0-9A-Fa-f:.]{2,}$/.test( ip ) ) return false;

        /**
         * An IPv6 address should not include any sequences bellow:
         * 1. a hexadecimal with length greater than 4
         * 2. three or more consecutive colons
         * 3. two or more consecutive dots
         */
        if( /[0-9A-Fa-f]{5,}|:{3,}|\.{2,}/.test( ip ) ) return false;

        /**
         * In an IPv6 address, the "::" can only appear once.
         */
        if( ip.split( '::' ).length > 2 ) return false;

        /**
         * if the IPv6 address is in mixed form.
         */
        if( ip.indexOf( '.' ) > -1 ) {
            const lastColon = ip.lastIndexOf( ':' );
            const hexadecimal = ip.substr( 0, lastColon );
            const decimal = ip.substr( lastColon + 1 );
            /**
             * the decimal part should be an valid IPv4 address.
             */
            if( !is.ipv4( decimal ) ) return false;

            /**
             * the length of the hexadecimal part should less than 6.
             */
            if( hexadecimal.split( ':' ).length > 6 ) return false;
        } else {
            /**
             * An IPv6 address that is not in mixed form can at most have 8 hexadecimal sequences.
             */
            if( ip.split( ':' ).length > 8 ) return false;
        }
        return true;
    }
};
export default is;
