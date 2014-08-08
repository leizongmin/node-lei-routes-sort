/**
 * Tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var assert = require('assert');
var routerSort = require('../');

function jsonStringify (data, space) {
  var seen = [];
  return JSON.stringify(data, function (key, val) {
    if (!val || typeof val !== 'object') {
      return val;
    }
    if (seen.indexOf(val) !== -1) {
      return '[Circular]';
    }
    seen.push(val);
    return val;
  }, space);
};

describe('lei-routes-sort', function () {

  function getRoutesPath (routes) {
    return routes.map(function (item) {
      return item.method + ' ' + item.path;
    });
  }

  it('sort #1', function () {
    var r = routerSort.create();
    var fn = function () {};
    r.get('/hello/world', fn);
    r.get('/hello/*', fn);
    r.get('/hello/:name', fn);
    r.get('/hello/123/456', fn);
    r.sort();
    var paths = getRoutesPath(r.getRoutes());
    assert.deepEqual(paths, [
      'get /hello/world',
      'get /hello/123/456',
      'get /hello/:name',
      'get /hello/*'
    ])
  });

  it('sort #2', function () {
    var r = routerSort.create();
    var fn = function () {};
    r.all('/hello/world', fn);
    r.get('/hello/world', fn);
    r.get('/hello/*', fn);
    r.get('/hello/:name', fn);
    r.get('/hello/123/456', fn);
    r.sort();
    var paths = getRoutesPath(r.getRoutes());
    assert.deepEqual(paths, [
      'get /hello/world',
      'get /hello/123/456',
      'get /hello/:name',
      'get /hello/*',
      'all /hello/world'
    ])
  });

  it('sort #3', function () {
    var r = routerSort.create();
    var fn = function () {};
    r.get('*', fn);
    r.get('/:type', fn);
    r.get('/hello/*', fn);
    r.get('/hello/:name', fn);
    r.get('/hello/123/456', fn);
    r.get('/ok', fn);
    r.sort();
    var paths = getRoutesPath(r.getRoutes());
    assert.deepEqual(paths, [
      'get /hello/123/456',
      'get /hello/:name',
      'get /hello/*',
      'get /ok',
      'get /:type',
      'get *'
    ])
  });

  it('sort #4', function () {
    var r = routerSort.create();
    var fn = function () {};
    r.all('/hi', fn);
    r.get('/hello/world', fn);
    r.post('/hello/*', fn);
    r.head('/hello/:name', fn);
    r.delete('/hello/123/456', fn);
    r.sort();
    var paths = getRoutesPath(r.getRoutes());
    assert.deepEqual(paths, [
      'get /hello/world',
      'post /hello/*',
      'head /hello/:name',
      'delete /hello/123/456',
      'all /hi'
    ])
  });

  it('sort #5', function () {
    var r = routerSort.create();
    var fn = function () {};
    r.get('/hello/world', fn);
    r.file('a.js').get('/hello/*', fn);
    r.get('/hello/:name', fn);
    r.file('b.js').get('/hello/123/456', fn);
    r.sort();
    var paths = getRoutesPath(r.getRoutes());
    assert.deepEqual(paths, [
      'get /hello/world',
      'get /hello/123/456',
      'get /hello/:name',
      'get /hello/*'
    ])
  });

});
