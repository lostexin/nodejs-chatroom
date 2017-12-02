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
    // console.log(mime.getType(path.basename(filepath))); // text/html
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
    }else {
        filepath = "public" + req.url;
    }

    serveStatic(res, cache, filepath);
}).listen(3000, function () {
    console.log("服务器在本地3000端口启动");
});

