var app = require('../../lib/subapp.js')(__dirname),
  _ = require('lodash');

app.post('/pre-application/activities', function (req, res) {
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

app.post('/:section/check-your-answers', function (req, res) {
  var sections = req.session.sections.map(
    function (e) {
      if (e.section === req.params.section) {
        e.status = 'DONE';
      }
      return e;
  });
  req.session.sections = sections;
  res.redirect(
    '../registration-progress'
  );
});

app.post('/:section/check-your-answers-no-account', function (req, res) {
  var sections = req.session.sections.map(
    function (e) {
      if (e.section === req.params.section) {
        e.status = 'DONE';
      }
      return e;
  });
  req.session.sections = sections;
  res.redirect(
    '../registration-progress'
  );
});

app.post('/:section/your-answers', function (req, res) {
  var sections = req.session.sections.map(
    function (e) {
      if (e.section === req.params.section) {
        e.status = 'DONE';
      }
      return e;
  });
  req.session.sections = sections;
  res.redirect(
    '../amend-your-registration'
  );
});

app.post('/:section/:page', function (req, res) {
  if (req.session.sections) {
    var sections = req.session.sections.map(
      function (e) {
        if (e.section === req.params.section) {
          e.status = 'IN PROGRESS';
        }
        return e;
      });
    req.session.sections = sections;
  }
  res.redirect(req.body['next-page']);
});

app.get('/registration-progress', function (req, res) {
  res.render('registration-progress', {
    complete : req.session.sections.every(function (section) {
      // console.log(section);
      return section.status === 'DONE';
    }),
    sections : req.session.sections
  });
});


app.get('/amend-your-registration', function (req, res) {
  res.render('amend-your-registration', {
    complete : req.session.sections.every(function (section) {
      // console.log(section);
      return section.status === 'DONE';
    }),
    sections : req.session.sections
  });
});

module.exports = app;
