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

        $(".fa-info-circle").on("click", function () {
           $(".m-info-panel").addClass("f-elastic-show");
        });
        $(".u-close").on("click", function () {
           $(".m-info-panel").removeClass("f-elastic-show");
        });

        // skin
        var dark = true,
            skin = $("<link>").attr({
                rel: "stylesheet",
                href: "css/skin.css",
                "data-skin": "light"
            });
        $(".f-skin").find("i").on("click", function () {
           if (dark){
                $("head").append(skin);

                $(this).attr({
                    class: "fa fa-moon-o",
                    title: "暗色系界面"
                });
                dark = false;
           }else {
               $("[data-skin='light']").remove();

               $(this).attr({
                   class: "fa fa-sun-o",
                   title: "白色系界面"
               });
               dark = true;
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

    return {
        aimAt: aimAt
    }
})();