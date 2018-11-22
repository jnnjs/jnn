import Module from './module';

function load( url ) {
    return Script.create( url );
}

export default function( urls ) {
    if( !Array.isArray( urls ) ) {
        return load( urls );
    }

    const promises = [];

    for( const url of urls ) {
        promises.push( load( url ) ); 
    }

    return Promise.all( promises );
}
