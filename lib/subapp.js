var express = require('express'),
  fs = require('fs-extra'),
  glob = require('glob-all'),
  path = require('path');

// we need the dirname to be passed
// so that we can work out which
// subapp we are
//
// also note that this must be a
// function so that different subapps
// don't end up sharing the same
// app instance
module.exports = function (_dirname) {

  var cwd = process.cwd(),
    app = express(),
    appName = path.basename(_dirname);

  // This try statement is a bit hacky,
  // stops the admin app from complaining
  // that it has no meta.json, probably
  // need to think about refactoring this
  // in a nicer way (TODO)
  try {
    var meta = fs.readJsonSync(
      path.join(_dirname, 'meta.json'));
    app.locals.phase = meta.phase;
    app.locals.isAlpha = meta.phase === 'alpha';
    app.locals.isBeta = meta.phase === 'beta';
  } catch (e) {}

  // set view directories
  app.set('views', glob.sync([
    _dirname + '/views',
    cwd + '/global/views',
    cwd + '/global/template',
    cwd + '/govuk_elements/views'
  ]));

  // set view partials
  function crunchTemplates(viewdirs) {
    return glob.sync(viewdirs.map(function (e) {
      return e + '/**/*.html';
    })).reduce(function (m, file) {
      var relpath = file.replace(/^.*(?:views|template)\/(.*?)\.html/, '$1');
      m[relpath] = relpath;
      return m;
    }, {});
  }
  app.locals.partials = crunchTemplates([
    _dirname + '/views',
    cwd + '/global/views',
    cwd + '/global/template',
    cwd + '/govuk_elements/views'
  ]);

  // app locals
  app.locals.assetPath = '/';
  app.locals.localAssets = '/' + appName + '/public/';

  // set static assets
  app.use('/public',
    express.static(path.join(_dirname, 'public')));

  return app;
}