"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var RemoteJobQueueManager = (function () {
    function RemoteJobQueueManager(host) {
        this._host = host;
    }
    RemoteJobQueueManager.prototype.addJob = function (queue, job) {
        return this._host.executeOperation("JobQueueManager.addJob", { queue: queue, job: job });
    };
    RemoteJobQueueManager.prototype.addIterator = function (queue, iterator) {
        return this._host.executeOperation("JobQueueManager.addIterator", { queue: queue, iterator: iterator });
    };
    RemoteJobQueueManager.prototype.getQueueStats = function (queue) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var queueStats;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._host.executeOperation("JobQueueManager.getQueueStats", queue)];
                    case 1:
                        queueStats = _a.sent();
                        return [2 /*return*/, queueStats];
                }
            });
        });
    };
    RemoteJobQueueManager.prototype.nextJobLease = function (queue, ms) {
        return this._host.executeOperation("JobQueueManager.nextJobLease", { queue: queue, ms: ms });
    };
    RemoteJobQueueManager.prototype.renewJobLease = function (lease, ms) {
        return this._host.executeOperation("JobQueueManager.renewJobLease", { lease: lease, ms: ms });
    };
    RemoteJobQueueManager.prototype.releaseJobLease = function (lease) {
        return this._host.executeOperation("JobQueueManager.releaseJobLease", lease);
    };
    RemoteJobQueueManager.prototype.updateJob = function (lease, job) {
        return this._host.executeOperation("JobQueueManager.updateJob", { lease: lease, job: job });
    };
    RemoteJobQueueManager.prototype.deleteJob = function (lease) {
        return this._host.executeOperation("JobQueueManager.deleteJob", lease);
    };
    RemoteJobQueueManager.prototype.clearQueue = function (queue) {
        return this._host.executeOperation("JobQueueManager.clearQueue", queue);
    };
    RemoteJobQueueManager.prototype.registerJobQueuer = function (queuer) {
        return Promise.reject("Not supported. Use registerProviderBasedJobQueuer.");
    };
    RemoteJobQueueManager.prototype.registerProviderBasedJobQueuer = function (queuer) {
        return this._host.executeOperation("JobQueueManager.registerJobQueuer", queuer);
    };
    RemoteJobQueueManager.prototype.registerJobIteratorProcessor = function (queuer) {
        return Promise.reject("Not supported. Use registerProviderBasedJobIteratorProcessor.");
    };
    RemoteJobQueueManager.prototype.registerProviderBasedJobIteratorProcessor = function (queuer) {
        return this._host.executeOperation("JobQueueManager.registerJobIteratorProcessor", queuer);
    };
    return RemoteJobQueueManager;
}());
exports.default = RemoteJobQueueManager;
