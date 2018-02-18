/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "ActivityLog/ActivityLogStatus", "Common/ActivityLogManager"], function (require, exports, ActivityLogStatus, ActivityLogManager) {
    "use strict";
    var ActivityLogEntry = (function () {
        function ActivityLogEntry(title, status) {
            if (title === void 0) { title = ""; }
            if (status === void 0) { status = ActivityLogStatus.Pending; }
            var _this = this;
            this._childSortOrder = 0;
            this._children = [];
            /**
             * Customize the stringification behavior. Without this, JSON.stringify() may fail to work if the property has circular references.
             */
            /* tslint:disable:no-unused-variable */
            this.toJSON = function () {
                return {
                    _id: _this._id,
                    _title: _this._title,
                    _childSortOrder: _this._childSortOrder,
                    _status: _this._status,
                    _progress: _this._progress,
                    _message: _this._message,
                    _children: _this._children,
                    _actionCallbacks: _this._actionCallbacks,
                    _actionNames: _this._actionNames
                };
            };
            /* tslint:enable */
            this._sendUpdateEvent = function () {
                _this._updateTimeout = null;
                if (_this._manager != null) {
                    _this._manager.update(_this);
                }
            };
            /**
             * Mark that this entry needs to send an update. After a short delay (to allow other changes
             *   to be included in this update), it will send an update for the entry.
             */
            this._markForUpdate = function () {
                if (_this._manager && !_this._updateTimeout) {
                    _this._updateTimeout = setTimeout(_this._sendUpdateEvent.bind(_this), 500);
                }
            };
            /**
             * Sets the title of the activity log entry
             *   If the instance is in a connected state (i.e. has a _manager), then the update
             *   event will be fired
             */
            this.setTitle = function (title) {
                if (_this._title !== title) {
                    _this._title = title;
                    _this._markForUpdate();
                }
            };
            /**
             * Sets the (optional) sort order of the activity log entry in its parent (doesn't affect top-level entries)
             *   If the instance is in a connected state (i.e. has a _manager), then the update
             *   event will be fired
             */
            this.setChildSortOrder = function (childSortOrder) {
                if (_this._childSortOrder !== childSortOrder) {
                    _this._childSortOrder = childSortOrder;
                    _this._markForUpdate();
                }
            };
            /**
             * Sets the status of the activity log entry
             *   If the instance is in a connected state (i.e. has a _manager), then the update
             *   event will be fired
             */
            this.setStatus = function (status) {
                if (_this._status !== status) {
                    _this._status = status;
                    _this._markForUpdate();
                }
            };
            /**
             * Sets the progress of the activity log entry
             *   If the instance is in a connected state (i.e. has a _manager), then the update
             *   event will be fired
             */
            this.setProgress = function (progress) {
                if (_this._progress !== progress) {
                    _this._progress = progress;
                    _this._markForUpdate();
                }
            };
            /**
             * Sets the message of the activity log entry
             *   If the instance is in a connected state (i.e. has a _manager), then the update
             *   event will be fired
             */
            this.setMessage = function (message) {
                if (_this._message !== message) {
                    _this._message = message;
                    _this._markForUpdate();
                }
            };
            /**
             * Adds a child ActivityLogEntry to this parent entry
             */
            this.addChild = function (entry) {
                _this._children.push(entry);
                _this._markForUpdate();
            };
            /**
             * Removes child ActivityLogEntrys from this parent entry
             */
            this.removeChildren = function (entries) {
                var hasChanges = false;
                for (var i = _this._children.length - 1; i >= 0; i--) {
                    for (var j = 0; j < entries.length; j++) {
                        if (_this._children[i] === entries[j]) {
                            _this._children.splice(i, 1);
                            _this._manager.unregisterEntry(entries[j]);
                            hasChanges = true;
                        }
                    }
                }
                if (hasChanges) {
                    _this._markForUpdate();
                }
            };
            /**
             * Removes multiple children ActivityLogEntrys from this parent entry
             */
            this.removeChild = function (entry) {
                _this.removeChildren([entry]);
            };
            /**
             * Adds multiple child ActivityLogEntry's to this parent entry
             */
            this.addChildren = function (entries) {
                if (entries.length) {
                    _this._children = _this._children.concat(entries);
                    _this._markForUpdate();
                }
            };
            /**
             * Fires the callbacks for the specified action
             */
            this.handleAction = function (action) {
                if (_this._actionCallbacks[action]) {
                    _this._actionCallbacks[action]();
                }
            };
            /**
             * Puts the ActivityLogEntry is a "connected" state. Any changes to properties will be
             *   sent across Daytona plugins to be updated in the UI
             * TODO: It's possible that the consumer will try to update properties before this
             *   returns. Internally, this should hold on to a promise so that _sendUpdateEvent
             *   will fire after this promise returns
             */
            this.setManager = function (manager) {
                _this._manager = manager;
            };
            // Set the entry id to a random, (hopefully) unique number
            this.id = Math.floor(Math.random() * ActivityLogManager.MAX_INT) + 1;
            this._title = title;
            this._status = status;
        }
        Object.defineProperty(ActivityLogEntry.prototype, "id", {
            /**
             * Gets the id of this activity log entry
             */
            get: function () {
                return this._id;
            },
            /**
             * Sets the id of the activity log entry. This is used by the manager to correctly route actions
             *   TODO: this should be refactored so that it calls a proxy object that the manager updates
             *   internally, so that this is not publicly callable;
             */
            set: function (id) {
                this._id = id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityLogEntry.prototype, "title", {
            /**
             * Gets the title of the activity log entry
             */
            get: function () {
                return this._title;
            },
            /**
             * Sets the title of the activity log entry
             *   If the instance is in a connected state (i.e. has a _manager), then the update
             *   event will be fired
             */
            set: function (title) {
                this.setTitle(title);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityLogEntry.prototype, "childSortOrder", {
            /**
             * Gets the (optional) sort order of the activity log entry
             */
            get: function () {
                return this._childSortOrder;
            },
            /**
             * Sets the (optional) sort order of the activity log entry in its parent (doesn't affect top-level entries)
             */
            set: function (childSortOrder) {
                this.setChildSortOrder(childSortOrder);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityLogEntry.prototype, "status", {
            /**
             * Gets the status of the activity log entry
             */
            get: function () {
                return this._status;
            },
            /**
             * Sets the status of the activity log entry
             *   If the instance is in a connected state (i.e. has a _manager), then the update
             *   event will be fired
             */
            set: function (status) {
                this.setStatus(status);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityLogEntry.prototype, "progress", {
            /**
             * Gets the progress of the activity log entry as a number between 0 and 1
             */
            get: function () {
                return this._progress;
            },
            /**
             * Sets the progress of the activity log entry
             *   If the instance is in a connected state (i.e. has a _manager), then the update
             *   event will be fired
             */
            set: function (progress) {
                this.setProgress(progress);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityLogEntry.prototype, "message", {
            /**
             * Gets the message of this activity log entry
             */
            get: function () {
                return this._message;
            },
            /**
             * Sets the message of the activity log entry
             *   If the instance is in a connected state (i.e. has a _manager), then the update
             *   event will be fired
             */
            set: function (message) {
                this.setMessage(message);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityLogEntry.prototype, "actions", {
            /**
             * Registers actions and callbacks for the activity log
             *   If the instance is in a connected state (i.e. has a _manager), then the update
             *   event will be fired
             */
            set: function (actions) {
                this._actionCallbacks = {};
                this._actionNames = {};
                for (var name in actions) {
                    this._actionCallbacks[name] = actions[name];
                    this._actionNames[name] = "on";
                }
                this._markForUpdate();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityLogEntry.prototype, "actionNames", {
            /**
             * Gets the actions registered for this activity log entry
             */
            get: function () {
                return this._actionNames;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityLogEntry.prototype, "children", {
            /**
             * Gets the children of this activity log entry
             */
            get: function () {
                return this._children;
            },
            enumerable: true,
            configurable: true
        });
        return ActivityLogEntry;
    }());
    return ActivityLogEntry;
});
