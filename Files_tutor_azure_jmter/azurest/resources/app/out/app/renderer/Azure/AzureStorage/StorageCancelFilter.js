"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Q = require("q");
var storageErrors = require("./StorageErrors");
var storageFilters = require("./StorageFilters");
var StorageCancelFilter = (function (_super) {
    tslib_1.__extends(StorageCancelFilter, _super);
    function StorageCancelFilter(callerName) {
        var _this = _super.call(this, callerName) || this;
        _this._isCancelResolutionScheduled = false;
        return _this;
    }
    StorageCancelFilter.prototype.Cancel = function () {
        if (!this._cancelDeferred) {
            this._cancelDeferred = Q.defer();
        }
        return this._cancelDeferred.promise;
    };
    StorageCancelFilter.prototype.preProcess = function (requestOptions) {
        // Can modify requestOptions (best to clone it first if you do)
        return requestOptions;
    };
    StorageCancelFilter.prototype.postProcess = function (returnObject) {
        var _this = this;
        if (this._cancelDeferred) {
            if (!this._isCancelResolutionScheduled) {
                // Resolve the act of canceling in the next CPU cycle
                setTimeout(function () { return _this._cancelDeferred.resolve(null); }, 1);
                this._isCancelResolutionScheduled = true;
            }
            // Cancel the current operation by throwing an exception
            throw storageErrors.ActionCanceledError.getHostErrorInstance("Operation canceled."); // Localize
        }
        return returnObject;
    };
    return StorageCancelFilter;
}(storageFilters.StorageFilter));
exports.default = StorageCancelFilter;
