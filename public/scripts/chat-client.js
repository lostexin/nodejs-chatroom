// chat-client.js 处理客户端聊天功能逻辑

var socket = io(/* defaults to window.location */);
// console.log(location.href);

$(function () {
    var username = null,
        chat = new Chat(socket);    // 实例化一个chat对象

    // 按Enter键进入聊天室
    $(".u-token").on("keydown", function (e) {
        if (e.keyCode === 13){
            if ($(this).val() && $(this).val().length <= 15){
                socket.emit("assign-username", {
                   username: $(this).val()
                });

                username = $(this).val();
            }else if (!$(this).val()){
                $(".u-userinfo").find(".error").text("不能为空哦~");
            }else if ($(this).val().length > 15){
                $(".u-userinfo").find(".error").text("用户名过长啦::> <::");
            }
        }
    });
    $(".u-token").on("input propertychange selectionchange", function () {
        if ($(this).val() && $(this).val().length <= 15){
            $(".u-userinfo").find(".error").text("");
        }else if (!$(this).val()){
            $(".u-userinfo").find(".error").text("不能为空哦~");
        }else if ($(this).val().length > 15){
            $(".u-userinfo").find(".error").text("用户名过长啦::> <::");
        }
    });

    // 判断连接是否成功
    socket.on("connectResult", function (result) {
       if (result.success){
           console.log("\n%c" + username, "padding: 4px 12px; border-radius: 3px; background: #24272A; color: #fff", "已经连接\n");

           // $(".u-chatframe").empty();
           $(".m-mask").fadeOut("fast");
       }
    });

    // 房间变化结果
    socket.on("joinResult", function (result) {
        console.log("\n%c" + result.room, "padding: 4px 12px; border-radius: 3px; background: #24272A; color: #fff", "<----> 当前房间\n");
    });

    // 接收广播消息
    socket.on("message", function (message) {
       addBroadcastBlock(message);

       scrollToBottom($(".u-chat").find(".scroller-wrapper"));
    });

    // 接收聊天消息
    socket.on("chatMes", function (message) {
        console.log("\n发送人: " + message.username + "\n发送信息: " + message.content + "\n发送时间: " + message.sendtime + "\n");
        addChatBlock(message);

        scrollToBottom($(".u-chat").find(".scroller-wrapper"));
    });

    $(".typeinput").on("keydown", function (e) {
        if ($(this).val().trim()){
            if (e.ctrlKey && e.keyCode === 13){
                // console.log("test");
                // var old = $(this).val();
                $(this).val(function (index, origin) {
                    return origin + "\n";
                });
            }else if (e.keyCode === 13){
                e.preventDefault(); // 阻止换行

                console.log("\n%csend\n", "padding: 4px 12px; border-radius: 3px; background: #24272A; color: #fff");
                var content = $(this).val(),
                    room = $(".u-cur-room").text(),
                    now = new Date(),
                    hour = now.getHours() > 9 ? now.getHours() : "0" + now.getHours(),
                    min = now.getMinutes() > 9 ? now.getMinutes() : "0" + now.getMinutes(),
                    sendtime = hour + ":" + min;

                chat.sendMessages(room, content, sendtime);
                $(this).val("");    // 清空
            }
        }else {
            if (e.ctrlKey && e.keyCode === 13){
                // console.log("test2");
                $(this).val(function (index, origin) {
                    return origin + "\n";
                });
            }else if (e.keyCode === 13){
                e.preventDefault(); // 阻止换行
            }
        }
    });
});

function Chat(socket) {
    this.socket = socket;
}
/**
 * 发送聊天消息
 * @param room 房间名
 * @param content 发送消息的内容
 * @param sendtime 发送时间
 */
Chat.prototype.sendMessages = function (room, content, sendtime) {
    this.socket.emit("chatMes",{
        room: room,
        content: content,
        sendtime: sendtime
    });
}

function addBroadcastBlock(mes) {
    var div = $("<div></div>").addClass("u-broadblock"),
        ul = $("<ul></ul>"),
        user = $("<li></li>").addClass("username").text(mes.username),
        info = $("<li></li>").text("已经进入房间, 当前房间人数: " + mes.num);

    $(".u-chatframe").append(
        div.append(ul.append(user, info))
    );

    chatUI.aimAt(); // 绑定艾特事件
}

function addChatBlock(mes) {
    var div = $("<div></div>").addClass("u-chatblock"),
        ul = $("<ul></ul>"),
        user = $("<li></li>").addClass("username").text(mes.username),
        sendtime = $("<li></li>").text(mes.sendtime),
        pra = $("<p></p>").text(mes.content);

    $(".u-chatframe").append(
        div.append(
            ul.append(user, sendtime), pra
        )
    );

    chatUI.aimAt(); // 绑定艾特事件
}

// 滚动条滚到底部
function scrollToBottom(which) {
    which.scrollTop(
        which.get(0).scrollHeight
    );
}

