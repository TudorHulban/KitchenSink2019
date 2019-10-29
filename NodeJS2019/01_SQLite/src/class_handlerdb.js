// constructor(pType, pDBName, pIP)
class HandlerDB {
    constructor(pType, pDBName, pIP) {
        this.dbType = pType;
        this.dbName = pDBName;
        this.IP = pIP;
    }
    DSN = function() {
        return this.IP + ":" + this.dbType + ":" + this.dbName
    }
    Handler = function() {
        let sqlite3 = require('sqlite3').verbose();
        return new sqlite3.Database(this.dbName, sqlite3.OPEN)
    }
};