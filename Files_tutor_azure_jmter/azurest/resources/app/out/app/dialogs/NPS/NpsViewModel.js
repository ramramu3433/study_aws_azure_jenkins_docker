"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ko = require("knockout");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var NpsViewModel = (function (_super) {
    tslib_1.__extends(NpsViewModel, _super);
    function NpsViewModel(parameters) {
        var _this = _super.call(this) || this;
        // Localize
        _this.greetingText = "Let Us Know What You Think";
        _this.linkInviteHeadText = "Your feedback is important. Please take a few minutes to fill out our ";
        _this.linkCaption = "customer satisfaction survey.";
        _this.baseLinkUrl = "https://go.microsoft.com/fwlink/?LinkId=698853";
        _this.linkTooltip = "Customer Satisfaction Survey";
        _this.linkInviteTailText = "Thanks for helping us improve this experience.";
        _this.doNotShowAgainText = "Don't show this dialog again.";
        _this.platformLabel = "platform";
        _this.versionLabel = "version";
        var linkUrl = _this.baseLinkUrl;
        linkUrl = _this.addUrlParameter(linkUrl, _this.platformLabel, parameters.platform);
        linkUrl = _this.addUrlParameter(linkUrl, _this.versionLabel, parameters.version);
        _this.doNotShow = ko.observable(false);
        _this.linkUrl = ko.observable(linkUrl);
        _this.addAcceptButton("Dismiss");
        return _this;
    }
    /**
     * @override
     */
    NpsViewModel.prototype.getResults = function () {
        return {
            doNotShow: this.doNotShow()
        };
    };
    NpsViewModel.prototype.onLink = function () {
        if (!!this.linkUrl()) {
            this.openWindow(this.linkUrl());
        }
    };
    NpsViewModel.prototype.openWindow = function (url) {
        if (url) {
            DialogOperationRouterProxy_1.default.executeOperation("Environment.Browser.openUrl", { url: url });
        }
    };
    NpsViewModel.prototype.addUrlParameter = function (url, name, value) {
        return (url + "&" + name + "=" + value);
    };
    return NpsViewModel;
}(DialogViewModel_1.default));
exports.default = NpsViewModel;
