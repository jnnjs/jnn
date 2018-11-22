import Sequence from '../../../src/lib/sequence';
import Memory from '../../../src/lib/localcache/memory';
import LocalStorage from '../../../src/lib/localcache/local-storage';
import SessionStorage from '../../../src/lib/localcache/session-storage';
import IDB from '../../../src/lib/localcache/idb';

let id = 0;

function sname() {
    return 'test-' + +new Date + id++;
}

const storages = {
    Memory,
    LocalStorage,
    SessionStorage,
    IDB
};

describe( 'Storage', () => {

    const test = ( name, Storage ) => {

        describe( name, () => {
            const options = {
                lifetime : 2000,
                priority : 6
            };
            it( 'storing a string', done => {
                const storage = new Storage( sname() );
                Sequence.all( [
                    () => {
                        return storage.set( 'key', 'data', options ).catch( e => {
                            console.log( 'Set error: ', e );
                        } );
                    },
                    () => {
                        return storage.get( 'key' ).catch( e => {
                            console.log( 'Get error: ', e );
                        } );
                    }
                ] ).then( results => {
                    expect( results[ 1 ].value.data ).toEqual( 'data' );
                    done();
                } );
            } );

            it( 'storing a object', done => {
                const storage = new Storage( sname() );
                Sequence.all( [
                    () => {
                        return storage.set( 'key', { name : 'lx' }, options ).catch( e => {
                            console.log( 'Set error: ', e );
                        } );
                    },
                    () => {
                        return storage.get( 'key' ).then( data => {
                            expect( data.data ).toEqual( { name : 'lx' } );
                            done();
                        } ).catch( e => {
                            console.log( 'Get error: ', e );
                        } );
                    }
                ] );
            } );

            it( 'delete', done => {
                const storage = new Storage( sname() );

                Sequence.all( [
                    () => {
                        return storage.set( 'key', 'data', options ).catch( e => {
                            console.log( 'Set error: ', e );
                        } );
                    },
                    () => {
                        return storage.delete( 'key' ).catch( e => {
                            console.log( 'Delete error: ', e );
                        } );
                    },
                    () => {
                        return storage.get( 'key' ).catch( () => {
                            done();
                        } );
                    }
                ] );
            } );

            it( 'keys', done => {
                const storage = new Storage( sname() );
                Sequence.all( [
                    () => storage.set( 'key1', 'value' ),
                    () => storage.set( 'key2', 'value' ),
                    () => {
                        return storage.keys().then( keys => {
                            expect( keys ).toEqual( [ 'key1', 'key2' ] );
                            done();
                        } );
                    }
                ] );
            } );

            it( 'clear', done => {
                const storage = new Storage( sname() );
                Sequence.all( [
                    () => storage.set( 'key1', 'data', options ),
                    () => storage.set( 'key2', 'data', options ),
                    () => {
                        return storage.clear().catch( e => {
                            console.log( 'Clear error: ', e );
                        } );
                    },
                    () => {
                        return storage.keys().then( keys => {
                            expect( keys ).toEqual( [] );
                            done();
                        } ).catch( e => {
                            console.log( 'Get keys error: ', e );
                        } );
                    }
                ] );
            } );
        } );

        it( 'validating lifetime', done => {
            const options = {
                lifetime : 50,
                priority : 6
            };

            const storage = new Storage( sname() );

            Sequence.all( [
                () => {
                    return storage.set( 'key', 'data', options ).catch( e => {
                        console.log( 'Set error: ', e );
                    } );
                },
                () => {
                    return storage.get( 'key' ).catch( () => {
                        done();
                    } );
                }
            ], 50 );
        } );

        it( 'validating cookie', done => {
            const options = {
                lifetime : 50,
                priority : 6,
                cookie : true
            };

            const storage = new Storage( sname() );

            Sequence.all( [
                () => {
                    return storage.set( 'key', 'data', options ).catch( e => {
                        console.log( 'Set error: ', e );
                    } );
                },
                () => {
                    document.cookie = 'x=' + +new Date;
                    return storage.get( 'key' ).then( data => {
                        console.log( 'got data: ', data );
                    } ).catch( () => {
                        done();
                    } );
                }
            ] );
        } );

        it( 'validating with correct md5 value', done => {
            const options = {
                lifetime : 50,
                priority : 6,
                cookie : true,
                md5 : true
            };

            const storage = new Storage( sname() );

            Sequence.chain( [
                () => {
                    return storage.set( 'key', 'value', options ).catch( e => {
                        console.log( 'Set error: ', e );
                    } );
                },
                () => {
                    return storage.get( 'key', { md5 : '2063c1608d6e0baf80249c42e2be5804' } ).then( value => {
                        expect( value.data ).toEqual( 'value' )
                        done();
                    } ).catch( () => {
                        console.log( 'Should not get data' );
                    } );
                }
            ] );
        } );

        it( 'invalid md5 value', done => {

            const options = {
                lifetime : 50,
                priority : 6,
                cookie : true,
                md5 : true
            };

            const storage = new Storage( sname() );

            Sequence.all( [
                () => {
                    return storage.set( 'key', 'data', options ).catch( e => {
                        console.log( 'Set error: ', e );
                    } );
                },
                () => {
                    return storage.get( 'key', { md5 : 'xxxx' } ).catch( () => {
                        done();
                    } );
                }
            ] );
        } );

        it( 'validate with custom function', done => {
            const storage = new Storage( sname() );

            Sequence.all( [
                () => {
                    return storage.set( 'key', 'data' ).catch( e => {
                        console.log( 'Set error: ', e );
                    } );
                },
                () => {
                    return storage.get( 'key', { 
                        validate : () => false
                    } ).catch( () => {
                        done();
                    } );
                }
            ] );
        } );
    };

    for( let storage in storages ) {
        test( storage, storages[ storage ] );
    }
} );
