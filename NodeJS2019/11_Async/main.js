function getNow() {
    const now = new Date();
    return now.getSeconds() + ":" + now.getMilliseconds();
};

function cbLog(...pWhat) { console.log(getNow(), "cb:", pWhat) };

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('x.db');
const sql = "select sqlite_version() vers";

let x = function f(pSQL) {
    let promise = new Promise((res, rej) => {
        db.get(pSQL, [], (err, row) => {
            res(row);
            rej(err);
        });
        db.close();
    });
    return promise;
}

cbLog("1")
x(sql).then((r) => { cbLog("resolved: ", Object.values(r)[0]) });
cbLog("2");