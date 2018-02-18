"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var JobQueueManager_1 = require("../../Components/JobQueue/JobQueueManager");
var AutoRenewLease = (function () {
    function AutoRenewLease(lease, ms, errorHandler) {
        if (ms === void 0) { ms = 2000; }
        var _this = this;
        this._host = global.host;
        this._remoteJobQueueManager = new JobQueueManager_1.Remote(this._host);
        this._renew = true;
        this._renewLease = function () {
            if (_this._renew) {
                _this._remoteJobQueueManager.renewJobLease(_this._lease, _this._ms).then(function (lease) {
                    _this._lease = lease;
                    setTimeout(_this._renewLease, (lease.expiration - Date.now()) / 2);
                }).catch(function (err) {
                    if (_this._errorHandler) {
                        _this._errorHandler(err);
                    }
                });
            }
        };
        this.stopRenew = function () {
            _this._renew = false;
        };
        this._lease = lease;
        this._ms = ms;
        this._renewLease();
        this._errorHandler = errorHandler;
    }
    return AutoRenewLease;
}());
exports.default = AutoRenewLease;
