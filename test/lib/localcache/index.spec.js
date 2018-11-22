import Sequence from '../../../src/lib/sequence';
import LocalCache from '../../../src/lib/localcache';

let i = 0;

function genname() {
    return 'cache-name-' + i++;
}

const supportedModes = [
    'page',
    'session',
    'persistent'
];

describe( 'LocalCache', () => {
    it( 'set in page', done => {

        const lc = new LocalCache( genname() );

        Sequence.all( [
            () => {
                return lc.set( 'key', 'data', {
                    page : true,
                    session : true,
                    persistent : true
                } );
            },
            () => lc.get( 'key', [ 'page' ] ),
            () => lc.get( 'key', [ 'session' ] ),
            () => lc.get( 'key', [ 'persistent' ] )
        ] ).then( results => {
            expect( results[ 1 ].value.data ).toEqual( 'data' );
            expect( results[ 2 ].value.data ).toEqual( 'data' );
            expect( results[ 3 ].value.data ).toEqual( 'data' );
            done();
        } );
    } );

    it( 'set extra data in page', done => {

        const lc = new LocalCache( genname() );
        Sequence.all( [
            () => {
                return lc.set( 'key2', 'data', {
                    page : true,
                    session : true,
                    persistent : true,
                    extra : {
                        name : 'lx'
                    }
                } );
            },
            () => lc.get( 'key2', [ 'page' ] ),
            () => lc.get( 'key2', [ 'session' ] ),
            () => lc.get( 'key2', [ 'persistent' ] )
        ] ).then( results => {
            expect( results[ 1 ].value.extra ).toEqual( { name : 'lx' } );
            expect( results[ 2 ].value.extra ).toEqual( { name : 'lx' } );
            expect( results[ 3 ].value.extra ).toEqual( { name : 'lx' } );
            done();
        } );
    } );

    it( 'data can be update', done => {

        const lc = new LocalCache( genname() );
        Sequence.all( [
            () => {
                return lc.set( 'key', 'update', {
                    page : true,
                    session : true,
                    persistent : true
                } );
            },
            () => lc.get( 'key', [ 'page' ] ),
            () => lc.get( 'key', [ 'session' ] ),
            () => lc.get( 'key', [ 'persistent' ] )
        ] ).then( results => {
            expect( results[ 1 ].value.data ).toEqual( 'update' );
            expect( results[ 2 ].value.data ).toEqual( 'update' );
            expect( results[ 3 ].value.data ).toEqual( 'update' );
            done();
        } );
    } );

    it( 'delete part of the data', done => {

        const lc = new LocalCache( genname() );
        Sequence.chain( [
            () => {
                return lc.set( 'key', 'update', {
                    page : true,
                    session : true,
                    persistent : true
                } );
            },
            () => lc.delete( 'key', [ 'page' ] ),
            () => lc.get( 'key', [ 'page' ] ),
            () => lc.get( 'key', [ 'session' ] ),
            () => lc.get( 'key', [ 'persistent' ] ),
            () => lc.get( 'key', [ 'page', 'persistent' ] )
        ] ).then( results => {
            expect( results[ 2 ].status ).toEqual( 0 );
            expect( results[ 3 ].value.data ).toEqual( 'update' );
            expect( results[ 4 ].value.data ).toEqual( 'update' );
            expect( results[ 5 ].value.data ).toEqual( 'update' );
            done();
        } );
    } );

    it( 'to clear all the data', done => {

        const lc = new LocalCache( genname() );
        Sequence.chain( [
            () => {
                return lc.set( 'key', 'update', {
                    page : true,
                    session : true,
                    persistent : true
                } );
            },
            () => lc.clear( [ 'page', 'session', 'persistent' ] ),
            () => lc.get( 'key', [ 'page' ] ),
            () => lc.get( 'key', [ 'session' ] ),
            () => lc.get( 'key', [ 'persistent' ] ),
            () => lc.get( 'key', [ 'page', 'persistent' ] )
        ] ).then( results => {
            expect( results[ 2 ].status ).toEqual( 0 );
            expect( results[ 3 ].status ).toEqual( 0 );
            expect( results[ 4 ].status ).toEqual( 0 );
            expect( results[ 5 ].status ).toEqual( 0 );
            done();
        } );
    } );

    it( 'set data with validation conditions', done => {
        const lc = new LocalCache( genname() );
        Sequence.chain( [
            () => {
                return lc.set( 'key', 'update', {
                    page : {
                        lifetime : 15
                    },
                    persistent : {
                        lifetime : 45
                    }
                } );
            },
            () => lc.get( 'key', [ 'page' ] ), // 15ms Y
            () => lc.get( 'key', [ 'persistent' ] ), // 30ms Y
            () => {
                return new Promise( resolve => {
                    setTimeout( () => {
                        resolve( lc.get( 'key', [ 'page' ] ) );
                    }, 15 );
                } );
            },
            () => lc.get( 'key', [ 'persistent' ] ),
            () => {
                return new Promise( resolve => {
                    setTimeout( () => {
                        resolve( lc.get( 'key', [ 'persistent' ] ) );
                    }, 15 );
                } );
            },
        ] ).then( results => {
            expect( results[ 1 ].status ).toEqual( 1 );
            expect( results[ 2 ].status ).toEqual( 1 );
            expect( results[ 3 ].status ).toEqual( 0 );
            expect( results[ 4 ].status ).toEqual( 1 );
            expect( results[ 5 ].status ).toEqual( 0 );
            done();
        } );

    } );

    for( let mode of supportedModes ) {

        it( 'get data with a validation conditions', done => {
            const lc = new LocalCache( genname() );
            Sequence.chain( [
                () => lc.set( 'key1', 'value', { page : true, session : true, persistent : true } ),
                () => lc.get( 'key1', [ mode ], {
                    validate( data ) {
                        if( data.data == 'value' ) {
                            return false;
                        }
                    }
                } ),
                result => {
                    expect( result.status ).toEqual( 0 );
                    done();
                }
            ] );
        } );

        it( 'set autodelete to false', done => {
            const lc = new LocalCache( genname() );
            Sequence.chain( [
                () => lc.set( 'key1', 'value', { page : true, session : true, persistent : true } ),
                () => lc.get( 'key1', [ mode ], {
                    autodelete : false,
                    validate( data ) {
                        if( data.data == 'value' ) {
                            return false;
                        }
                    }
                } ),
                () => lc.get( 'key1', [ mode ] ),
                result => {
                    expect( result.value.data ).toEqual( 'value' );
                    done();
                }
            ] );
        } );
    }

    it( 'clean data wouldn\'t clean unmatched data', done => {
        const lc = new LocalCache( genname() );
        Sequence.chain( [
            () => lc.set( 'key1', 'value', { page : true, session : true, persistent : true } ),
            () => lc.clean(),
            () => lc.get( 'key1', [ 'page', 'session', 'persistent' ] ),
            result => {
                expect( result.value.data ).toEqual( 'value' );
                done();
            }
        ] );
    } );

    it( 'clean data', done => {
        const lc = new LocalCache( genname() );
        Sequence.chain( [
            () => lc.set( 'key2', 'value', { page : true, session : true, persistent : true } ),
            () => lc.clean( {
                ctime : [ 0, +new Date ]
            } ),
            () => lc.get( 'key2', [ 'page', 'session', 'persistent' ] ),
            result => {
                expect( result.status ).toEqual( 0 );
                done();
            }
        ] );
    } );

    it( 'clean data with remove function', done => {
        const lc = new LocalCache( genname() );
        Sequence.chain( [
            () => lc.set( 'key3', 'value', { page : true, session : true, persistent : true } ),
            () => lc.clean( {
                remove( data, key ) {
                    return key === 'key3'
                }
            } ),
            () => lc.get( 'key3', [ 'page', 'session', 'persistent' ] ),
            result => {
                expect( result.status ).toEqual( 0 );
                done();
            }
        ] );
    } );

    it( 'clean data with ctime condition', done => {
        const lc = new LocalCache( genname() );
        Sequence.chain( [
            () => lc.set( 'key4', 'value', { page : true, session : true, persistent : true } ),
            () => lc.clean( {
                ctime : [ 0, new Date ]
            } ),
            () => lc.get( 'key4', [ 'page', 'session', 'persistent' ] ),
            result => {
                expect( result.status ).toEqual( 0 );
                done();
            }
        ] );
    } );

    it( 'clean data with type condition', done => {
        const lc = new LocalCache( genname() );
        Sequence.chain( [
            () => lc.set( 'key5', 'value', { page : true, session : true, persistent : true, type : 'tttype' } ),
            () => lc.clean( {
                type : [ 'tttype' ]
            } ),
            () => lc.get( 'key5', [ 'page', 'session', 'persistent' ] ),
            result => {
                expect( result.status ).toEqual( 0 );
                done();
            }
        ] );
    } );

    it( 'restore data in higher storage', done => {
        const lc = new LocalCache( genname() );
        Sequence.chain( [
            () => lc.set( 'key6', 'value', { persistent : true } ),
            () => lc.get( 'key6', [ 'page', 'persistent' ], { page : true } ),
            () => lc.get( 'key6', [ 'page', 'persistent' ] ),
            result => {
                expect( result.value.storage ).toEqual( 'page' );
                expect( result.value.data ).toEqual( 'value' );
                done();
            }
        ] );
    } );

} );
