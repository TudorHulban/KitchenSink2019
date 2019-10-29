let dbInfo = new HandlerDB(dbType.SQLite, "x.dbf", "127.0.0.1");

function getNow() {
    const now = new Date();
    return now.getSeconds() + ":" + now.getMilliseconds();
}

function cbLog(...pWhat) { console.log(getNow(), "cb:", pWhat) };

const existsTable = async function(pDB, pTable, pCallback) {
    cbLog("2");
    const sql = "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='" + pTable + "';";
    let exists = await pDB.get(sql, [], (e, r) => {
        pCallback("1:", r, Object.values(r)[0]);
        return Object.values(r)[0];
    });
    let result = await exists;
    return result;
};

console.log(getNow(), "x1: ");
let x = existsTable(dbInfo.Handler(), "data", cbLog).then((r) => { cbLog("resolved:", r, Object.values(r)[0]) });
cbLog("after:", x);