/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    // import IActivityLoggedEvent = require("ActivityLog/IActivityLoggedEvent");
    var ActivityLogManager = (function () {
        function ActivityLogManager(host, telemetryActions) {
            var _this = this;
            this.entries = {};
            this._addCallbacks = [];
            this._updateCallbacks = [];
            this._deleteCallbacks = [];
            this._registerEntry = function (entry) {
                // Put the entry in a connected state by giving it a reference to the ActivityLogManager
                entry.setManager(_this);
                // Track this entry to make sure we can find it later to notify it on actions
                _this.entries[entry.id] = entry;
                // Register each child
                for (var i = 0; i < entry.children.length; i++) {
                    _this._registerEntry(entry.children[i]);
                }
            };
            /**
             * Remove the entry from our list of tracked entries
             */
            this.unregisterEntry = function (entry) {
                // Unregister each child
                for (var i = 0; i < entry.children.length; i++) {
                    _this.unregisterEntry(entry.children[i]);
                }
                entry.setManager(null);
                delete _this.entries[entry.id];
            };
            /**
             * Handle the action event on an ActivityLogEntry by triggering it on the correct entry
             */
            this._handleLogAction = function (args) {
                var id = args.id;
                var action = args.action;
                if (_this.entries[id]) {
                    _this.entries[id].handleAction(action);
                }
                return Promise.resolve();
            };
            /**
             * Call all of the callbacks that handle when an entry has been added
             */
            this._handleAddedLogEntry = function (args) {
                for (var i = 0; i < _this._addCallbacks.length; i++) {
                    _this._addCallbacks[i](args);
                }
                return Promise.resolve();
            };
            /**
             * Call all of the callbacks that handle when an entry has been updated
             */
            this._handleUpdatedLogEntry = function (args) {
                for (var i = 0; i < _this._updateCallbacks.length; i++) {
                    _this._updateCallbacks[i](args);
                }
                return Promise.resolve();
            };
            /**
             * Call all of the callbacks that handle when an entry has been updated
             */
            this._handleDeleteLogEntry = function (args) {
                for (var i = 0; i < _this._deleteCallbacks.length; i++) {
                    _this._deleteCallbacks[i](args);
                }
                return Promise.resolve();
            };
            /**
             * Registers a callback for when an ActivityLogEntry is added to the activity log
             */
            this.onAddLogActivity = function (callback) {
                _this._addCallbacks.push(callback);
            };
            /**
             * Registers a callback for when an ActivityLogEntry state is updated
             */
            this.onUpdateLogActivity = function (callback) {
                _this._updateCallbacks.push(callback);
            };
            /**
             * Registers a callback for when an ActivityLogEntry state is updated
             */
            this.onDeleteLogActivity = function (callback) {
                _this._deleteCallbacks.push(callback);
            };
            /**
             * Fires the update event for an entry, meaning that its state has changed
             */
            this.update = function (entry) {
                if (!_this.entries[entry.id]) {
                    throw new Error("Activity log entry has not yet been added to the log");
                }
                _this._registerEntry(entry);
                return _this._host.executeOperation(ActivityLogManager.updateLogEntryNamespace, [entry]);
            };
            /**
             * Fires the add event for an entry, meaning that it should be added to the Activity Log
             */
            this.add = function (entry) {
                if (_this.entries[entry.id]) {
                    throw new Error("Activity log entry has already added to the log");
                }
                _this._registerEntry(entry);
                return _this._host.executeOperation(ActivityLogManager.addLogEntryNamespace, [entry]);
            };
            /**
             * Fires the add event for an entry, meaning that it should be added to the Activity Log
             */
            this.delete = function (entry) {
                if (!_this.entries[entry.id]) {
                    throw new Error("Activity log entry has not yet been added to the log");
                }
                _this.unregisterEntry(entry);
                return _this._host.executeOperation(ActivityLogManager.deleteLogEntryNamespace, [entry]);
            };
            /**
             * Fires the action event for an entry, meaning that it an action was clicked in the UI
             */
            this.action = function (id, actionName) {
                return _this._host.executeOperation(ActivityLogManager.logActionNamespace, [id, actionName]);
            };
            this._host = host;
            this._telemetryActions = telemetryActions;
            this._host.onHostEvent(ActivityLogManager.addLogEntryNamespace, this._handleAddedLogEntry);
            this._host.onHostEvent(ActivityLogManager.updateLogEntryNamespace, this._handleUpdatedLogEntry);
            this._host.onHostEvent(ActivityLogManager.deleteLogEntryNamespace, this._handleDeleteLogEntry);
            this._host.onHostEvent(ActivityLogManager.logActionNamespace, this._handleLogAction);
        }
        return ActivityLogManager;
    }());
    ActivityLogManager.namespace = "ActivityLog";
    ActivityLogManager.addLogEntryNamespace = ActivityLogManager.namespace + ".addLogEntry";
    ActivityLogManager.updateLogEntryNamespace = ActivityLogManager.namespace + ".updateLogEntry";
    ActivityLogManager.deleteLogEntryNamespace = ActivityLogManager.namespace + ".deleteLogEntry";
    ActivityLogManager.logActionNamespace = ActivityLogManager.namespace + ".logAction";
    ActivityLogManager.initializedNamespace = ActivityLogManager.namespace + ".initialized";
    // TODO: currently, the id of the ActivityLogEntry is set by the caller, not the ActivityLog. This should
    //   change so unique ids are generated for each ActivityLogEntry (rather than relying on random #s). But since
    //   there are multiple instances of ActivityLogManager, requires some additional work.
    ActivityLogManager.MAX_INT = Math.pow(2, 53) - 1;
    return ActivityLogManager;
});
