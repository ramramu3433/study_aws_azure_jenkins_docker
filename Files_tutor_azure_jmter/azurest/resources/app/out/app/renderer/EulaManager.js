"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var DialogManagerProxy_1 = require("./UI/DialogManagerProxy");
var electron_1 = require("electron");
var Q = require("q");
var TelemetryManager = require("./telemetry/TelemetryManager");
var Utilities = require("../Utilities");
var dialogId = "eula";
var storageKey = "Standalone_EndUserLicenseAgreementDialog_v1";
/**
 * Determines whether the user has accepted the End User License Agreement.
 */
function hasAcceptedEula() {
    var platformRequiresEula = Utilities.isOSX() || Utilities.isLinux();
    var settings = Utilities.loadSettings(storageKey, TelemetryManager.sendError);
    var acceptedEula = (!platformRequiresEula || (settings && settings.acceptedEula));
    return acceptedEula;
}
exports.hasAcceptedEula = hasAcceptedEula;
function shouldShowDialog() {
    return !hasAcceptedEula();
}
function saveAcceptSettings() {
    var settings = { acceptedEula: true };
    Utilities.saveSettings(storageKey, settings, TelemetryManager.sendError);
}
/**
 * Detects whether the user has already accepted the End User License Agreement.
 * If not, the EULA dialog is shown.
 */
function showEulaDialogIfNeeded() {
    if (shouldShowDialog()) {
        return DialogManagerProxy_1.default.getDialogResult(dialogId, null)
            .then(function (parameters) {
            if (parameters && parameters.accept) {
                saveAcceptSettings();
            }
            else {
                electron_1.remote.app.quit();
            }
            return true;
        })
            .catch(function (error) {
            // If something goes wrong, log telemetry, and try to clear settings.
            var eventId = "Standalone.EndUserLicenseAgreementDialog.open";
            console.error(eventId, error);
            TelemetryManager.sendError(eventId, error);
            Utilities.clearSettings(storageKey, TelemetryManager.sendError);
        }).then(function (_) { return true; });
    }
    return Q.resolve(false);
}
exports.showEulaDialogIfNeeded = showEulaDialogIfNeeded;
