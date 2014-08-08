/**
 * Router
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var methods = require('methods');
var debug = require('debug')('lei:routes:sort');


var METHODS = methods.slice(0);
METHODS.push('all');

function arrayLast (arr) {
  return arr[arr.length - 1];
}

function functionName (fn) {
  return fn.name || 'anonymous function';
}


function Router (options) {
  var me = this;
  me._options = options || {};
  me._data = {};
  METHODS.forEach(function (method) {
    me._data[method] = [];
  });
  var router = me.file('anonymous file');
  Object.keys(router).forEach(function (method) {
    me[method] = router[method];
  });
};

Router.prototype.newError = function (msg, a, b) {
  var f1 = a.filename;
  var f2 = b.filename;
  var n1 = functionName(arrayLast(a.fnList));
  var n2 = functionName(arrayLast(b.fnList));
  var lines = [
    msg,
    '    path [' + a.method + '] ' + a.path,
    '    at ' + n1 + ' (' + f1 + ')',
    '    and ' + n2 + ' (' + f2 + ')',
    ''
  ];
  var err = new Error(lines.join('\n'));
  return err;
};

/**
 * 返回一个具有指定文件名前缀的路由对象
 *
 * @param {String} filename
 * @return {Object}
 */
Router.prototype.file = function (filename) {
  var me = this;
  var router = {};
  METHODS.forEach(function (method) {
    router[method] = function () {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(method);
      args.unshift(filename);
      return me.add.apply(me, args);
    };
  });
  return router;
};

/**
 * 添加路由
 *
 * @param {String} filename
 * @param {String} method
 * @param {String} path
 */
Router.prototype.add = function (filename, method, path) {
  var me = this;
  var routes = me._data[method];
  var fnList = Array.prototype.slice.call(arguments, 3);
  if (!Array.isArray(routes)) {
    throw new Error('not support method "' + method + '"');
  }
  if (typeof path !== 'string') {
    throw new Error('missing parameter "path"');
  }

  debug('add [%s] %s (%s)', method, path, filename);

  var parts = path.split('/');
  if (parts[0] === '') {
    parts.shift();
  }
  addIndex(routes, parts, {
    method:   method,
    path:     path,
    fnList:   fnList,
    filename: filename
  });

  function addIndex (routes, parts, data) {
    var name = parts.shift();
    var i = getIndex(routes, name);
    if (i === -1) {
      routes.push(getPartInfo(name));
      i = routes.length - 1;
    }
    if (parts.length < 1) {
      if (routes[i].route) {
        throw me.newError('path conflicts', routes[i].route, data);
      } else {
        routes[i].route = data;
      }
    } else {
      addIndex(routes[i].list, parts, data);
    }
  }

  function getIndex (routes, name) {
    for (var i = 0; i < routes.length; i++) {
      if (routes[i].name === name) {
        return i;
      }
    }
    return -1;
  }

  function getPartInfo (name) {
    var info = {
      name: name,
      list: []
    };
    info.part = (name[0] === ':');
    info.suffix = (name === '*');
    return info;
  }
};

/**
 * 排序
 */
Router.prototype.sort = function () {
  var me = this;
  Object.keys(me._data).forEach(function (method) {
    sort(me._data[method]);
  });

  function sort (list) {
    list.sort(function (a, b) {
      // 有list的在前面
      if (a.list.length > 0) return -1;
      // 非:param和*在前面
      if (!a.part && !a.suffix) return -1;
      if (!b.part && !b.suffix) return 1;
      // :param在前面
      if (a.part && !a.suffix) return -1;
      if (b.part && !b.suffix) return 1;
      // 最后是*
      return 0;
    });
    list.forEach(function (item) {
      if (item.list.length > 0) {
        sort(item.list);
      }
    });
  }
};

/**
 * 提取路由列表
 *
 * @return {Array}
 */
Router.prototype.getRoutes = function () {
  var me = this;

  var ret = [];
  Object.keys(me._data).forEach(function (method) {
    get(me._data[method]);
  });

  // all方法排在最后
  ret.sort(function (a, b) {
    if (a.method !== 'all' && b.method !== 'all') return 0;
    if (a.method === 'all') return 1;
    return -1;
  });

  return ret;

  function get (list) {
    list.forEach(function (item) {
      if (item.route) {
        ret.push(item.route);
      }
      if (item.list.length > 0) {
        get(item.list);
      }
    });
  }
};

/**
 * 注册到express实例
 *
 * @param {Object} app
 */
Router.prototype.register = function (app) {
  var me = this;
  me.sort();
  var routes = me.getRoutes();
  routes.forEach(function (item) {
    var n = functionName(arrayLast(item.fnList));
    debug('register [%s] %s\n      %s (%s)', item.method, item.path, n, item.filename);
    var args = [item.path].concat(item.fnList);
    app[item.method].apply(app, args);
  });
};


/**
 * Create a router instance
 *
 * @return {Object}
 */
Router.create = function () {
  return new Router();
};

exports = module.exports = Router;
