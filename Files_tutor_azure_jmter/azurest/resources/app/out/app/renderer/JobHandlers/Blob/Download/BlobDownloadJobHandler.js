"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var AutoRenewLease_1 = require("../../../Components/Worker/AutoRenewLease");
var RemoteBlobDownloadGroupManager_1 = require("./RemoteBlobDownloadGroupManager");
var BlobDownload_1 = require("./BlobDownload");
var BlobDownloadJobHandler = (function () {
    function BlobDownloadJobHandler(activityManager, host) {
        var _this = this;
        this.queue = { name: "download" };
        this.handleJob = function (lease) {
            var blobDownload = new BlobDownload_1.default(lease.job, _this._activityManager, _this._host, _this._group, lease.retryAttempt);
            // TODO change from using .stop() to .onLeaseExpired() or something similar.
            var autoRenewLease = new AutoRenewLease_1.default(lease, 30000, function (error) {
                blobDownload.stop(error);
            });
            var jobPromise = blobDownload.start();
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
        this._group = new RemoteBlobDownloadGroupManager_1.default(host);
        this._activityManager = activityManager;
    }
    return BlobDownloadJobHandler;
}());
exports.default = BlobDownloadJobHandler;
