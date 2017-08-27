var fs = require('fs');
var pathModule = require('path');
var semver = require('semver');

var requiredNodeVersion = fs.readFileSync(pathModule.resolve(__dirname, '..', '..', '.nvmrc'), 'utf-8').trim();

// Pad the contents of .nvmrc with as many times .0 as necessary to form an x.y.z version number
while ((requiredNodeVersion.match(/\./g) || []).length < 2) {
    requiredNodeVersion += '.0';
}
if (semver.lt(process.version, requiredNodeVersion)) {
    require('babel-register');
}
