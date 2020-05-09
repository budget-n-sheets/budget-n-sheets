/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

var CacheService2 = {
	document: null,
	script: null,
	user: null,

	loadScope: function(scope) {
		if (this[scope]) return;
		switch (scope) {
		case "document":
			this.document = CacheService.getDocumentCache();
			break;
		case "script":
			this.script = CacheService.getScriptCache();
			break;
		case "user":
			this.user = CacheService.getUserCache();
			break;
		}
	},

	get: function(scope, key, type) {
		this.loadScope(scope);
		var value = this[scope].get(key);
		switch (type) {
		case "number":
			return Number(value);
		case "boolean":
			return value === "true";
		case "json":
			return JSON.parse(value);
		case "string":
		default:
			return value;
		}
	},

	put: function(scope, key, type, value, expiration) {
		this.loadScope(scope);
		if (!expiration) expiration = 600;
		switch (type) {
		case "number":
			value = value.toString();
			break;
		case "boolean":
			value = value ? "true" : "false";
			break;
		case "json":
			value = JSON.stringify(value);
			break;
		case "string":
		default:
			break;
		}
		this[scope].put(key, value, expiration);
	},

	remove: function(scope, key) {
		this.loadScope(scope);
		this[scope].remove(key);
	}
};

/**
 * Gets the cached value for the given key, or null if none is found.
 * @param  {String} method The method to get a cache instance
 * @param  {String} key    The key to look up in the cache
 * @param  {String} type   The type of the value to return
 * @return {Object}        The value associated with the given key in the cache instance
 */
function getCacheService_(method, key, type) {
	var cache;

	switch (method) {
		case "document":
			cache = CacheService.getDocumentCache();
			break;

		case "user":
		default:
			cache = CacheService.getUserCache();
			break;
	}

	switch (type) {
		case "number":
			return Number( cache.get(key) );
		case "string":
			return cache.get(key);
		case "boolean":
			if (cache.get(key) === "true") return true;
			else return false;
		case "obj":
		case "json":
			var p = cache.get(key);
			return JSON.parse( p );

		default:
			return cache.get(key);
	}
}

/**
 * Adds a key/value pair to the cache.
 * @param  {String} method The method to get a cache instance
 * @param  {String} key    The key to store the value under
 * @param  {String} type   The type of the value to convert
 * @param  {Object} value  The value to be cached
 */
function putCacheService_(method, key, type, value, expiration) {
	var cache;

	if (expiration == null) expiration = 600;
	switch (method) {
		case "document":
			cache = CacheService.getDocumentCache();
			break;

		case "user":
		default:
			cache = CacheService.getUserCache();
			break;
	}

	switch (type) {
		case "number":
			cache.put(key, value.toString(), expiration);
			break;
		case "string":
			cache.put(key, value, expiration);
			break;
		case "boolean":
			if (value) cache.put(key, "true", expiration);
			else cache.put(key, "false", expiration);
			break;
		case "obj":
		case "json":
			cache.put(key, JSON.stringify( value ), expiration);
			break;

		default:
			cache.put(key, value, expiration);
			break;
	}
}
