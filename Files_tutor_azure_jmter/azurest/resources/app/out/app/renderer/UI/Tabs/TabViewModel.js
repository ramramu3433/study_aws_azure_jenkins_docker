"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ko = require("knockout");
var TabViewModel = (function () {
    function TabViewModel(displayName, fullName, options) {
        var _this = this;
        this.iconPath = ko.observable(null);
        this.parameters = null;
        this.displayName = ko.observable("<new tab>");
        this.fullName = ko.observable("");
        this.cloudExplorerNodeID = ko.observable("");
        this.isTemporary = ko.observable(false);
        this.isActive = ko.observable(false);
        this.isFocusable = ko.observable(true);
        this.hasIcon = ko.computed(function () {
            return !!_this.iconPath();
        });
        this.tabIconBackground = ko.computed(function () {
            return "url(\"" + _this.iconPath() + "\")";
        });
        this.environment = options.environment;
        this.parameters = options.parameters;
        this.displayName(displayName);
        this.fullName(fullName);
        this.iconPath(options.iconPath || null);
        this.cloudExplorerNodeID(options.nodeID || "");
        this.isTemporary(options.temporaryTab || false);
        this.cacheOnClose = options.cacheOnClose || false;
        this.isActive.subscribe(function (isActive) {
            if (isActive) {
                _this.sendIsActiveEvent();
            }
        });
    }
    return TabViewModel;
}());
exports.default = TabViewModel;
