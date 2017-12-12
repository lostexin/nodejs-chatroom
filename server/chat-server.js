// chat-server.js 处理服务端聊天功能的模块
var socketio = require("socket.io"),
    io = null,
    userNames = {}, // 存放用户名
    nameUsed = [],  // 存放已经使用的用户名
    curRoom = {};   // 存放用户当前所在房间

exports.createSocketServer = function (server) {
    // listen方法同实例化一个socketio(Server)对象
    // 也可以使用attach方法
    io = socketio.listen(server);

    // 当有接口(客户client)连接进来时
    io.sockets.on("connection", function (socket) {
        // 记录每个客户的用户名, 并进行后续操作
       socket.on("assign-username", function (info) {
           if (nameUsed.indexOf(info.username) != -1){
                return socket.emit("connectResult", {
                    success: false,
                    msg: "名字被占用啦::> <::"
                });
           }
           socket.emit("connectResult", {
               success: true
           });

           userNames[socket.id] = info.username;
           nameUsed.push(info.username);

           joinRoom(socket, "大厅");

           handleChatMessages(socket);

           handleClientDisconnection(socket);

           handleCommand(socket);
       });
    });
}

// 进入房间
function joinRoom(socket, room) {
    socket.join(room);  // 将用户加进房间
    curRoom[socket.id] = room;

    socket.emit("joinResult", {
        room: room
    });

    var userInRoom = 0;
    // 所有在房间room中的clients
    io.sockets.in(room).clients(function (err, clients) {
        if (err) throw new Error(err);

        userInRoom = clients.length;
        console.log("房间中的用户数: " + userInRoom);

        // Flag: 'broadcast'
        // 向房间room中的所有sockets(除了发送者)发送message
        socket.in(room).emit("message", {
            username: userNames[socket.id],
            num: userInRoom
        });
    });
}

// 处理命令请求
function handleCommand(socket) {
    // 更改用户名
    socket.on("cName", function (req) {
        if (nameUsed.indexOf(req.name) == -1){  // 用户名没有在已使用用户名列表
            var prevName = userNames[socket.id],
                prevNameIndex = nameUsed.indexOf(prevName);

            nameUsed.splice(prevNameIndex, 1);  // 删除之前的用户名
            nameUsed.push(req.name);            // 将新用户名加入已使用用户名列表
            userNames[socket.id] = req.name;    // 更改当前用户名称

            io.sockets.in(curRoom[socket.id]).emit("cnResult", {
                success: true,
                prevName: prevName,
                curName: req.name
            });

            console.log(prevName + " ----> " + req.name);
        }else { // 用户名在已使用用户名列表中
            socket.emit("cnResult", {
                success: false,
                // 判断要更改的名字是否和之前是一样的, 若不是则是被占用的
                msg: userNames[socket.id] == req.name ? "用户名不能跟之前一样- =" : "用户名被占用了::> <::"
            });
        }
    });

    // 更改/创建房间
}

// 处理聊天消息
function handleChatMessages(socket) {
    // 接收(监听)发送的聊天消息
    socket.on("chatMsg", function (message) {
        console.log(message);
        // 向当前房间中的所有客户端发送chatMes(注意这里是io或者io.sockets)
        io.sockets.in(message.room).emit("chatMsg",{
            content: message.content,
            username: userNames[socket.id],
            sendtime: message.sendtime
        });
    });
}

// 处理用户断开连接
function handleClientDisconnection(socket) {
    socket.on("disconnect", function () {
        // console.log("disconnect");
        var nameIndex = nameUsed.indexOf(userNames[socket.id]),
            client = userNames[socket.id];

        nameUsed.splice(nameIndex, 1);   // 在已使用用户列表中删除用户
        delete userNames[socket.id];

        var userInRoom = 0;
        // 所有在房间room中的clients
        io.sockets.in(curRoom[socket.id]).clients(function (err, clients) {
            if (err) throw new Error(err);

            userInRoom = clients.length;
            console.log("房间中的用户数: " + userInRoom);

            // 向用户所在房间的其他用户发送离开信息
            // emit的事件不能是disconnect, 因为客户端也有disconnect事件, 如果客户端监听disconnect事件,
            // 当客户端断开时, 会产生一直调用disconnect回调函数的bug(?)
            socket.in(curRoom[socket.id]).emit("discMsg", {
                username: client,
                num: userInRoom
            });
        });
    });
}

