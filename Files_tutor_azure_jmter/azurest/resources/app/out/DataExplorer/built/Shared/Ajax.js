define(["require", "exports", "q"], function (require, exports, Q) {
    "use strict";
    var Ajax = (function () {
        function Ajax() {
        }
        Ajax.head = function (url) {
            return Ajax._ajax(url, "HEAD");
        };
        Ajax.post = function (url, data) {
            return Ajax._ajax(url, "POST", data);
        };
        Ajax.put = function (url, data) {
            return Ajax._ajax(url, "PUT", data);
        };
        Ajax.get = function (url, data) {
            return Ajax._ajax(url, "GET", data);
        };
        Ajax.Delete = function (url, data) {
            return Ajax._ajax(url, "DELETE", data);
        };
        Ajax._ajax = function (url, method, data) {
            return Q($.ajax(url, Ajax._getNetAjaxSettings(url, method, data)));
        };
        Ajax._getNetAjaxSettings = function (url, method, data) {
            var newSettings = {
                url: url,
                type: method,
                cache: false,
                contentType: "application/json",
                traditional: true
            };
            if (!!data) {
                newSettings.data = typeof data === "string" ? data : JSON.stringify(data || {});
            }
            return newSettings;
        };
        return Ajax;
    }());
    return Ajax;
});
