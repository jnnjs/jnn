import Base from '../core/base';
import Sequence from './util/sequence';
import http from '../lib/http';
import config from './config';

const sequence = new Sequence();
const scripts = {};

export default class extends Base {
    constructor( url, options = {} ) {
        url = new URL( url, options.base || location.href );
        url.searchParams.sort();

        if( scripts[ url.toString() ] ) {
            return scripts[ url.toString() ];
        }

        super();
        scripts[ url.toString() ] = this;
        Object.assign( this, config, options );
        this.url = url;
    }

    _initLoad() {
        let resolve;
        const url = this.url.toString();
        const promise = new Promise( r => { resolve = r } );
        const head = document.head;
        const baseElem = document.getElementsByTagName( 'base' )[ 0 ];
        const node = document.createElement( 'script' );
        node.type = this.type;
        node.charset = this.charset; 
        node.async = this.async;

        node.setAttribute( 'data-src', url );

        /**
         * if the script need to be loaded as an external file by <script src="{{url}}"></script>
         * just append the node into dom tree, but the Script class should be READY after loading the script content.
         */
        if( external ) {
            node.addEventListener( 'load', () => { resolve( node ) } );
            node.src = url;
            baseElem ? head.insertBefore( node, baseElem ) : head.appendChild( node );
            return promise;
        }

        /**
         * for scripts which would be loaded with AJAX (external option is false), all scripts should be loaded parallel but be executed in sequence.
         */
        const localcache = Object.assign( {}, {
            mime : 'application/javascript',
            type : 'js'
        }, this.localcache );

        sequence.append( () => {
            http.get( url, { localcache } ).then( response => {
                node.text = response;
                head.appendChild( node );
                node.setAttribute( 'data-from-cache', 1 );
                resolve( node );
            } );
            return promise;
        } );
        return promise;
    }
}
