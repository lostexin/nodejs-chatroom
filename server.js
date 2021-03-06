/**
 * Created by lostexin on 2017/12/1.
 */

var http = require("http"),
    fs = require("fs"),
    path = require("path"),
    mime = require("mime"),
    cache = {};     // 用来缓存文件内容(访问内存比访问文件系统要快)

// 发送404错误
function send404(res) {
    res.writeHead(404, {
        "Content-Type": "text/html"
    });

    fs.readFile("public/404.html", function (err, data) {
        res.end(data);
    });
}

// 发送文件
function sendFile(res, filepath, filecontent) {
    // console.log(mime.getType(path.basename(filepath)));
    // text/html、text/css、application/javascript、application/font-woff2等
    // 这里唯有返回的html会在浏览器中显示出来, 其它资源请求能在network以及source中看到
    res.writeHead(200, {
       "Content-Type": mime.getType(path.basename(filepath))    // 转换成mime类型
    });

    res.end(filecontent);
}

// 提供静态文件服务
function serveStatic(res, cache, filepath) {
    if (cache[filepath]){   // 文件在缓存中
        sendFile(res, filepath, cache[filepath]);
    }else {     // 文件不在缓存中
        fs.readFile(filepath, function (err, data) {
           if (err){
               send404(res);
           }else {
               sendFile(res, filepath, data);
               cache[filepath] = data;  // 缓存文件内容(Buffer类型)
           }
        });
    }
    // console.log(cache);
}

var server = http.createServer(function (req, res) {
    var filepath = null;
    // console.log(req.url);   // /......
    if (req.url == "/"){
        filepath = "public/index.html";
    }else {     // 请求其它地址时返回情况
        // 修改前 filepath = "public" + req.url;
        // 当fs读取字体文件时, 由于路径带有版本号(例如 ?v=4.7.0)而字体文件不带, 所以找不到资源(404)
        filepath = "public" + req.url.split("?")[0];
    }

    serveStatic(res, cache, filepath);
}).listen(3000, function () {
    console.log("服务器在本地3000端口启动");
});
// console.log(server);

var chatServer = require("./server/chat-server");
chatServer.createSocketServer(server);


