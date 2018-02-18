"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Constants = require("../Constants");
var _host = global.host;
function openNotificationBar(messageString) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var clicked;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _host.executeOperation("StorageExplorer.NotificationBar.ShowMultiLink", {
                        message: messageString, links: ["Later", "Yes"],
                        infoBarType: Constants.InfoBarTypes.other, closeText: "Never"
                    })];
                case 1:
                    clicked = _a.sent();
                    return [2 /*return*/, clicked.linkClicked];
            }
        });
    });
}
exports.openNotificationBar = openNotificationBar;
function updateMessage(newMessage) {
    return _host.executeOperation("StorageExplorer.NotificationBar.updateMessage", { newMessage: newMessage });
}
exports.updateMessage = updateMessage;
