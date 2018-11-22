export default ( chain, data, sp = '.'  ) => {
    var tmp = data || window;
    for( let item of chain.split( sp ) ) {
        if( typeof ( tmp = tmp[ item ] ) === 'undefined' ) return tmp;
    }
    return tmp;
}
