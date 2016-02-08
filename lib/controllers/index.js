var fs = require('fs-extra'),
	path = require('path'),
	glob = require('glob-all');

module.exports = function (app) {

	var cwd = process.cwd();
	var model = {
		apps : require('../models/apps-model.js')(app.locals.isDev)
	};

	app.get('/', function (req, res) {
		res.render('index', model);
	});
};