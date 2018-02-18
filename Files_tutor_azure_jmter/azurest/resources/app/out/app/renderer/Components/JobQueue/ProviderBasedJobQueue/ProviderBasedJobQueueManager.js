"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var JobQueueManager_1 = require("../JobQueueManager");
var _ = require("underscore");
var StringCrypto_1 = require("../../StringCrypto/StringCrypto");
var path = require("path");
var Q = require("q");
var ProviderBasedJobQueueManager = (function () {
    function ProviderBasedJobQueueManager(host) {
        this._initRetry = 0;
        this._host = host;
    }
    ProviderBasedJobQueueManager.prototype.init = function () {
        var _this = this;
        if (!this._initPromise) {
            this._initPromise =
                this._host.executeOperation("CloudExplorer.Actions.Crypto.GetEncryptionKey", {})
                    .then(function (getEncryptionKeyResponse) {
                    return _this._host.executeOperation("SessionManager.getCurrentSessionFolder", {})
                        .then(function (args) {
                        var stringCrypto = new StringCrypto_1.default(getEncryptionKeyResponse.EncryptionKey);
                        _this._jobQueueManager = new JobQueueManager_1.default(path.join(args.path, "JobQueue.db"), stringCrypto, function (queue) {
                            _this._host.raiseEvent("JobQueueManager.onJobAddedEvent", queue);
                        });
                        _this.registerProviderBasedJobQueuer({
                            queue: { name: "download" },
                            preProcessJobNamespace: "BlobDownloadJobQueuer.preProcess"
                        });
                        _this.registerProviderBasedJobQueuer({
                            queue: { name: "open" },
                            preProcessJobNamespace: "BlobOpenJobQueuer.preProcess"
                        });
                        _this.registerProviderBasedJobIteratorProcessor({
                            queue: { name: "download" },
                            processIteratorNamespace: "BlobDownloadIteratorProcessor.processIterator"
                        });
                        _this.registerProviderBasedJobQueuer({
                            queue: { name: "upload" },
                            preProcessJobNamespace: "BlobUploadJobQueuer.preProcess"
                        });
                        _this.registerProviderBasedJobIteratorProcessor({
                            queue: { name: "upload" },
                            processIteratorNamespace: "BlobUploadIteratorProcessor.processIterator"
                        });
                    });
                })
                    .catch(function (err) {
                    if ((_this._initRetry++) < 5) {
                        _this._initPromise = null;
                        return _this.init();
                    }
                    else {
                        return Q.reject(err);
                    }
                });
        }
        return this._initPromise;
    };
    ProviderBasedJobQueueManager.prototype.addJob = function (queue, job) {
        var _this = this;
        if (this._jobQueueManager) {
            return this._jobQueueManager.addJob(queue, job);
        }
        else {
            return this.init().then(function () { return _this.addJob(queue, job); });
        }
    };
    ProviderBasedJobQueueManager.prototype.addIterator = function (queue, iterator) {
        var _this = this;
        if (this._jobQueueManager) {
            return this._jobQueueManager.addIterator(queue, iterator);
        }
        else {
            return this.init().then(function () { return _this.addIterator(queue, iterator); });
        }
    };
    ProviderBasedJobQueueManager.prototype.updateJob = function (lease, job) {
        var _this = this;
        if (this._jobQueueManager) {
            return this._jobQueueManager.updateJob(lease, job);
        }
        else {
            return this.init().then(function () { return _this.updateJob(lease, job); });
        }
    };
    ProviderBasedJobQueueManager.prototype.getQueueStats = function (queue) {
        var _this = this;
        if (this._jobQueueManager) {
            return this._jobQueueManager.getQueueStats(queue);
        }
        else {
            return this.init().then(function () { return _this.getQueueStats(queue); });
        }
    };
    ProviderBasedJobQueueManager.prototype.deleteJob = function (lease) {
        var _this = this;
        if (this._jobQueueManager) {
            return this._jobQueueManager.deleteJob(lease);
        }
        else {
            return this.init().then(function () { return _this.deleteJob(lease); });
        }
    };
    ProviderBasedJobQueueManager.prototype.nextJobLease = function (queue, ms) {
        var _this = this;
        if (this._jobQueueManager) {
            return this._jobQueueManager.nextJobLease(queue, ms);
        }
        else {
            return this.init().then(function () { return _this.nextJobLease(queue, ms); });
        }
    };
    ProviderBasedJobQueueManager.prototype.releaseJobLease = function (lease) {
        var _this = this;
        if (this._jobQueueManager) {
            return this._jobQueueManager.releaseJobLease(lease);
        }
        else {
            return this.init().then(function () { return _this.releaseJobLease(lease); });
        }
    };
    ProviderBasedJobQueueManager.prototype.renewJobLease = function (lease, ms) {
        var _this = this;
        if (this._jobQueueManager) {
            return this._jobQueueManager.renewJobLease(lease, ms);
        }
        else {
            return this.init().then(function () { return _this.renewJobLease(lease, ms); });
        }
    };
    ProviderBasedJobQueueManager.prototype.clearQueue = function (queue) {
        var _this = this;
        if (this._jobQueueManager) {
            return this._jobQueueManager.clearQueue(queue);
        }
        else {
            return this.init().then(function () { return _this.clearQueue(queue); });
        }
    };
    ProviderBasedJobQueueManager.prototype.registerJobQueuer = function (queuer) {
        var _this = this;
        if (this._jobQueueManager) {
            return this._jobQueueManager.registerJobQueuer(queuer);
        }
        else {
            return this.init().then(function () { return _this.registerJobQueuer(queuer); });
        }
    };
    ProviderBasedJobQueueManager.prototype.registerJobIteratorProcessor = function (queuer) {
        var _this = this;
        if (this._jobQueueManager) {
            return this._jobQueueManager.registerJobIteratorProcessor(queuer);
        }
        else {
            return this.init().then(function () { return _this.registerJobIteratorProcessor(queuer); });
        }
    };
    ProviderBasedJobQueueManager.prototype.registerProviderBasedJobQueuer = function (queuer) {
        var _this = this;
        return this.registerJobQueuer({
            queue: queuer.queue,
            preProcess: function (item) {
                /* tslint:disable */
                var args = _.extend(args || {}, {
                    item: item
                });
                /* tslint:enable */
                return _this._host.executeOperation(queuer.preProcessJobNamespace, args);
            }
        });
    };
    ProviderBasedJobQueueManager.prototype.registerProviderBasedJobIteratorProcessor = function (queuer) {
        var _this = this;
        return this.registerJobIteratorProcessor({
            queue: queuer.queue,
            processIterator: function (iterator) {
                /* tslint:disable */
                var args = _.extend(args || {}, {
                    iterator: iterator
                });
                /* tslint:enable */
                return _this._host.executeOperation(queuer.processIteratorNamespace, args);
            }
        });
    };
    return ProviderBasedJobQueueManager;
}());
exports.default = ProviderBasedJobQueueManager;
