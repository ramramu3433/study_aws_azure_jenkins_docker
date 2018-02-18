"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var $ = require("jquery");
var ko = require("knockout");
/**
 * View model for set container access level dialog
 */
var ViewMessageViewModel = (function (_super) {
    tslib_1.__extends(ViewMessageViewModel, _super);
    function ViewMessageViewModel(message) {
        var _this = _super.call(this) || this;
        _this.titleLabel = "View Message"; // localize
        _this.messageTextLabel = "Message text:"; // localize
        _this.idLabel = "ID:"; // localize
        _this.insertionTimeLabel = "Insertion time (UTC):"; // localize
        _this.expirationTimeLabel = "Expiration time (UTC):"; // localize
        _this.dequeueCountLabel = "Dequeue count:"; // localize
        _this.messageText = _this.decodeHtml(message.MessageText);
        _this.initializeMessageProperties(message);
        _this.addCancelButton("Close");
        _this.messageType = ko.pureComputed(function () {
            return (message.Base64Encode)
                ? "This message is encoded in Base64." : "This message is stored with no encoding."; // localize
        });
        return _this;
    }
    ViewMessageViewModel.prototype.initializeMessageProperties = function (message) {
        this.messageProperties = [
            { key: this.idLabel, value: message.MessageId },
            { key: this.insertionTimeLabel, value: message.InsertionTime.toString() },
            { key: this.expirationTimeLabel, value: message.ExpirationTime.toString() },
            { key: this.dequeueCountLabel, value: message.DequeueCount.toString() }
        ];
    };
    ViewMessageViewModel.prototype.decodeHtml = function (value) {
        return $("<div/>").html(value).text();
    };
    return ViewMessageViewModel;
}(DialogViewModel_1.default));
exports.default = ViewMessageViewModel;
