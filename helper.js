const fs = require("fs")
const Ig = require("instagram-web-api")

const cacheDir =  [
    "./src",
    "./src/img",
    "./src/jsonImg",
    "./src/account",
    "./src/caption",
    "./src/accountTarget"
]

module.exports.checkDir = (dir) => new Promise((resolve,rejects) => {
    for (const path of cacheDir) {
        const dir = fs.existsSync(path)
        if(!dir) fs.mkdirSync(path);
    }
    resolve()
})

module.exports.instagram = ({password, username}) => new Ig({password, username, cookieStore: undefined})