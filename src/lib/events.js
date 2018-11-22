export default class {
    constructor() {
        this.__listeners = new Map();
    }

    $on( evt, handler ) {
        const listeners = this.__listeners;
        let handlers = listeners.get( evt );

        if( !handlers ) {
            handlers = new Set();
            listeners.set( evt, handlers );
        }
        handlers.add( handler );
        return this;
    }

    $once( evt, handler ) {
        const _handler = ( ...args ) => {
            handler.apply( this, args );
            this.$removeListener( evt, _handler );
        };
        return this.$on( evt, _handler );
    }

    $removeListener( evt, handler ) {
        const handlers = this.__listeners.get( evt );
        handlers && handlers.delete( handler );
        return this;
    }

    $emit( evt, ...args ) {
        const handlers = this.__listeners.get( evt );
        if( !handlers ) return false;
        handlers.forEach( handler => handler.call( this, ...args ) );
    }
}
