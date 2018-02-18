"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ShellViewModel_1 = require("./UI/ShellViewModel");
var Constants = require("../Constants");
var Q = require("q");
// import IHost from "./Components/Providers/IHost";
/**
 * Shows the notification bar with a specific message and link.
 * @param {string} message The message of the notification bar.
 * @param {string} link The text for the link.
 * @return {Promise} A promise that will be resolved after user interacts with notification.
 */
function showSingleLink(message, link, infoBarType, closeText) {
    return ShellViewModel_1.default.infoBarViewModel.showSingleLink(message, link, infoBarType, closeText)
        .then(function (linkClicked) {
        return linkClicked > -1;
    });
}
exports.showSingleLink = showSingleLink;
/**
 * Shows the notification bar with a specific message and many links.
 * @param {string} message The message of the notification bar.
 * @param {string[]} links A list of texts for many links.
 * @return {Promise} A promise that will be resolved after user interacts with notification.
 */
function showMultiLink(message, links, infoBarType, closeText) {
    return ShellViewModel_1.default.infoBarViewModel.showMultiLink(message, links, infoBarType, closeText);
}
exports.showMultiLink = showMultiLink;
function updateMessage(newMessage) {
    return ShellViewModel_1.default.infoBarViewModel.updateMessage(newMessage);
}
exports.updateMessage = updateMessage;
/**
 * get the infobar type currently being shown
 */
function getInfoBarType() {
    return ShellViewModel_1.default.infoBarViewModel.getInfoBarType();
}
exports.getInfoBarType = getInfoBarType;
/**
 * Close the message currently being shown
 */
function close() {
    return ShellViewModel_1.default.infoBarViewModel.close();
}
exports.close = close;
// var _host: IHost = (<any>global).host;
var _addNotificationBarQueue = [];
var _processingNotificationBar = false;
function _addNotificatioBar(messageString) {
    return this._addNextNotificationBar(messageString);
}
exports._addNotificatioBar = _addNotificatioBar;
function _addNextNotificationBar(messageString) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, , 5, 6]);
                    if (!!_processingNotificationBar) return [3 /*break*/, 2];
                    _processingNotificationBar = true;
                    return [4 /*yield*/, _showNotificationBar(messageString)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [4 /*yield*/, Q.Promise(function (resolve, reject) {
                        var queuedItemPromise = function () {
                            return _showNotificationBar(messageString)
                                .then(function (clicked) { return resolve(clicked); })
                                .catch(function (err) { return reject(err); });
                        };
                        _addNotificationBarQueue.push(queuedItemPromise);
                    })];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [3 /*break*/, 6];
                case 5:
                    _processShowNotificationBarComplete();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports._addNextNotificationBar = _addNextNotificationBar;
function _processShowNotificationBarComplete() {
    if (_addNotificationBarQueue.length > 0) {
        var addJobOperation = _addNotificationBarQueue.shift();
        addJobOperation();
    }
    else {
        _processingNotificationBar = false;
    }
}
exports._processShowNotificationBarComplete = _processShowNotificationBarComplete;
function _showNotificationBar(messageString) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var clicked;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, showMultiLink(messageString, ["Later", "Yes"], Constants.InfoBarTypes.other, "Never")];
                case 1:
                    clicked = _a.sent();
                    return [2 /*return*/, clicked];
            }
        });
    });
}
