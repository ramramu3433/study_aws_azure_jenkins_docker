"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var AutoRenewLease_1 = require("../../../Components/Worker/AutoRenewLease");
var RemoteBlobUploadGroupManager_1 = require("./RemoteBlobUploadGroupManager");
var BlobUpload_1 = require("./BlobUpload");
var BlobUploadJobHandler = (function () {
    function BlobUploadJobHandler(activityManager, host) {
        var _this = this;
        this.queue = { name: "upload" };
        this.handleJob = function (lease) {
            var blobUpload = new BlobUpload_1.default(lease.job, _this._activityManager, _this._host, _this._group, lease.retryAttempt);
            // TODO change from using .stop() to .onLeaseExpired() or something similar.
            var autoRenewLease = new AutoRenewLease_1.default(lease, 30000, function (error) {
                blobUpload.stop(error);
            });
            var jobPromise = blobUpload.start();
            jobPromise
                .then(function () {
                autoRenewLease.stopRenew();
            })
                .catch(function () {
                autoRenewLease.stopRenew();
            });
            return jobPromise;
        };
        this._host = host;
        this._activityManager = activityManager;
        this._group = new RemoteBlobUploadGroupManager_1.default(host);
    }
    return BlobUploadJobHandler;
}());
exports.default = BlobUploadJobHandler;
