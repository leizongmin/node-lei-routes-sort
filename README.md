只需要增加两行代码，轻松解决路由冲突！
========

当你注册路由顺序为

+ /hello/:name
+ /hello/world

那么， `/hello/world` 基本上不会执行了，因为 `/hellp/:name` 已经覆盖了它。

这个模块可以使你不用担心顺序问题，它会自动帮你调整为

+ /hello/world
+ /hello/:name

---------------------

安装模块：

```bash
$ npm install lei-routes-sort
```

使用方法：

```javascript
var router = require('lei-routes-sort').create();

// 像express那样注册路由
router.get('/hello/world', function (req, res, next) { });
router.get('/hello/nodejs', function (req, res, next) { }, function (req, res, next) { });

// 如果你是自动注册路由，为了方便出错时知道是哪个文件，可以这样：
var file1 = router.file('routes/file1.js');
// 还是一样的方法注册路由
file1.get('/hello/file1', function (req, res, next) { });

// 最后，整理一下路由顺序，注册到express中
var app = express();
router.register(app);
```

原理：

+ 对path的调整：  `string` > `:param` > `*`
+ 对请求方法的调整： `all`放在最后，其他不变
+ 不允许有两个完全相同的路由
