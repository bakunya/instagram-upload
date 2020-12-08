const readline = require("readline")

const rl = readline.createInterface({input: process.stdin, output: process.stdout})

const question = (ask) => new Promise(resolve => rl.question(ask, ans => resolve(ans)));

module.exports = {
    rl,
    question
}