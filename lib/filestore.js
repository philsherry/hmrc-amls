var util = require('util'),
	EventEmitter = require('events'),
	q = require('q'),
	MemoryStore = require('express-session').MemoryStore
	fs = require('fs-extra');

var noop = function () {};

module.exports = function (session) {

	var Store = session.Store;

	function FileStore() {
		Store.call(this, {});
		this.session = null;
	}

	util.inherits(FileStore, Store);

	FileStore.prototype.destroy = function (sid, callback) {
		this.session = null;
		fs.writeJson('./session.json', {}, callback);
	};

	FileStore.prototype.get = function(sid, callback) {
		if (!this.session) {
			this.session = fs.readJsonSync('./session.json');
		}
		callback(null, this.session);
	};

	FileStore.prototype.set = function(sid, session, callback) {
		this.session = session;
		fs.writeJson('./session.json', session, callback);
	};

	return FileStore;
};