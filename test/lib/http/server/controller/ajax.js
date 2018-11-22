const auth = require( '@lvchengbin/koa-basic-auth' );

module.exports = class extends require( 'ynn' ).Controller {
    indexAction() {
        return 'body';
    }

    getAction() {
        const ctx = this.ctx;
        const body = {
            method : 'get',
            query : ctx.query,
            header : ctx.request.headers[ 'x-custom-header' ]
        };

        for( let item in ctx.query ) {
            if( /^_\d+/.test( item ) ) {
                body.nocache = item;
            }
        }
        return body;
    }
    postAction() {
        const ctx = this.ctx;
        return {
            method : 'post',
            body : ctx.request.body,
            query : ctx.query,
            header : ctx.request.headers[ 'x-custom-header' ]
        };
    }
    notfoundAjax() {
        this.throw( 404 );
    }

    formdataAction() {
        const ctx = this.ctx;
        return {
            method : 'post',
            body : ctx.request.body,
            query : ctx.query,
            header : ctx.request.headers[ 'x-custom-header' ]
        };
    }

    authAction() {
        const ctx = this.ctx;
        if( !auth( 'n', 'p', ctx ) ) {
            ctx.res.statusCode = 401;
        } else {
            return 'authorized'
        }
    }

    md5Action() {
        return 'biu';
    }

    jsonpAction() {
        this.response( this.ctx.query, 'jsonp' );
    }
}
