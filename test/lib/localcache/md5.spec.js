import md5 from '../../../src/lib/localcache/md5';
import cases from './md5-cases';

describe( 'md5', () => {
    for( let c of cases ) {
        it( c.str, () => {
            expect( md5( c.str ) ).toEqual( c.md5 );
        } );
    }
} );
