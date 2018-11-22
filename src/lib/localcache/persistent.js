import Storage from './storage';
import IDB from './IDB';

let Persistent = Storage;

if( window.indexedDB ) {
    Persistent = IDB;
}

export default Persistent;
