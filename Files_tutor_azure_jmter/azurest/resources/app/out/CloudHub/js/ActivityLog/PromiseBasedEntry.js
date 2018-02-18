/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/ActivityLogEntry", "ActivityLog/ActivityLogStatus"], function (require, exports, ActivityLogEntry, ActivityLogStatus) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of an operation that returns a promise
     */
    var PromiseBasedEntry = (function (_super) {
        __extends(PromiseBasedEntry, _super);
        function PromiseBasedEntry(promise, title) {
            var _this = 
            // By the time the promise is set, the process is already in progress
            _super.call(this, title, ActivityLogStatus.InProgress) || this;
            _this._handleFulfilled = function () {
                _this.status = ActivityLogStatus.Success;
            };
            _this._handleRejected = function () {
                _this.status = ActivityLogStatus.Error;
            };
            _this._promise = promise;
            // Hook up the promise success and fail
            promise.then(_this._handleFulfilled, _this._handleRejected);
            return _this;
        }
        return PromiseBasedEntry;
    }(ActivityLogEntry));
    return PromiseBasedEntry;
});
