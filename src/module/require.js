import is from './util/is';

function loadDeps( deps ) {
    
}

function define( deps, factory ) {
    if( is.function( deps ) ) {
        factory = deps;
        deps = null;
    }
}

export default define;
