define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HttpRequest = (function () {
        function HttpRequest() {
            this._requestHeaders = {};
        }
        HttpRequest.prototype.getAllResponseHeaders = function () {
            return this._responseHeaders;
        };
        HttpRequest.prototype.open = function (method, url, async, user, password) {
            this.url = url;
            this.method = method;
        };
        HttpRequest.prototype.abort = function () {
        };
        HttpRequest.prototype.send = function (data) {
            var settings = {};
            settings.url = this.url;
            settings.type = this.method;
            settings.headers = this._requestHeaders;
            settings.data = data;
            settings.dataType = "text";
            settings.timeout = this.timeout;
            settings.error = this._onAjaxError.bind(this);
            $.ajax(settings)
                .then(this._onAjax.bind(this));
        };
        HttpRequest.prototype.setRequestHeader = function (header, value) {
            this._requestHeaders[header] = value;
        };
        HttpRequest.prototype._onAjaxError = function (xhrObj, textStatus, errorThrown) {
            if (textStatus === "timeout") {
                this.ontimeout();
                return;
            }
            this.statusText = textStatus;
            this.responseText = xhrObj.responseText;
            this.status = xhrObj.status;
            this.readyState = xhrObj.readyState;
            this._responseHeaders = xhrObj.getAllResponseHeaders();
            this.onreadystatechange();
        };
        HttpRequest.prototype._onAjax = function (data, textStatus, xhrObj) {
            this.statusText = textStatus;
            this.status = xhrObj.status;
            this.readyState = xhrObj.readyState;
            this.responseText = !!data ? data : "";
            this._responseHeaders = xhrObj.getAllResponseHeaders();
            this.onreadystatechange();
        };
        return HttpRequest;
    }());
    exports.HttpRequest = HttpRequest;
});
