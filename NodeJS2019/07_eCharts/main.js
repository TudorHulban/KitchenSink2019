function getNow() {
    const now = new Date();
    return now.getSeconds() + ":" + now.getMilliseconds();
};

function cbLog(...pWhat) { console.log(getNow(), "cb:", pWhat) };

let fs = require('fs')

let content = (pPath) => fs.readFileSync(pPath, 'utf8');
cbLog(content("sample.csv"));