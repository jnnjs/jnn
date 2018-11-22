import buble from 'rollup-plugin-buble';

export default [ {
    input : 'src/index.js',
    output : [
        { file : 'dist/index.cjs.js', format : 'cjs' },
        { file : 'dist/index.js', format : 'umd', name : 'Jnn' }
    ]
}, {
    input : 'src/index.js',
    plugins : [
        buble( {
            transforms : {
                dangerousForOf : true
            }
        } )
    ],
    output : [
        { file : 'dist/index.bc.js', format : 'umd', name : 'Jnn' }
    ]
} ];
