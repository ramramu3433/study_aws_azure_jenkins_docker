"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var AITelemetryReporter = require("../telemetry/AITelemetryReporter");
var FileTelemetryReporter = require("../telemetry/FileTelemetryReporter");
var IgnoreTelemetryReporter = require("../telemetry/IgnoreTelemetryReporter");
var Utilities = require("../../Utilities");
var errorTelemetryEventName = "CloudHub.Error";
var userIdStorageKey = "Standalone_Telemetry_UserId";
// TODO: we need some way in the UI to allow users to opt out of telemetry
var optIn = true;
var debug = Utilities.isDebug();
// Try to load a userId from storage. If one does not exist, create one and store it
var userId = Utilities.loadSettings(userIdStorageKey);
if (!userId) {
    userId = Utilities.guid();
    Utilities.saveSettings(userIdStorageKey, userId);
}
// Initialize the correct telemetry reporter based on the optIn and debug values
var reporter = null;
if (debug) {
    reporter = new FileTelemetryReporter(debug, userId);
}
else {
    if (optIn) {
        try {
            reporter = new AITelemetryReporter(debug, userId);
        }
        catch (e) {
            // AI or Service failures might cause an extension crash at
            // load time. Catch any exception and continue.
        }
    }
}
if (reporter === null) {
    reporter = new IgnoreTelemetryReporter(debug, userId);
}
exports.sendEvent = reporter.sendEvent;
exports.sendMetric = function () { return; };
function sendError(telemetryErrorName, err) {
    var telemetryEvent = {
        name: telemetryErrorName
    };
    if (err) {
        telemetryEvent.errorName = err.name;
        telemetryEvent.file = err.source;
        telemetryEvent.stack = err.stack;
        // If the error is a string, it represents the message itself.
        telemetryEvent.message = (typeof err === "string") ? err : err.message;
    }
    exports.sendEvent(errorTelemetryEventName, telemetryEvent);
}
exports.sendError = sendError;
