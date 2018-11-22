import Sequence from '@lvchengbin/sequence';
import biu from '../src/index'; 
import Response from '../src/response';

describe( 'biu.request', () => {
    it( 'http authorization failed', done => {
        const api = `${__yolk__.server}/test/ajax/auth`;
        biu.get( api, {
            fullResponse : true
        } ).catch( response => {
            expect( response.status ).toEqual( 401 );
            done();
        } );
    } );

    it( 'http authorization', done => {
        const api = `${__yolk__.server}/test/ajax/auth`;
        biu.get( api, {
            fullResponse : true,
            auth : {
                username : 'n',
                password : 'p'
            }
        } ).then( response => {
            expect( response.status ).toEqual( 200 );
            done();
        } ).catch( response => {
            console.log( 'Failed Auth: ', response );
        } );
    } );
} );

describe( 'biu.get without localcache', () => {
    it( 'simply get cache:true', done => {
        const api = `${__yolk__.server}/test/ajax/get?x=1&y=2`;
        biu.get( api, {
            cache : true,
            headers : {
                'x-custom-header' : 'ajax'
            }
        } ).then( response => {
            expect( response ).toEqual( {
                query : {
                    x : '1',
                    y : '2'
                },
                method : 'get',
                header : 'ajax'
            } );
            done();
        } ).catch( e => {
            console.log( e.toString() );
        } );
    } );

    it( 'simply get type:json, cache:true', done => {
        const api = `${__yolk__.server}/test/ajax/get?x=1&y=2`;
        biu.get( api, {
            cache : true,
            type : 'json',
            headers : {
                'x-custom-header' : 'ajax'
            }
        } ).then( response => {
            expect( response ).toEqual( {
                query : {
                    x : '1',
                    y : '2'
                },
                method : 'get',
                header : 'ajax'
            } );
            done();
        } ).catch( e => {
            console.log( e.toString() );
        } );
    } );

    //it( 'simply get cache:false', done => {
        //const api = `${__yolk__.server}/test/ajax/get?x=1&y=2`;
        //biu.get( api, {
            //type : 'json',
            //headers : {
                //'x-custom-header' : 'ajax'
            //}
        //} ).then( response => {
            //console.log( response );
            //expect( response.nocache ).toMatch( /^_\d+$/ );
            //done();
        //} ).catch( e => {
            //console.log( e.toString() );
        //} );
    //} );

    //it( 'simply get cache:false', done => {
        //const api = `${__yolk__.server}/test/ajax/get?x=1&y=2`;
        //biu.get( api, {
            //type : 'json',
            //headers : {
                //'x-custom-header' : 'ajax'
            //}
        //} ).then( response => {
            //expect( response.nocache ).toMatch( /^_\d+$/ );
            //done();
        //} ).catch( e => {
            //console.log( e.toString() );
        //} );
    //} );

    it( 'simply get for raw body', done => {
        const api = `${__yolk__.server}/test/ajax`;
        biu.get( api, {
            rawBody : true,
            headers : {
                'x-custom-header' : 'ajax'
            }
        } ).then( response => {
            expect( response ).toEqual( 'body' );
            done();
        } ).catch( e => {
            console.log( e.toString() );
        } );
    } );

    it( 'simply get for rull response', done => {
        const api = `${__yolk__.server}/test/ajax`;
        biu.get( api, {
            fullResponse : true,
            type : 'json',
            headers : {
                'x-custom-header' : 'ajax'
            }
        } ).then( response => {
            expect( response instanceof Response ).toBeTruthy();
            expect( response.status ).toEqual( 200 );
            done();
        } ).catch( e => {
            console.log( e.toString() );
        } );

    } );
} );

describe( 'biu.get with localcache', () => {
    it( 'get from cache', done => {
        const api = `${__yolk__.server}/test/ajax/get?x=1&y=2`;

        const options = {
            fullResponse : true,
            localcache : {
                page : true
            }
        };

        const sequence = new Sequence( [
            () => {
                return biu.get( api, options );
            },
            () => {
                return biu.get( api, options  )
            },
            result => {
                const response = result.value;
                expect( response instanceof Response ).toBeTruthy();
                expect( response.status ).toEqual( 200 );
                expect( response.statusText ).toEqual( 'From LocalCache' );
                done();
            }
        ] );

        sequence.on( 'failed', e => {
            console.log( 'Failed: ', e );
        } );
    } );

    it( 'get from cache', done => {
        const api = `${__yolk__.server}/test/ajax/get?x=1&y=2&m=abc`;

        const options = {
            fullResponse : true,
            localcache : {
                persistent : true
            }
        };

        const sequence = new Sequence( [
            () => {
                return biu.get( api, options );
            },
            () => {
                return biu.get( api, options  )
            },
            result => {
                const response = result.value;
                expect( response instanceof Response ).toBeTruthy();
                expect( response.status ).toEqual( 200 );
                expect( response.statusText ).toEqual( 'From LocalCache' );
                done();
            }
        ] );

        sequence.on( 'failed', e => {
            console.log( 'Failed: ', e );
        } );
    } );

    it( 'using localcache with validate conditions.', done => {
        const api = `${__yolk__.server}/test/ajax/get?x=1&y=2&z=3`;

        const options = {
            fullResponse : true,
            localcache : {
                page : {
                    lifetime : 1
                }
            }
        };

        const sequence = new Sequence( [
            () => {
                return biu.get( api, options );
            },
            () => {
                return biu.get( api, options  )
            },
            result => {
                const response = result.value;
                expect( response instanceof Response ).toBeTruthy();
                expect( response.status ).toEqual( 200 );
                expect( response.statusText ).toEqual( 'OK' );
                done();
            }
        ], { interval : 1 } );

        sequence.on( 'failed', e => {
            console.log( 'Failed: ', e );
        } );
    } );

    it( 'to check data in localcache by md5', done => {
        const api = `${__yolk__.server}/test/ajax/md5?x=1&y=2&z=3&m=4`;

        const options = {
            fullResponse : true,
            localcache : {
                page : {
                    md5 : true
                },
                md5 : '44899742450bdb319a869ed7438a61c6'
            }
        };

        const sequence = new Sequence( [
            () => {
                return biu.get( api, options );
            },
            () => {
                return biu.get( api, options  )
            },
            result => {
                const response = result.value;
                expect( response instanceof Response ).toBeTruthy();
                expect( response.status ).toEqual( 200 );
                expect( response.statusText ).toEqual( 'From LocalCache' );
                done();
            }
        ], { interval : 1 } );

        sequence.on( 'failed', e => {
            console.log( 'Failed: ', e );
        } );
        
    } );

    it( 'to get data in localcache by wrong md5', done => {
        const api = `${__yolk__.server}/test/ajax/md5?x=1&y=2&z=3&m=4&n=5`;

        const options = {
            fullResponse : true,
            localcache : {
                page : {
                    md5 : true
                },
                md5 : '44899742450bdb319a869ed7438a61c7'
            }
        };

        const sequence = new Sequence( [
            () => {
                return biu.get( api, options );
            },
            () => {
                return biu.get( api, options  )
            },
            result => {
                const response = result.value;
                expect( response instanceof Response ).toBeTruthy();
                expect( response.status ).toEqual( 200 );
                expect( response.statusText ).toEqual( 'OK' );
                done();
            }
        ], { interval : 1 } );

        sequence.on( 'failed', e => {
            console.log( 'Failed: ', e );
        } );
        
    } );

} );

describe( 'biu.post', () => {

    it( 'post urlencoded', done => {
        const api = `${__yolk__.server}/test/ajax/post?x=1&y=2`;
        biu.post( api, {
            data : new URLSearchParams( {
                m : 1,
                n : 2
            } ).toString(),
            headers : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'x-custom-header' : 'ajax'
            }
        } ).then( response => {
            expect( response ).toEqual( {
                query : {
                    x : '1',
                    y : '2'
                },
                method : 'post',
                header : 'ajax',
                body : {
                    m : '1',
                    n : '2'
                }
            } );
            done();
        } ).catch( e => {
            console.log( e );
        } );
    } );

    it( 'post text/plain', done => {
        const api = `${__yolk__.server}/test/ajax/post?x=1&y=2`;
        biu.post( api, {
            data : 'ajax',
            headers : {
                'Content-Type' : 'text/plain'
            }
        } ).then( response => {
            expect( response ).toEqual( {
                query : {
                    x : '1',
                    y : '2'
                },
                method : 'post',
                body : 'ajax'
            } );
            done();
        } ).catch( e => {
            console.log( e );
        } );
    } );

    it( 'post multipart/form-data', done => {
        const formdata = new FormData();
        formdata.append( 'x', 1 );
        formdata.append( 'y', 2 );

        const api = `${__yolk__.server}/test/ajax/formdata?x=1&y=2`;
        biu.post( api, {
            data : formdata,
            headers : {
                'content-type' : 'multipart/form-data'
            }
        } ).then( response => {
            expect( response ).toEqual( {
                query : {
                    x : '1',
                    y : '2'
                },
                method : 'post',
                body : {
                    x : '1',
                    y : '2'
                }
            } );
            done();
        } ).catch( e => {
            console.log( e );
        } );
    } );

} );
