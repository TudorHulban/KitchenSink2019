/*
let readRecords = function(pDB, pSQL, callback) {
    pDB.serialize(function() {
        pDB.all(pSQL, function(err, allRows) {
            if (err != null) {
                callback(err);
            }
            console.log("rows:", allRows);
            pDB.close((err) => {
                if (err) {
                    callback(err.message);
                    return
                }
                console.log('Close the database connection.');
            });
        });
    });
};

let createTables = function(pDB) {
    if (!existsTable(pDB, "data")) {
        console.log("create table ...")
        pDB.serialize(function() {
            pDB.run("create table data(id integer primary key, val1 integer, val2 integer);");
        });
    }
};

function callback(pErr) {
    console.log(pErr)
};

*/

//const sql1 = "select sqlite_version() vers";
//const sql2 = "select * from data";