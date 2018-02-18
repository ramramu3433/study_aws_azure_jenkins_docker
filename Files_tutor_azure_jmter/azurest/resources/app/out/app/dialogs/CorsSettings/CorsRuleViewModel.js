"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ko = require("knockout");
var CorsRuleViewModel = (function () {
    function CorsRuleViewModel(corsRule) {
        var _this = this;
        this.allowedHeaders = ko.observableArray();
        this.allowedMethods = ko.observableArray();
        this.allowedOrigins = ko.observableArray();
        this.exposedHeaders = ko.observableArray();
        this.maxAgeInSeconds = ko.observable();
        this.allowedHeadersText = ko.pureComputed({
            read: function () { return _this.allowedHeaders().join(CorsRuleViewModel.separator); },
            write: function (value) { return _this.allowedHeaders(value.split(CorsRuleViewModel.separator)); }
        });
        this.allowedMethodsText = ko.pureComputed({
            read: function () { return _this.allowedMethods().join(CorsRuleViewModel.separator); },
            write: function (value) { return _this.allowedMethods(value.split(CorsRuleViewModel.separator)); }
        });
        this.allowedOriginsText = ko.pureComputed({
            read: function () { return _this.allowedOrigins().join(CorsRuleViewModel.separator); },
            write: function (value) { return _this.allowedOrigins(value.split(CorsRuleViewModel.separator)); }
        });
        this.exposedHeadersText = ko.pureComputed({
            read: function () { return _this.exposedHeaders().join(CorsRuleViewModel.separator); },
            write: function (value) { return _this.exposedHeaders(value.split(CorsRuleViewModel.separator)); }
        });
        this.displayName = ko.pureComputed(function () { return _this.allowedOrigins()[0]; });
        this.isSelected = ko.observable(false);
        if (!!this.getCorsRule) {
            this.allowedHeaders(corsRule.AllowedHeaders);
            this.allowedMethods(corsRule.AllowedMethods);
            this.allowedOrigins(corsRule.AllowedOrigins);
            this.exposedHeaders(corsRule.ExposedHeaders);
            this.maxAgeInSeconds(corsRule.MaxAgeInSeconds);
        }
        else {
            this.allowedOrigins([""]);
            this.allowedMethods(["GET", "PUT"]);
            this.allowedHeaders([""]);
            this.exposedHeaders([""]);
            this.maxAgeInSeconds(null);
        }
    }
    CorsRuleViewModel.prototype.getCorsRule = function () {
        return {
            AllowedHeaders: this.allowedHeaders(),
            AllowedMethods: this.allowedMethods(),
            AllowedOrigins: this.allowedOrigins(),
            ExposedHeaders: this.exposedHeaders(),
            MaxAgeInSeconds: this.maxAgeInSeconds()
        };
    };
    return CorsRuleViewModel;
}());
CorsRuleViewModel.separator = ",";
exports.default = CorsRuleViewModel;
