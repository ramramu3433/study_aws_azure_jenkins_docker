"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var notificationsManager = require("../NotificationsManager");
var Q = require("q");
var notificationsQueue = [];
var notificationReservationTime = Number.MIN_VALUE;
var filesDict = {};
var currentNotificationBar = {};
var _host = global.host;
var tryStartNextReservation = function () {
    if (Date.now() > notificationReservationTime && notificationsQueue.length > 0) {
        notificationReservationTime = Date.now() + 2000;
        var reservationDeferred = notificationsQueue.shift();
        reservationDeferred.resolve(notificationReservationTime);
        setTimeout(function () {
            if (notificationReservationTime < Date.now()) {
                tryStartNextReservation();
            }
        }, notificationReservationTime + 50);
    }
};
var notificationsProvider = {
    "Notifications.ReserveNotification": function () {
        var deferred = Q.defer();
        notificationsQueue.push(deferred);
        tryStartNextReservation();
        return deferred.promise;
    },
    "Notifications.CancelReservation": function (args) {
        if (args.reservation === notificationReservationTime && notificationReservationTime >= Date.now()) {
            notificationReservationTime = Number.MIN_VALUE;
            tryStartNextReservation();
        }
    },
    "Notifications.OpenNotification": function (args) {
        if (args.reservation === notificationReservationTime && notificationReservationTime >= Date.now()) {
            notificationReservationTime = Number.MAX_VALUE;
            currentNotificationBar[args.filePath] = true;
            var openNotificationPromise = notificationsManager.openNotificationBar(filesDict[args.filePath]);
            openNotificationPromise.then(function () {
                currentNotificationBar[args.filePath] = null;
                notificationReservationTime = Number.MIN_VALUE;
                tryStartNextReservation();
            }).catch(function () {
                notificationReservationTime = Number.MIN_VALUE;
                tryStartNextReservation();
            });
            return openNotificationPromise;
        }
        return Q.reject("Invalid Notification Reservation");
    },
    "Notifications.Update": function (args) {
        if (currentNotificationBar[args.filePath]) {
            _host.executeOperation("StorageExplorer.NotificationBar.updateMessage", { newMessage: args.messageString });
        }
        filesDict[args.filePath] = args.messageString;
    }
};
module.exports = notificationsProvider;
