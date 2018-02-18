"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
var DialogManagerProxy_1 = require("./UI/DialogManagerProxy");
var EulaManager = require("./EulaManager");
var TelemetryManager = require("./telemetry/TelemetryManager");
var Utilities = require("../Utilities");
var isDialogDisabled = false;
var storageKey = "Standalone_NetPromoterScoreDialog_v1";
var showFirstLaunchCount = 3;
var showIntervalInMilliseconds = 1000 * 60 * 60 * 24 * 30; // ~1 month
function hasShowIntervalElapsed(start, end) {
    var utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds());
    var utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds());
    var difference = (utcEnd - utcStart);
    var hasElapsed = (difference >= showIntervalInMilliseconds);
    return hasElapsed;
}
function updateLaunchCountSetting() {
    var settings = Utilities.loadSettings(storageKey, TelemetryManager.sendError);
    var launchCount = (settings && $.isNumeric(settings.launchCount)) ? settings.launchCount : 0;
    var lastShownDate = (settings && settings.lastShownDate) ? settings.lastShownDate : null;
    var doNotShow = (settings && settings.doNotShow) ? settings.doNotShow : null;
    var newSettings = {
        launchCount: launchCount + 1,
        lastShownDate: lastShownDate ? lastShownDate : undefined,
        doNotShow: doNotShow ? doNotShow : undefined
    };
    Utilities.saveSettings(storageKey, newSettings, TelemetryManager.sendError);
}
function shouldShowDialog() {
    var settings = Utilities.loadSettings(storageKey, TelemetryManager.sendError);
    var acceptedEula = EulaManager.hasAcceptedEula();
    var showDialog = false;
    // Disable dialog if needed.
    if (isDialogDisabled) {
        return showDialog;
    }
    if (acceptedEula && settings && settings.launchCount) {
        // Show the third time the App is launched.
        showDialog = (settings.launchCount === showFirstLaunchCount);
        if (!showDialog && (settings.launchCount > showFirstLaunchCount) && !settings.doNotShow) {
            var lastShownDate = settings.lastShownDate ? new Date(settings.lastShownDate) : null;
            var now = new Date();
            // Or after 'showIntervalInMilliseconds' elapses, as long as the user asks to not show it again.
            // May happen if the App launches several times without acting on the NPS dialog or accepting EULA.
            if ((!lastShownDate) || hasShowIntervalElapsed(lastShownDate, now)) {
                showDialog = true;
            }
        }
    }
    return showDialog;
}
function updateSettingsAfterShow(doNotShow) {
    var settings = Utilities.loadSettings(storageKey, TelemetryManager.sendError);
    var launchCount = (settings && $.isNumeric(settings.launchCount)) ? settings.launchCount : 0;
    var lastShownDate = new Date();
    var newSettings = {
        launchCount: launchCount,
        lastShownDate: lastShownDate.toISOString(),
        doNotShow: doNotShow ? doNotShow : undefined
    };
    Utilities.saveSettings(storageKey, newSettings, TelemetryManager.sendError);
}
/**
 * Determines whether the Net Promoter Score dialog needs to be shown and, if
 * so, shows it.
 */
function showNpsDialogIfNeeded() {
    updateLaunchCountSetting();
    if (shouldShowDialog()) {
        var params = {
            platform: Utilities.getPlatform(),
            version: Utilities.getVersion()
        };
        DialogManagerProxy_1.default.getDialogResult("nps", params)
            .then(function (parameters) {
            if (parameters) {
                updateSettingsAfterShow(parameters.doNotShow);
            }
        })
            .catch(function (error) {
            // If something goes wrong, log telemetry, and try to clear settings.
            var eventId = "Standalone.NetPromoterScoreDialog.open";
            console.error(eventId, error);
            TelemetryManager.sendError(eventId, error);
            Utilities.clearSettings(storageKey, TelemetryManager.sendError);
        });
    }
}
exports.showNpsDialogIfNeeded = showNpsDialogIfNeeded;
