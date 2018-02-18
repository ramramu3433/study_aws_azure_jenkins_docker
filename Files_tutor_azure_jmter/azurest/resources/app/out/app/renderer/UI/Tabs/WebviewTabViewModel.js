"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TabViewModel_1 = require("./TabViewModel");
var ZoomLevelManager_1 = require("../../ZoomLevelManager");
var ko = require("knockout");
var path = require("path");
var appDirRelativePath = "../../../..";
var WebviewTabViewModel = (function (_super) {
    tslib_1.__extends(WebviewTabViewModel, _super);
    function WebviewTabViewModel(displayName, fullName, options) {
        var _this = _super.call(this, displayName, fullName, options) || this;
        _this.webviewProxy = null;
        _this.html = ko.observable(null);
        _this.viewModel = ko.observable(null);
        var manifest = require(path.join(__dirname, appDirRelativePath, options.source));
        _this.html(path.join(__dirname, appDirRelativePath, manifest.view));
        _this.viewModel(path.join(__dirname, appDirRelativePath, manifest.viewModel));
        return _this;
    }
    WebviewTabViewModel.prototype.setTheme = function (newTheme) {
        this.webviewProxy.setTheme(newTheme);
    };
    WebviewTabViewModel.prototype.setZoom = function (zoomFactor) {
        this.webviewProxy.setZoom(zoomFactor);
    };
    WebviewTabViewModel.prototype.sendIsActiveEvent = function () {
        var _this = this;
        setTimeout(function () { return _this.webviewProxy.setZoom(ZoomLevelManager_1.default.zoomFactor); }, 50);
        // TO-DO: implement this once we have web view tabs which need to be focused on active
        return;
    };
    return WebviewTabViewModel;
}(TabViewModel_1.default));
exports.default = WebviewTabViewModel;
