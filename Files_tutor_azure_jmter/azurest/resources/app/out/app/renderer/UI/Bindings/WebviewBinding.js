"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var WebviewProxy_1 = require("../../Components/Editors/WebviewProxy");
var ko = require("knockout");
/**
 * A Knockout binding that binds an element to a webview-based control context
 * @example
 * ```
 * <div data-bind="webview: myWebviewEditorViewmodel"></div>
 * ```
 */
function initializeWebview(element, viewModel) {
    var htmlFile = ko.unwrap(viewModel.html);
    var editorViewModel = ko.unwrap(viewModel.viewModel);
    var parameters = ko.unwrap(viewModel.parameters);
    var proxy = new WebviewProxy_1.default(element, htmlFile, editorViewModel, parameters);
    proxy.initialize().then(function () { return console.warn("Webview initialized"); });
    viewModel.webviewProxy = proxy;
}
ko.bindingHandlers["webview"] = {
    update: function (element, valueAccessor) {
        // Get the bound data
        var value;
        if (valueAccessor) {
            value = ko.unwrap(valueAccessor());
        }
        if (!!value) {
            initializeWebview(element, value);
        }
    }
};
