var _ = require('lodash'),
  path = require('path'),
  fs = require('fs-extra'),
  util = require('./util.js');

var cwd = process.cwd();

module.exports = function (app) {

  var apps = require('../../../lib/models/apps-model.js')(app);

  app.get('/edit-iteration', function (req, res) {
    res.render('edit-iteration-summary', {
      apps : apps
    });
  });

  // boilerplate function for the controllers
  function editIteration(fn) {
    return function (req, res, next) {
      var subapp = _.find(apps, function (e) {
        return e.path === req.params.iteration;
      });
      if (subapp) {
        fn(subapp)(req, res);
      } else {
        next();
      }
    };
  }

  app.get('/edit-iteration/:iteration', editIteration(function (subapp) {
    return function (req, res) {
      res.locals.isAlpha = subapp.phase === 'alpha';
      res.locals.isBeta = subapp.phase === 'beta';
      res.locals.isLive = !(res.locals.isAlpha || res.locals.isBeta);
      res.render('edit-iteration', subapp);
    };
  }));

  app.post('/edit-iteration/:iteration', editIteration(function (subapp) {
    return function (req, res) {
      var meta = {
        name : req.body.name,
        description : req.body.description,
        phase : req.body.phase,
        hidden : req.body.hidden == 'true'
      };
      var newPath = path.join(cwd, 'app', req.body.path);
      fs.writeJsonSync(
          path.join(cwd, 'app', req.params.iteration, 'meta.json'), meta);
      fs.rename(path.join(cwd, 'app', req.params.iteration), newPath);
      res.redirect('../../');
      util.restartApp();
    };
  }));
}