import is from '../util/is';
import modules from './modules';
import Module from './module';

export default function( id, deps, factory ) {
    /**
     * anonymous module
     */
    if( !is.string( id ) ) {
        factory = deps;
        deps = id;
        id = null; 
    }

    if( !Array.isArray( deps ) ) {
        factory = deps;
        deps = null;
    }

    if( Array.isArray( deps ) ) {
    }
}
