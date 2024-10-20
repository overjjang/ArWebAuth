const crypto = require('crypto');

function generateKey() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = generateKey;

//test
// console.log(generateKey());