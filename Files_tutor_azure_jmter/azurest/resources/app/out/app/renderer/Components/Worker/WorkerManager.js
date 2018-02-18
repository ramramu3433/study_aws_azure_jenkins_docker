"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var JobQueueManager_1 = require("../../Components/JobQueue/JobQueueManager");
var ExceptionSerialization_1 = require("../../Components/Errors/ExceptionSerialization");
var WorkerManager = (function () {
    function WorkerManager() {
        var _this = this;
        this._host = global.host;
        this._remoteJobQueueManager = new JobQueueManager_1.Remote(this._host);
        this._idleJobWorkerMap = Object.create(null);
        this._activeJobWorkerMap = Object.create(null);
        this._processingQueueMap = {};
        this.registerWorker = function (worker) {
            if (!_this._idleJobWorkerMap[worker.queue.name]) {
                _this._idleJobWorkerMap[worker.queue.name] = [];
            }
            if (!_this._activeJobWorkerMap[worker.queue.name]) {
                _this._activeJobWorkerMap[worker.queue.name] = [];
            }
            _this._idleJobWorkerMap[worker.queue.name].push(worker);
        };
        this.processQueue = function (queue) {
            if (!_this._processingQueueMap[queue.name]) {
                _this._processingQueueMap[queue.name] = true;
            }
            _this._processQueue(queue);
        };
        this._processQueue = function (queue) {
            if (_this._hasAvailableWorker(queue)) {
                var jobWorker = _this._reserveWorker(queue);
                _this._remoteJobQueueManager.nextJobLease(queue, WorkerManager.processStartTimeAllotment).then(function (lease) {
                    if (lease && lease.job) {
                        jobWorker.handleJob(lease)
                            .then(function (jobHandled) {
                            _this._releaseWorker(queue, jobWorker);
                            _this._processQueue(queue);
                            if (jobHandled) {
                                _this._remoteJobQueueManager.deleteJob(lease);
                            }
                        }).catch(function (err) {
                            _this._releaseWorker(queue, jobWorker);
                            _this._processQueue(queue);
                            _this._tryAddErrorToJob(lease, lease.job, err);
                        });
                    }
                    else {
                        _this._releaseWorker(queue, jobWorker);
                    }
                }).catch(function (err) {
                    _this._releaseWorker(queue, jobWorker);
                });
            }
        };
        this._tryAddErrorToJob = function (lease, job, error) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!lease.job.properties.unhandledErrors) {
                            lease.job.properties.unhandledErrors = [];
                        }
                        lease.job.properties.unhandledErrors.push(ExceptionSerialization_1.default.serialize(error));
                        return [4 /*yield*/, this._remoteJobQueueManager.updateJob(lease, lease.job)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        err_1 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    WorkerManager.prototype._hasAvailableWorker = function (queue) {
        return this._idleJobWorkerMap[queue.name] && this._idleJobWorkerMap[queue.name].length > 0;
    };
    WorkerManager.prototype._reserveWorker = function (queue) {
        var jobWorker = this._idleJobWorkerMap[queue.name].shift();
        this._activeJobWorkerMap[queue.name].unshift(jobWorker);
        return jobWorker;
    };
    WorkerManager.prototype._releaseWorker = function (queue, worker) {
        var workerIndex = this._activeJobWorkerMap[queue.name].indexOf(worker);
        var removed = this._activeJobWorkerMap[queue.name].splice(workerIndex, 1);
        if (!!removed && removed.length === 1) {
            this._idleJobWorkerMap[queue.name].unshift(worker);
        }
    };
    return WorkerManager;
}());
WorkerManager.processStartTimeAllotment = 10 * 1000;
exports.default = WorkerManager;
