var app = require('../../lib/subapp.js')(__dirname),
  _ = require('lodash');

// AMLS Routes
app.post('/business-activities/business-type', function (req, res) {
  req.session.sections =
    _.chain(require('./sections.js').slice())
    .filter(function (e, i) {
      return i > 1 && i < 9 ?
        _.find(req.body.activities, function (section) {
          return section == i;
        }) : true;
    })
    .value();

  res.redirect('../summary');
});

function getUrl(arr, memo) {
  var m = memo || '/';
  return arr.reduce(function (m, n, i) {
    return i === 0 ?
      m + n :
      m + '/' + n;
  }, m);
}

function fromReq(req, memo) {
  return getUrl([
    req.params.sprint,
    req.params.section,
    req.params.page
  ], memo);
}

function toFilePath(p) {
  return path.join.apply(null, p.split('/'));
}

function getSection(sections, section) {
  var sections = sections.entries(), current;
  do {
    current = sections.next();
    if (current.value[1].section === section)
      return [current, sections];
  } while (!current.done)
}

function nextSection(sections, section) {
  return getSection(sections, section)[1]
    .next()
    .value[1];
}

function sectionInProgress(req) {
  var section = getSection(req.session.sections, req.params.section)[0];
  if (section.value[1].status === undefined) {
    req.session.sections[section.value[0]].status = 'IN PROGRESS';
  }
}

function sectionDone(req) {
  var section = getSection(req.session.sections, req.params.section)[0];
  req.session.sections[section.value[0]].status = 'DONE';
}

app.post('/:section/summary', function (req, res) {
  var next = nextSection(req.session.sections, req.params.section);
  sectionDone(req);
  res.redirect(
    '../' + next.link
  );
});

app.post('/:section/:page', function (req, res, next) {
  req.session[req.params.section] = req.session[req.params.section] || {};
  req.session[req.params.section][req.params.page] = req.body;
  var nextPage = req.body['next-page'];
  sectionInProgress(req);
  if (nextPage) {
    res.redirect(nextPage);
  } else {
    next();
  }
});

app.get('/summary', function (req, res) {
  res.render('summary', {
    sections : req.session.sections
  });
});

module.exports = app;