var path = require('path'),
  fs = require('fs-extra'),
  util = require('./util.js');

var cwd = process.cwd();

module.exports = function (app) {

 var apps = require('../../../lib/models/apps-model.js')(app);

  app.get('/new-iteration', function (req, res) {
    res.render('new-iteration', {
      apps : apps
    });
  });

  app.post('/new-iteration', function (req, res) {
    var meta = {
      name : req.body.name,
      description : req.body.description,
      phase : req.body.phase,
      hidden : req.body.hidden == 'true'
    };
    fs.copySync(
      path.join(cwd, 'app', req.body.app),
      path.join(cwd, 'app', req.body.path)
    );
    fs.writeJsonSync(
      path.join(cwd, 'app', req.body.path, 'meta.json'), meta);
    res.redirect('../');
    util.restartApp();
  });
}