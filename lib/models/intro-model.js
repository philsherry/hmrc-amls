var glob = require('glob-all'),
    path = require('path'),
    fs   = require('fs-extra');

var cwd = process.cwd();

var model = (function () {
  return fs.readJsonSync(path.join(cwd + '/global/admin', 'meta.json'));
})();

module.exports = model;