"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BlobDownloadJobHandler_1 = require("../Download/BlobDownloadJobHandler");
var BlobOpen_1 = require("./BlobOpen");
var AutoRenewLease_1 = require("../../../Components/Worker/AutoRenewLease");
var BlobOpenJobHandler = (function (_super) {
    tslib_1.__extends(BlobOpenJobHandler, _super);
    function BlobOpenJobHandler(activityManager, host) {
        var _this = _super.call(this, activityManager, host) || this;
        _this.queue = { name: "open" };
        _this.handleJob = function (lease) {
            var blobOpen = new BlobOpen_1.default(lease.job, _this._activityManager, _this._host, _this._group, lease.retryAttempt);
            // TODO change from using .stop() to .onLeaseExpired() or something similar.
            var autoRenewLease = new AutoRenewLease_1.default(lease, 30000, function (error) {
                blobOpen.stop(error);
            });
            var jobPromise = blobOpen.start();
            jobPromise
                .then(function () {
                autoRenewLease.stopRenew();
            })
                .catch(function () {
                autoRenewLease.stopRenew();
            });
            return jobPromise;
        };
        return _this;
    }
    return BlobOpenJobHandler;
}(BlobDownloadJobHandler_1.default));
exports.default = BlobOpenJobHandler;
