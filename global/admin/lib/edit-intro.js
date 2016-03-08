var intro = require('../../../lib/models/intro-model.js'),
  _ = require('lodash'),
  path = require('path'),
  fs = require('fs-extra'),
  util = require('./util.js');

var cwd = process.cwd();

module.exports = function (app) {

  app.get('/edit-intro', function (req, res) {
    res.render('edit-intro', {
      intro : intro
    });
  });

  app.post('/edit-intro', function (req, res) {

    var meta = {
      h1: req.body.h1,
      description: req.body.description
    };

    fs.writeJsonSync(path.join(cwd + '/global/admin', 'meta.json'), meta);

    res.redirect('../../');
    util.restartApp();

  });

}