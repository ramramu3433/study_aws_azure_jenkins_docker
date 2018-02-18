"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var NotificationBarManager = require("../NotificationBarManager");
var NotificationBarProvider = {
    "StorageExplorer.NotificationBar.ShowMultiLink": function (args) {
        return NotificationBarManager.showMultiLink(args.message, args.links, args.infoBarType, args.closeText)
            .then(function (clicked) {
            return { linkClicked: clicked };
        });
    },
    "StorageExplorer.NotificationBar.updateMessage": function (args) {
        return NotificationBarManager.updateMessage(args.newMessage);
    },
    "StorageExplorer.NotificationBar.showNotificationBar": function (args) {
        return NotificationBarManager._addNotificatioBar(args.newMessage);
    }
};
module.exports = NotificationBarProvider;
