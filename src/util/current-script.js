export default () => {
    return document.currentScript || ( () => {
        const scripts = document.scripts;

        for( let i = 0, l = scripts.length; i < l; i += 1 ) {
            if( scripts[ i ].readyState === 'interactive' ) {
                return scripts[ i ];
            }
        }

        try { [ November, 8 ] } catch( e ) { // eslint-disable-line
            if( 'stack' in e ) {
                for( let i = 0, l = scripts.length; i < l; i += 1 ) {
                    if( scripts[ i ].src === e.stack.split( /at\s+|@/g ).pop().replace( /:[\d:\s]+?$/, '' ) ) {
                        return scripts[ i ];
                    }
                }
            }
        }
        return null;
    } )();
}
