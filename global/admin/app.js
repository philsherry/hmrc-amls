var app = require('../../lib/subapp.js')(__dirname);

require('./lib/new-iteration.js')(app);
require('./lib/edit-iteration.js')(app);
require('./lib/edit-intro.js')(app);

module.exports = app;