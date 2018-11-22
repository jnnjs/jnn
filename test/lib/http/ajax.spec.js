import ajax from '../../../src/lib/http/ajax';

describe( 'ajax', () => {

    describe( 'real request', () => {
        
        it( 'get', done => {
            const api = `${ynn.host}/http/ajax/get?x=1&y=2`;
            ajax( api, {
                headers : {
                    'x-custom-header' : 'ajax'
                }
            } ).then( response => {
                expect( response.status ).toEqual( 200 );
                expect( JSON.parse( response.body ) ).toEqual( {
                    query : {
                        x : '1',
                        y : '2'
                    },
                    method : 'get',
                    header : 'ajax'
                } );
                done();
            } ).catch( e => {
                console.log( e );
            } );
        } );

        it( 'get 404', done => {
            const api = `${ynn.host}/http/ajax/notfound`;
            ajax( api, {
                headers : {
                    'x-custom-header' : 'ajax'
                }
            } ).then( response => {
                expect( response.status ).toEqual( 404 );
                done();
            } ).catch( e => {
                console.log( e );
            } );
        } );

        it( 'post urlencoded', done => {
            const api = `${ynn.host}/http/ajax/post?x=1&y=2`;
            ajax( api, {
                method : 'post',
                data : new URLSearchParams( {
                    m : 1,
                    n : 2
                } ).toString(),
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded',
                    'x-custom-header' : 'ajax'
                }
            } ).then( response => {
                expect( response.status ).toEqual( 200 );
                expect( JSON.parse( response.body ) ).toEqual( {
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
            const api = `${ynn.host}/http/ajax/post?x=1&y=2`;
            ajax( api, {
                method : 'post',
                data : 'ajax',
                headers : {
                    'Content-Type' : 'text/plain'
                }
            } ).then( response => {
                expect( response.status ).toEqual( 200 );
                expect( JSON.parse( response.body ) ).toEqual( {
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

            const api = `${ynn.host}/http/ajax/formdata?x=1&y=2`;
            ajax( api, {
                method : 'post',
                data : formdata,
                headers : {
                    'content-type' : 'multipart/form-data'
                }
            } ).then( response => {
                expect( response.status ).toEqual( 200 );
                expect( JSON.parse( response.body ) ).toEqual( {
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

        it( 'onprogress', () => {
            
        } );

        /**
        it( 'post multipart/form-data with attachements', done => {

            const formdata = new FormData();
            formdata.append( 'x', 1 );
            formdata.append( 'y', 2 );

            const api = config.api + '/formdata?x=1&y=2';
            ajax( api, {
                method : 'post',
                data : formdata,
                headers : {
                    'content-type' : 'multipart/form-data'
                }
            } ).then( response => {
                expect( response.status ).toEqual( 200 );
                expect( JSON.parse( response.body ) ).toEqual( {
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
        */

    } );

    describe( 'mock', () => {
       
        beforeAll( () => jasmine.Ajax.install() );
        afterAll( () => jasmine.Ajax.uninstall() );

        it( 'should have used customized headers', () => {
            const api = `${ynn.host}/http/ajax/get?x=1&y=2`;
            ajax( api, {
                headers : {
                    'x-custom-header' : 'ajax'
                }
            } )
            const request = jasmine.Ajax.requests.mostRecent();
            expect( request.url ).toEqual( `${ynn.host}/http/ajax/get?x=1&y=2` );
            expect( request.requestHeaders[ 'x-custom-header' ] ).toEqual( 'ajax' );
        } );

        it( 'should request to a correct address', () => {

            const api = `${ynn.host}/http/ajax/get?x=1&y=2`;
            ajax( api, {
                params : {
                    x : 2,
                    z : 3
                }
            } )
            const request = jasmine.Ajax.requests.mostRecent();
            expect( request.url ).toEqual( `${ynn.host}/http/ajax/get?x=2&y=2&z=3` );
        } );

        it( '', () => {
            const api = `${ynn.host}/http/ajax/get?x=1&y=2`;
            ajax( api, {
                method : 'POST',
                params : {
                    x : 2,
                    z : 3
                },
                data : {
                    m : 1,
                    n : 2
                }
            } )
            const request = jasmine.Ajax.requests.mostRecent();
            expect( request.url ).toEqual( `${ynn.host}/http/ajax/get?x=2&y=2&z=3` );
            expect( request.params ).toEqual( {
                m : 1,
                n : 2
            } ); 
        } );
    } );
} );
