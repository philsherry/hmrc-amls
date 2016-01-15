'use strict';

var gulp = require('gulp'),
  merge = require('merge-stream'),
  q = require('q'),
  gls = require('gulp-live-server'),
  rimraf = require('gulp-rimraf'),
  rename = require('gulp-rename'),
  glob = require('glob-all'),
  path = require('path'),
  fs = require('fs-extra'),
  flatten = require('gulp-flatten'),
  gutil = require('gulp-util'),
  hogan = require('gulp-hogan'),
  sass = require('gulp-sass');


gulp.task('clean', function() {
  return gulp.src([
      __dirname + '/app/**/public',
      __dirname + '/global/public',
      __dirname + '/global/admin/public',
      __dirname + '/global/template'
    ], { read : false})
    .pipe(rimraf({ force : true }))
});

gulp.task('move', function () {
  return gulp.src('node_modules/govuk*/**/*.@(js|css|png|gif|jpg|jpeg|ico)')
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace(/^.*?[\\\/](?:assets)?/, '');
    }))
    .pipe(gulp.dest('global/public'));
});

// This is stupid
gulp.task('template', function () {
  return gulp.src('node_modules/govuk_*/**/layouts/govuk_template.html')
    .pipe(flatten())
    .pipe(hogan({
      assetPath: "{{assetPath}}",
      afterHeader: "{{$afterHeader}}{{/afterHeader}}",
      bodyClasses: "{{$bodyClasses}}{{/bodyClasses}}",
      bodyEnd: "{{$bodyEnd}}{{/bodyEnd}}",
      content: "{{$content}}{{/content}}",
      cookieMessage: "{{$cookieMessage}}{{/cookieMessage}}",
      crownCopyrightMessage: "{{$crownCopyrightMessage}}© Crown copyright{{/crownCopyrightMessage}}",
      footerSupportLinks: "{{$footerSupportLinks}}{{/footerSupportLinks}}",
      footerTop: "{{$footerTop}}{{/footerTop}}",
      globalHeaderText: "{{$globalHeaderText}}GOV.UK{{/globalHeaderText}}",
      head: "{{$head}}{{/head}}",
      headerClass: "{{$headerClass}}{{/headerClass}}",
      homepageUrl: "{{$homepageUrl}}https://www.gov.uk{{/homepageUrl}}",
      insideHeader: "{{$insideHeader}}{{/insideHeader}}",
      licenceMessage: "{{$licenceMessage}}<p>All content is available under the <a href='https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/' rel='license'>Open Government Licence v3.0</a>, except where otherwise stated</p>{{/licenceMessage}}",
      logoLinkTitle: "{{$logoLinkTitle}}Go to the GOV.UK homepage{{/logoLinkTitle}}",
      pageTitle: "{{$pageTitle}}GOV.UK - The best place to find government services and information{{/pageTitle}}",
      propositionHeader: "{{$propositionHeader}}{{/propositionHeader}}",
      skipLinkMessage: "{{$skipLinkMessage}}Skip to main content{{/skipLinkMessage}}"
    }))
    .pipe(rename('govuk_template.html'))
    .pipe(gulp.dest(__dirname + '/global/template'));
});

gulp.task('sass', function () {
  var rtn = glob.sync([
    __dirname + '/app/*',
    __dirname + '/global',
    __dirname + '/global/admin'
  ]).reduce(function (m, app) {
    return m.add(gulp.src(app + '/src/sass/**/*.scss')
      .pipe(sass({
        outputStyle : 'extended',
        includePaths : glob.sync([
          __dirname + '/node_modules/govuk_*/stylesheets',
          __dirname + '/node_modules/govuk-elements-sass/**/sass',
          __dirname + '/lib/sass'
        ])
      }))
      .pipe(gulp.dest(app + '/public/stylesheets')));
  }, merge());
  return rtn ? rtn : null;
});

gulp.task('build', ['sass', 'move', 'template']);

gulp.task('start', ['build'], function () {
  var server = gls.new('start.js', 3000);
  server.start();

  // recompiles sass files on the fly
  gulp.watch('app/**/*.scss', ['sass']);

  // restarts the server when the start file changes
  gulp.watch([
    'start.js',
    'lib/**/*.js',
    '**/app.js'
  ], function () {
    gutil.log('Restarting server...');
    server.start.apply(server);
    gutil.log('Server restarted!');
  });
});

gulp.task('default', ['start']);