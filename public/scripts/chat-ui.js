/**
 * Created by lostexin on 2017/12/3.
 */

var chatUI = (function () {
    // 初始化UI
    initUi();
    // 绑定艾特事件
    aimAt();

    function initUi() {
        var comShow = false,
            comList = $(".commandlist");

        // 事件绑定
        // 命令提示
        $(".u-command").on("click", function (e) {
            e.stopPropagation();    // 阻止事件冒泡
            if (!comShow){
                comList.fadeIn("fast");
                comShow = true;
            }else {
                comList.fadeOut("fast");
                comShow = false;
            }
        });
        $(document).on("click", function () {
            comList.fadeOut("fast");
            comShow = false;
        });
        // 换行
        $(".u-newline").on("click", function () {
            $(".typeinput").val(function (index, origin) {
                return origin + "\n";
            }).focus();
        });

        $(".fa-info-circle").on("click", function () {
           $(".m-info-panel").addClass("f-elastic-show");
        });
        $(".u-close").on("click", function () {
           $(".m-info-panel").removeClass("f-elastic-show");
        });

        // skin
        var light = true,
            skin = $("<link>").attr({
                rel: "stylesheet",
                href: "css/skin.css",
                "data-skin": "light"
            });
        $(".f-skin").find("i").on("click", function () {
            if (light){
                $("[data-skin='light']").remove();

                $(this).attr({
                    class: "fa fa-sun-o",
                    title: "亮色系界面"
                });
                light = false;
            }else {
                $("head").append(skin);

                $(this).attr({
                    class: "fa fa-moon-o",
                    title: "暗色系界面"
                });
                light = true;
            }
        });

        // 显示/隐藏右边栏
        var show = false;
        $(".u-listbtn").on("click", function () {
           if (!show){
               $(this).addClass("f-showbar");
               $(".m-room-r").css("right", "0");
               show = true;
           }else {
               $(this).removeClass("f-showbar");
               $(".m-room-r").css("right", "-202px");
               show = false;
           }
        });
        $(window).on("resize", function () {    // 窗口发生变化时
           var pageWidth = getViewSize().pageWidth;
           if (pageWidth > 768){   // >768显示右边栏
               $(".u-listbtn").removeClass("f-showbar");
               $(".m-room-l").css("right", "200px");
               $(".m-room-r").css("right", "0");
           }else {                  // <=768隐藏右边栏
               $(".u-listbtn").removeClass("f-showbar");
               show = false;
               $(".m-room-l").css("right", "0");
               $(".m-room-r").css("right", "-202px");
           }
        });
    }

    // 艾特事件绑定
    function aimAt() {
        // 解绑事件(还原)
        $(".username, .u-aimat").off();

        // @someone
        $(".username").on("click", function () {
            var old = $(".typeinput").val();
            $(".typeinput").val(old + "@" + $(this).text() + " ").focus();
        });
        // @
        $(".u-aimat").on("click", function () {
            var old = $(".typeinput").val();
            $(".typeinput").val(old + "@").focus();
        });
    }

    /**
     * 获取页面可视窗口大小
     * @returns {{pageWidth: Number, pageHeight: Number}}
     */
    function getViewSize() {
        // IE9+等其它主流浏览器
        var pageWidth = window.innerWidth,
            pageHeight = window.innerHeight;

        // IE和其它主流浏览器
        if (typeof pageWidth != "number"){
            // CSS1Compat 为标准模式 BackCompat 为混杂模式
            if (document.compatMode == "CSS1Compat"){
                pageWidth = document.documentElement.clientWidth;
                pageHeight = document.documentElement.clientHeight;
            }else {
                pageWidth = document.body.clientWidth;
                pageHeight = document.body.clientHeight;
            }
        }

        return {
            pageWidth: pageWidth,
            pageHeight: pageHeight
        }
    }

    return {
        aimAt: aimAt
    }
})();