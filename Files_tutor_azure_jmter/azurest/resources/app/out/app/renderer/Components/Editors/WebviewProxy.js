"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var MessagePassingProviderProxy_1 = require("../Providers/MessagePassingProvider/MessagePassingProviderProxy");
var ZoomLevelManager_1 = require("../../ZoomLevelManager");
var q = require("q");
var $ = require("jquery");
var host = global.host;
var WebviewProxy = (function () {
    function WebviewProxy(parentElement, htmlFile, viewModel, parameters) {
        var _this = this;
        this.onMessage = function (handler) {
            _this._webviewElement.addEventListener("ipc-message", function (event) {
                if (event.channel === "webview-editor-message") {
                    var message = event.args[0];
                    console.log("Message from webview:");
                    console.log(message);
                    handler(message);
                }
            });
        };
        this.sendMessage = function (message) {
            _this._webviewElement.send("webview-host-message", message);
            return q.resolve(undefined);
        };
        this.onInit = function (event) {
            switch (event.channel) {
                case "webview-ready":
                    _this._webviewElement.send("webview-init-request", _this.viewModel, _this.parameters);
                    _this.setZoom(ZoomLevelManager_1.default.zoomFactor);
                    $(window).resize(function () {
                        _this.setZoom(ZoomLevelManager_1.default.zoomFactor);
                    });
                    break;
                case "webview-init-response":
                    if (!!event.args && !!event.args[0]) {
                        _this._initPromise.reject(event.args[0]);
                    }
                    else {
                        _this._initPromise.resolve(undefined);
                    }
                    _this._webviewElement.removeEventListener("ipc-message", _this.onInit);
                    // uncomment this to debug webviews
                    // this._webviewElement.openDevTools();
                    break;
            }
        };
        this.htmlFile = htmlFile;
        this.viewModel = viewModel;
        this.parameters = parameters;
        this._webviewElement = document.createElement("webview");
        this._webviewElement.setAttribute("nodeintegration", "");
        this._webviewElement.setAttribute("src", htmlFile);
        this._webviewElement.setAttribute("preload", "../../app/editors/Common/EditorView.js");
        this._webviewElement.addEventListener("ipc-message", this.onInit);
        var messageHandler = { onMessage: this.onMessage };
        var messageSender = { sendMessage: this.sendMessage };
        this._messagePasser = new MessagePassingProviderProxy_1.default("Internal.Environment.Editors", messageHandler, messageSender, host);
        this._initPromise = q.defer();
        parentElement.appendChild(this._webviewElement);
    }
    WebviewProxy.prototype.initialize = function () {
        return this._initPromise.promise;
    };
    WebviewProxy.prototype.setTheme = function (theme) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._messagePasser.executeFunction("Environment.Theming.onThemeChanged", { newTheme: theme })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebviewProxy.prototype.setZoom = function (zoom) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var adjustWebview;
            return tslib_1.__generator(this, function (_a) {
                adjustWebview = function () {
                    var webviewContents = _this._webviewElement.getWebContents();
                    if (!!webviewContents) {
                        webviewContents.setZoomFactor(zoom);
                        // An Electron bug incorrectly sets the webview contents size when zoom factor varies.
                        // This is a workaround that corrects the size of the webview contents.
                        // https://github.com/electron/electron/issues/7375
                        webviewContents.setSize({
                            normal: {
                                height: Math.floor(_this._webviewElement.clientHeight * zoom),
                                width: Math.floor(_this._webviewElement.clientWidth * zoom)
                            }
                        });
                    }
                };
                // The delay prevents any underlying layout mechanisms from reseting our adjustments.
                setTimeout(adjustWebview, 50);
                return [2 /*return*/];
            });
        });
    };
    return WebviewProxy;
}());
exports.default = WebviewProxy;
