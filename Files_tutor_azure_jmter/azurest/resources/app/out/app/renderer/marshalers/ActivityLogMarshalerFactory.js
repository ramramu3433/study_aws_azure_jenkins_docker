"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var StandardMarshaler_1 = require("./StandardMarshaler");
var daytona_1 = require("daytona");
var q = require("q");
/**
 * Daytona currently only fires events to the last plugin that created the JsonPortMarshaler.
 * That makes us keep the reference of all created marshalers so we can fire the event properly.
 */
var nonActivityLogInstances = [];
var initializedDeferred = q.defer();
var activityLogInstance;
function fireEvent(name, args) {
    initializedDeferred.promise
        .then(function () {
        if (activityLogInstance) {
            console.assert(activityLogInstance.instanceInitialized, "Activity Log Marshaler has not been initialized");
            console.assert(activityLogInstance.port.portState === 0, "Activity Log Marshaler Port has been disconnected or closed");
            try {
                activityLogInstance.fireEvent(name, args);
            }
            catch (error) {
                // Keep going to other marshalers if there's a failure
                console.error(error);
            }
        }
    });
}
function addEntry(entry) {
    fireEvent("addLogEntry", entry);
}
exports.addEntry = addEntry;
function updateEntry(entry) {
    fireEvent("updateLogEntry", entry);
}
exports.updateEntry = updateEntry;
function deleteEntry(entry) {
    fireEvent("deleteLogEntry", entry);
}
exports.deleteEntry = deleteEntry;
function fireEventInNonActivityLogInstance(name, args) {
    nonActivityLogInstances.forEach(function (marshaler) {
        console.assert(marshaler.instanceInitialized, "Marshaler has not been initialized");
        try {
            marshaler.fireEvent(name, args);
        }
        catch (error) {
            // Keep going to other marshalers if there's a failure
            console.error(error);
        }
    });
}
function executeEntryAction(id, action) {
    var eventArgs = {
        id: id,
        action: action
    };
    fireEventInNonActivityLogInstance("logAction", eventArgs);
    raiseExecuteActionEvent(id, action);
}
exports.executeEntryAction = executeEntryAction;
var _executeActionListeners = [];
function onExecuteAction(actionHandler) {
    _executeActionListeners.push(actionHandler);
}
exports.onExecuteAction = onExecuteAction;
function initialized() {
    initializedDeferred.resolve();
}
exports.initialized = initialized;
function raiseExecuteActionEvent(id, action) {
    _executeActionListeners.forEach(function (executeActionEventHandler) {
        executeActionEventHandler(id, action);
    });
}
var marshalerCallbacks = {
    addLogEntry: addEntry,
    updateLogEntry: updateEntry,
    logAction: executeEntryAction,
    dismiss: deleteEntry,
    initialized: initialized
};
function createMarshaler(isActivityLog) {
    if (isActivityLog === void 0) { isActivityLog = false; }
    var jsonPortMarshaler = new daytona_1.JsonPortMarshaler(StandardMarshaler_1.default.getStandardMarshaler(marshalerCallbacks));
    if (isActivityLog) {
        activityLogInstance = jsonPortMarshaler;
    }
    else {
        nonActivityLogInstances.push(jsonPortMarshaler);
    }
    return jsonPortMarshaler;
}
exports.createMarshaler = createMarshaler;
