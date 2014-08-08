/**
 * Tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

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

var r = routerSort.create();
r.get('/:code', function () {});
r.get('/hello/world', function () {});
r.all('/hello', function fuck () {});
r.file(__filename).get('/hello', function () {});
r.file(__filename).get('/hello/*', function () {});
r.file(__filename).get('/hello/:type', function () {});
r.file(__filename).get('/hello/google', function () {}, function hi () {});

r.sort();
console.log(jsonStringify(r._data.get, 2));
console.log(jsonStringify(r.getRoutes().map(function (item) {
  return item.method + ' ' + item.path;
}), 2));

app = require('express')();
r.register(app);
//console.log(app._router.stack);
