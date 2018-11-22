import B from '../../src/core/base';

class Base extends B {
    _preinit( init ) {
        this.hasCalledPreinit = true;
        Object.assign( this, init );
    }

    _afterinit() {
        this.hasCalledAfterinit = true;
    }
}

describe( 'Base', () => {

    describe( 'hooks', () => {

        it( 'should have called the _preinit method before to call _init', done => {
            new Base( {
                _init() {
                    expect( this.hasCalledPreinit ).toBeTruthy();
                    done();
                }
            } );
        } );

        it( 'should have called the _afterinit method', done => {
            new Base( {
                init() {
                    expect( this.hasCalledAfterinit ).toBeTruthy();
                    done();
                }
            } );
        } );

        it( 'should have called the _init method before ready', done => {
            new Base( {
                _init() {
                    expect( this.$status ).toEqual( 'created' );
                    done();
                }
            } );
        } );

        it( 'should have called the "init" method while initlaizing', done => {
            new Base( {
                init() {
                    expect( this.$status ).toEqual( 'created' );
                    done();
                }
            } );
        } );

        it( 'should have called the "action" method after ready', done => {
            new Base( {
                action() {
                    expect( this.$status ).toEqual( 'ready' );
                    done();
                }
            } );
        } );

        it( 'should have called all methods which match the regex /^_init[A-Z].*/', done => {
            let i = 0;
            new Base( {
                _initA() {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            resolve( i++ );
                        }, 40 );
                    } );
                }
            } ).$ready( () => {
                expect( i ).toEqual( 1 );
                done();
            } );
        } );
    } );

    describe( 'methods', () => {
        it( 'should have been ready after the _init resolved if it returned an Promise Object', done => {
            new Base( {
                _init() {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            this.x = 'x';
                            resolve();
                        }, 30 );
                    } );
                }
            } ).$ready( function() {
                expect( this.x ).toEqual( 'x' );
                done();
            } );
        } );

        it( 'should have called the callback function after the extension is ready', done => {
            new Base( {
                init() {
                    this.$resource( new Promise( resolve => {
                        setTimeout( resolve, 1000 );
                    } ), {
                        async : true
                    } );
                }
            } ).$ready( function() {
                expect( this.$status ).toEqual( 'ready' );
                done();
            } );
        } );

        it( 'should have called the "then" method after the extension is ready', done => {
            new Base( {
                init() {
                    this.$resource( new Promise( resolve => {
                        setTimeout( resolve, 10009 );
                    } ), {
                        async : true
                    } );
                }
            } ).$ready( function() {
                expect( this.$status ).toEqual( 'ready' );
                done();
            } );
        } );

        it( 'should have been ready after all resources finish loading', done => {
            new Base( {
                _init() {
                    this.$resource( new Promise( resolve => {
                        setTimeout( () => {
                            this.x = 'x';
                            resolve();
                        }, 40 );
                    } ) );
                }
            } ).$ready( function() {
                expect( this.x ).toEqual( 'x' );
                done();
            } );
        } );

        it( '$reload', done => {
            let i = 0;
            const instance = new Base( {
                init() {
                    return i++ ? Promise.resolve() : Promise.reject();
                }
            } );

            instance.$ready( done );

            instance.$on( 'error', function() {
                this.$reload();
            } );
        } );
    } );

    describe( 'status' , () => {
        it( 'created', done => {
            new Base( {
                init() {
                    expect( this.$status ).toEqual( 'created' );
                    done();
                }
            } );
        } );

        it( 'ready', done => {
            new Base().$ready( function() {
                expect( this.$status ).toEqual( 'ready' );
                done();
            } );
        } );

        it( 'loaded', done => {
            const base = new Base();
            setTimeout( () => {
                expect( base.$status ).toEqual( 'loaded' );
                done();
            }, 30 );
        } );

        it( 'error', done => {
            const base = new Base( {
                init() {
                    return Promise.reject( 'error' );
                }
            } );
            setTimeout( () => {
                expect( base.$status ).toEqual( 'error' );
                done();
            }, 30 );
        } );
    } );

    describe( 'events', () => {
        it( 'ready', done => {
            const x = new Base();

            x.$on( 'ready', () => {
                expect( x.$status ).toEqual( 'ready' );
                done();
            } );
        } );

        it( 'loaded', done => {
            const x = new Base();

            x.$on( 'loaded', () => {
                expect( x.$status ).toEqual( 'loaded' );
                done();
            } );
        } );

        it( 'error', done => {
            new Base( {
                init() {
                    return Promise.reject( 'error' );
                }
            } ).$on( 'error', e => {
                expect( e ).toEqual( 'error' );
                done();
            } );

        } );
    } );

} );
