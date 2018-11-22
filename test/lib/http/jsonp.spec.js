import jsonp from '../../../src/lib/http/jsonp';    

describe( 'jsonp', () => {
    it( 'jsonp without specifying a callback function name', done => {
        const api = `${ynn.host}/http/ajax/jsonp`;
        jsonp( api, {
            data : {
                x : 1,
                y : 2
            }
        } ).then( response => {
            expect( +response.x ).toBe( 1 );
            expect( +response.y ).toBe( 2 );
            done();
        } ).catch( e => {
            console.log( 'Error: ', e );
        } );
    } );

    it( 'jsonp with specifying a callback function name', done => {
        const api = `${ynn.host}/http/ajax/jsonp`;
        jsonp( api, {
            data : {
                callback : 'xxxxxxxx',
                x : 1,
                y : 2
            }
        } ).then( response => {
            expect( +response.x ).toBe( 1 );
            expect( +response.y ).toBe( 2 );
            done();
        } ).catch( e => {
            console.log( 'Error: ', e );
        } );
    } );

    it( 'removed callback function after executing', done => {
        const api = `${ynn.host}/http/ajax/jsonp`;
        jsonp( api, {
            data : {
                callback : 'xyz'
            }
        } ).then( () => {
            setTimeout( () => {
                expect( window.xyz ).toEqual( undefined );
                done();
            }, 10 );
        } ).catch( e => {
            console.log( 'Error: ', e );
        } );
    } );
} );
