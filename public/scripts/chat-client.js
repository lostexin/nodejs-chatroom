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
           $(".typeinput").focus();
       }else {
           $(".u-userinfo").find(".error").text(result.msg);
       }
    });

    // 房间变化结果
    socket.on("joinResult", function (result) {
        console.log("\n%c" + result.room, "padding: 4px 12px; border-radius: 3px; background: #24272A; color: #fff", "<----> 当前房间\n");
    });

    // 接收广播消息
    socket.on("message", function (message) {
       addBroadcastBlock(message.username, "已进入房间, 当前房间人数: " + message.num);

       scrollToBottom($(".u-chat").find(".scroller-wrapper"));
    });

    // 接收聊天消息
    socket.on("chatMsg", function (message) {
        console.log("\n发送人: " + message.username + "\n发送信息: " + message.content + "\n发送时间: " + message.sendtime + "\n");
        addChatBlock(message);

        scrollToBottom($(".u-chat").find(".scroller-wrapper"));
    });

    // 接收改名结果
    socket.on("cnResult", function (result) {
        if (result.success){
            console.log("\n%c" + result.prevName + " 更名为 " + result.curName, "padding: 4px 12px; border-radius: 3px; background: #24272A; color: #fff");
            addBroadcastBlock(result.prevName, "更名为", result.curName);

            scrollToBottom($(".u-chat").find(".scroller-wrapper"));
        }else {
            addPromptBlock(result.msg);

            scrollToBottom($(".u-chat").find(".scroller-wrapper"));
        }
    });

    // 接收用户断开连接消息
    socket.on("discMsg", function (message) {
        console.log("\n%c" + message.username, "padding: 4px 12px; border-radius: 3px; background: #24272A; color: #fff", "断开连接");
        addBroadcastBlock(message.username, "已断开, 当前房间人数: " + message.num);

        scrollToBottom($(".u-chat").find(".scroller-wrapper"));
    });

    $(".typeinput").on("keydown", function (e) {
        var msg = $(this).val();
        if (msg.trim()){
            if (e.ctrlKey && e.keyCode === 13){
                // console.log("test");
                // var old = $(this).val();
                $(this).val(function (index, origin) {
                    return origin + "\n";
                });
            }else if (e.keyCode === 13){
                e.preventDefault(); // 阻止换行

                if (msg.trim().charAt(0) === "$"){
                    var isCommand = chat.processCommand(msg.trim());
                    if (!isCommand){
                        addPromptBlock("命令无效哦~");

                        scrollToBottom($(".u-chat").find(".scroller-wrapper"));
                    }
                }else {
                    console.log("\n%csend\n", "padding: 4px 12px; border-radius: 3px; background: #24272A; color: #fff");

                    var content = msg,
                        room = $(".u-cur-room").text(),
                        now = new Date(),
                        hour = now.getHours() > 9 ? now.getHours() : "0" + now.getHours(),
                        min = now.getMinutes() > 9 ? now.getMinutes() : "0" + now.getMinutes(),
                        sendtime = hour + ":" + min;

                    chat.sendMessages(room, content, sendtime);
                }

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
 * @param {string} room 房间名
 * @param {string} content 发送消息的内容
 * @param {string} sendtime 发送时间
 */
Chat.prototype.sendMessages = function (room, content, sendtime) {
    this.socket.emit("chatMsg",{
        room: room,
        content: content,
        sendtime: sendtime
    });
}
/**
 * 处理聊天命令
 * @param {string} command 传入可能是命令的字段
 * @returns {boolean}
 */
Chat.prototype.processCommand = function (command) {
    var isCommand = true,
        words = command.split(" "),
        command = words[0].substring(1).toLowerCase();  // 取出命令字段并转换成小写

    switch (command){
        case "cn":  // 更改名字命令
            words.shift();  // 去除数组第一项, 命令项(/命令)
            var name = words.join(" "); // 还原名字
            this.socket.emit("cName", {
               name: name
            });
            break;
        case "cr":
            break;
        case "clear":
            words.shift();
            var noBlank = words.join(" ");
            if (!noBlank){
                $(".u-chatframe").empty();
            }else {
                addPromptBlock("清除失败: clear命令之后不可再跟内容(参数)...");
                scrollToBottom($(".u-chat").find(".scroller-wrapper"));
            }
            break;
        default:    // 无法识别命令
            isCommand = false;
    }

    return isCommand;
}

function addBroadcastBlock(username, text, username2) {
    var div = $("<div></div>").addClass("u-broadblock"),
        ul = $("<ul></ul>"),
        user = $("<li></li>").addClass("username").text(username),
        info = $("<li></li>").text(text);

    $(".u-chatframe").append(
        div.append(ul.append(user, info))
    );

    if (username2){
        var user2 = $("<li></li>").addClass("username").text(username2);
        ul.append(user2);
    }

    chatUI.aimAt(); // 绑定艾特事件
}

function addChatBlock(msg) {
    var div = $("<div></div>").addClass("u-chatblock"),
        ul = $("<ul></ul>"),
        user = $("<li></li>").addClass("username").text(msg.username),
        sendtime = $("<li></li>").text(msg.sendtime),
        pra = $("<p></p>").text(msg.content);

    $(".u-chatframe").append(
        div.append(
            ul.append(user, sendtime), pra
        )
    );

    chatUI.aimAt(); // 绑定艾特事件
}

function addPromptBlock(prompt) {
    var div = $("<div></div>").addClass("u-promptblock"),
        pra = $("<p></p>").text(prompt);

    $(".u-chatframe").append(div.append(pra));
}

// 滚动条滚到底部
function scrollToBottom(which) {
    which.scrollTop(
        which.get(0).scrollHeight
    );
}

