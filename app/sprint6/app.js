var app = require('../../lib/subapp.js')(__dirname),
  _ = require('lodash');

app.post('/business-matching/activities', function (req, res) {
  var sections = require('./sections.js');
  req.session.sections = [].concat(
      sections[0],
      [].concat(req.body.activities).reduce(function (m, n) {
        var e = sections[1][n];
        if (e) {
          return m.concat(e);
        } else {
          return m;
        }
      }, []),
      sections[2]
    );
  res.redirect(req.body['next-page']);
});

app.post('/:section/summary', function (req, res) {
  var sections = req.session.sections.map(
    function (e) {
      if (e.section === req.params.section) {
        e.status = 'DONE';
      }
      return e;
  });
  req.session.sections = sections;
  res.redirect(
    '../summary'
  );
});

app.post('/:section/:page', function (req, res) {
  var sections = req.session.sections.map(
    function (e) {
      if (e.section === req.params.section) {
        e.status = 'IN PROGRESS';
      }
      return e;
    });
  req.session.sections = sections;
  res.redirect(req.body['next-page']);
});

app.get('/summary', function (req, res) {
  res.render('summary', {
    sections : req.session.sections
  });
});

module.exports = app;