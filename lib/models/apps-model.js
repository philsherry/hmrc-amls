var glob = require('glob-all'),
  path = require('path'),
  fs = require('fs-extra');

var cwd = process.cwd();

// this is a lazily-instantiated and cached array of the app models
var model = function (isDev) {
  return glob.sync(cwd + '/app/*').reduce(function (apps, app) {
    var jsn = fs.readJsonSync(path.join(app, 'meta.json'));
    jsn.path = path.basename(app);
    if (isDev || !jsn.hidden) {
        return [].concat(apps, jsn);
    } else {
        return apps;
      }
  }, []);
};

module.exports = model;