"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BlobDownloadJobQueuer_1 = require("../Download/BlobDownloadJobQueuer");
var ActivityStatus_1 = require("../../../Components/Activities/ActivityStatus");
var BlobOpenJobQueuer = (function (_super) {
    tslib_1.__extends(BlobOpenJobQueuer, _super);
    function BlobOpenJobQueuer(activityManager, group) {
        return _super.call(this, activityManager, group) || this;
    }
    BlobOpenJobQueuer.prototype._createQueueActivity = function (job) {
        var activity = {
            parent: job.properties.parentActivityRef,
            title: "Queued Open: '" + job.properties.args.blobRef.fileName + "'",
            message: "",
            sortOrder: 1,
            status: ActivityStatus_1.default.Pending,
            progress: 0,
            actions: []
        };
        return activity;
    };
    return BlobOpenJobQueuer;
}(BlobDownloadJobQueuer_1.default));
exports.default = BlobOpenJobQueuer;
