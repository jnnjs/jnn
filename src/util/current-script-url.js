import currentScript from './current-script';

export default () => {
    const script = currentScript(); 

    if( !script ) {
        throw new TypeError( 'Please don\'t use "currentScriptURL" in asynchronous function.' );
    }

    const src = script.getAttribute( 'data-src' ) || script.src;
    const href = location.href;
    return src ? new URL( src, href ).toString() : href;
}
