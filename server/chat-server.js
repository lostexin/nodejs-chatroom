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
          userNames[socket.id] = info.username;
          nameUsed.push(info.username);

          socket.emit("connectResult", {
             success: true
          });

          joinRoom(socket, "大厅");

          handleChatMessages(socket);
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

// 处理聊天消息
function handleChatMessages(socket) {
    // 接收(监听)发送的聊天消息
    socket.on("chatMes", function (message) {
        console.log(message);
        // 向当前房间中的所有客户端发送chatMes(注意这里是io或者io.sockets)
        io.sockets.in(message.room).emit("chatMes",{
            content: message.content,
            username: userNames[socket.id],
            sendtime: message.sendtime
        });
    });
}

