/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var NotificationsProvider = (function () {
        function NotificationsProvider() {
            this.namespace = "NotificationsProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/NotificationsProvider",
                useChildProcess: false
            };
            this.exports = [
                "Notifications.ReserveNotification",
                "Notifications.CancelReservation",
                "Notifications.OpenNotification",
                "Notifications.Update"
            ];
        }
        return NotificationsProvider;
    }());
    return NotificationsProvider;
});
