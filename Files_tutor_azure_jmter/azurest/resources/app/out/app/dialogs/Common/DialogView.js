"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var DialogOperationRouterProxy_1 = require("./DialogOperationRouterProxy");
var KeyCodes_1 = require("./KeyCodes");
var WebpageThemeManager_1 = require("../../common/WebpageThemeManager");
var electron_1 = require("electron");
var ko = require("knockout");
var viewModel;
window.onload = function () {
    // jQuery tries to hook up to globals that may not have been initialized yet.
    // So jQuery should be imported only after the window is finished loading.
    var $ = require("jquery");
    $(".content")
        .prepend("<div class=\"spacer spacer-top\"></div>")
        .append("<div class=\"spacer spacer-bottom\"></div>");
    var activePanel = null;
    function swapPanel(id) {
        $(".dialog-panel").hide();
        activePanel = $("#" + id);
        activePanel.show().focus();
        resizeSpacers();
    }
    function resizeSpacers() {
        var title = document.querySelector("#" + activePanel.get(0).id + " .title");
        if (!!title) {
            $(".spacer-top").height(title.getBoundingClientRect().height);
        }
        var buttons = document.querySelector("#" + activePanel.get(0).id + " .buttons");
        if (!!buttons) {
            $(".spacer-bottom").height(buttons.getBoundingClientRect().height);
        }
    }
    /**
     * Adjusts the size and zoom factor of any `<webview>` elements to match the parent content.
     *
     * An Electron bug incorrectly sets the webview contents size when zoom factor varies.
     * This is a workaround that corrects the size of the webview contents.
     * @see https://github.com/electron/electron/issues/7375
     */
    function adjustWebviews(zoomFactor) {
        var adjustWebview = function (webview) {
            var webviewContents = webview.getWebContents();
            if (!!webviewContents) {
                webviewContents.setZoomFactor(zoomFactor);
                webviewContents.setSize({
                    normal: {
                        height: Math.floor(webview.clientHeight * zoomFactor),
                        width: Math.floor(webview.clientWidth * zoomFactor)
                    }
                });
            }
        };
        var webviewElements = $("webview").get();
        // The delay prevents any underlying layout mechanisms from reseting our adjustments.
        webviewElements.forEach(function (webview) { return setTimeout(adjustWebview.bind(undefined, webview), 50); });
    }
    $(window).resize(resizeSpacers);
    window.addEventListener("keyup", function (e) {
        if (e.keyCode === KeyCodes_1.default.Esc) {
            electron_1.ipcRenderer.send("did-get-dialog-result", undefined, null);
        }
    });
    swapPanel("default-panel");
    electron_1.ipcRenderer.send("dialog-ready");
    electron_1.ipcRenderer.once("dialog-init", function (event, shellInfo, args) {
        electron_1.webFrame.setZoomFactor(shellInfo.zoomFactor || 1);
        try {
            var dialogViewModel = require("./DialogViewModel").default;
            var multipanelDialogViewModel = require("./MultipanelDialogViewModel").default;
            var viewModelPath = args.viewModel;
            var vmModule = require(viewModelPath);
            if (!vmModule.default && typeof !vmModule.default !== "function") {
                throw new Error("The view model at '" + viewModelPath + "' does not have a class as a default export");
            }
            viewModel = new vmModule.default(args.args);
            if (!(viewModel instanceof dialogViewModel || viewModel instanceof multipanelDialogViewModel)) {
                throw new Error("The view model at '" + viewModelPath + "' does not inherit from 'DialogViewModel' or 'MultipanelDialogViewModel'");
            }
            viewModel.currentPanel.subscribe(function (result) {
                swapPanel(result);
            });
            if (!!args.args && !!args.args.startPage) {
                viewModel.currentPanel.notifySubscribers(args.args.startPage);
            }
            // We subscribe to the `dialogResult` observable so that we may
            // automatically close the dialog when its value is set.
            viewModel.dialogResult.subscribe(function (result) {
                electron_1.ipcRenderer.send("did-get-dialog-result", undefined, result);
            });
            ko.applyBindings(viewModel);
            DialogOperationRouterProxy_1.default.executeOperation("Environment.Theming.getTheme", {})
                .then(function (theme) {
                WebpageThemeManager_1.default.setTheme(theme);
                electron_1.ipcRenderer.send("dialog-did-init");
            });
        }
        catch (error) {
            electron_1.ipcRenderer.send("dialog-did-init", error.message + error.stack);
        }
        resizeSpacers();
    });
    electron_1.ipcRenderer.on("dialog-shown", function (event, args) {
        viewModel.onShow();
        adjustWebviews(electron_1.webFrame.getZoomFactor());
    });
    electron_1.ipcRenderer.on("dialog-theme-change", function (e, newTheme) {
        WebpageThemeManager_1.default.setTheme(newTheme);
    });
    electron_1.ipcRenderer.on("dialog-zoom-change", function (e, zoomFactor) {
        electron_1.webFrame.setZoomFactor(zoomFactor);
        adjustWebviews(zoomFactor);
    });
};
