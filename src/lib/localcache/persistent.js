import LocalStorage from './local-storage';
import IDB from './idb';

/**
 * to use the indexedDB if the client supports indexedDB,
 * other wise, to use localStorage instead.
 */
const Persistent = IDB.isSupported() ? IDB : LocalStorage;
export default Persistent;
