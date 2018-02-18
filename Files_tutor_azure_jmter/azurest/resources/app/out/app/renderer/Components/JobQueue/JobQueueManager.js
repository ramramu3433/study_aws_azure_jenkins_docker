"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var RemoteJobQueueManager_1 = require("./ProviderBasedJobQueue/Remote/RemoteJobQueueManager");
exports.Remote = RemoteJobQueueManager_1.default;
var Q = require("q");
// Consider using https://github.com/Ivshti/linvodb3 if we need large scale
var Nedb = require("nedb");
var JobQueueManager = (function () {
    function JobQueueManager(filePath, stringCrypto, onAddedEventCallback) {
        var _this = this;
        this._onAddedEventCallback = null;
        this._afterSerialization = function (input) {
            var encryptedText = _this._stringCrypto.encrypt(input);
            // Returned value cannot contain '\n' character per nedb spec.
            return encryptedText.replace("\n", "!~~n");
        };
        this._beforeDeserialization = function (input) {
            // Serialized value had newlines replaced - See JobQueueManager._afterSerialization.
            var inputWithNewlines = input.replace("!~~n", "\n");
            return _this._stringCrypto.decrypt(inputWithNewlines);
        };
        this._addJobQueue = [];
        this._processingAddItem = false;
        this._processAddJobComplete = function () {
            if (_this._addJobQueue.length > 0) {
                var addJobOperation = _this._addJobQueue.shift();
                addJobOperation();
            }
            else {
                _this._processingAddItem = false;
            }
        };
        this._processAddItem = function (queue, item, parentId, pos) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var nextPos, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(pos !== null && pos !== undefined)) return [3 /*break*/, 1];
                        _a = pos;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this._getNextQueuePosition(queue)];
                    case 2:
                        _a = _b.sent();
                        _b.label = 3;
                    case 3:
                        nextPos = _a;
                        return [4 /*yield*/, Q.Promise(function (resolve, reject) {
                                _this._database.insert({ queue: queue, item: item, position: nextPos, leaseExpiration: 0, retryAttempt: 0, _parentId: parentId }, function (err, document) {
                                    if (!!_this._onAddedEventCallback) {
                                        _this._onAddedEventCallback(queue);
                                    }
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(document._id);
                                    }
                                });
                            })];
                    case 4: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this._nextJobQueue = [];
        this._processingNextJob = false;
        this._processNextJobLeaseComplete = function () {
            if (_this._nextJobQueue.length > 0) {
                var nextJobOperation = _this._nextJobQueue.shift();
                nextJobOperation();
            }
            else {
                _this._processingNextJob = false;
            }
        };
        this._processNextJobLease = function (resolve, reject, queue, leaseMs) {
            if (leaseMs === void 0) { leaseMs = 2000; }
            _this._database.find({ "queue.name": queue.name, leaseExpiration: { "$lte": Date.now() } })
                .sort({ position: 1 })
                .limit(1)
                .exec(function (err, documents) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var _this = this;
                var queueEntry, processIteratorResult, jobs, newIterator, atLeastOneJobAdded, i, job, setObj;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!err) return [3 /*break*/, 1];
                            reject(err);
                            return [3 /*break*/, 15];
                        case 1:
                            if (!(documents && documents.length > 0)) return [3 /*break*/, 14];
                            queueEntry = documents[0];
                            if (!(queueEntry.item.type === "Iterator")) return [3 /*break*/, 12];
                            return [4 /*yield*/, this._jobIteratorProcessorMap[queue.name].processIterator(queueEntry.item)];
                        case 2:
                            processIteratorResult = _a.sent();
                            jobs = processIteratorResult.jobs;
                            newIterator = processIteratorResult.newIterator;
                            atLeastOneJobAdded = false;
                            if (!(!!jobs && jobs.length > 0)) return [3 /*break*/, 8];
                            return [4 /*yield*/, this._addItem(queue, jobs[0], queueEntry._id, queueEntry.position)];
                        case 3:
                            _a.sent();
                            i = 1;
                            _a.label = 4;
                        case 4:
                            if (!(i < jobs.length)) return [3 /*break*/, 7];
                            job = jobs[i];
                            return [4 /*yield*/, this._addItem(queue, job)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            i++;
                            return [3 /*break*/, 4];
                        case 7:
                            atLeastOneJobAdded = true;
                            _a.label = 8;
                        case 8:
                            if (!!!newIterator) return [3 /*break*/, 10];
                            return [4 /*yield*/, this._addItem(queue, newIterator, queueEntry._id, null, false)];
                        case 9:
                            _a.sent();
                            _a.label = 10;
                        case 10: return [4 /*yield*/, this._deleteItem(queueEntry)];
                        case 11:
                            _a.sent();
                            if (atLeastOneJobAdded) {
                                this._nextJobQueue.unshift(function () { return _this._processNextJobLease(resolve, reject, queue, leaseMs); });
                            }
                            else {
                                this._nextJobQueue.push(function () { return _this._processNextJobLease(resolve, reject, queue, leaseMs); });
                            }
                            this._processNextJobLeaseComplete();
                            return [3 /*break*/, 13];
                        case 12:
                            setObj = {
                                leaseExpiration: Date.now() + leaseMs
                            };
                            if (queueEntry.leaseExpiration > 0) {
                                setObj.retryAttempt = queueEntry.retryAttempt + 1;
                            }
                            this._database.update({ "_id": queueEntry._id }, { "$set": setObj }, { returnUpdatedDocs: true, multi: false }, function (err, n, queueEntry) {
                                if (err) {
                                    reject(err);
                                }
                                else if (queueEntry) {
                                    resolve(_this._convertQueueEntryToJobLease(queueEntry));
                                }
                            });
                            _a.label = 13;
                        case 13: return [3 /*break*/, 15];
                        case 14:
                            resolve(undefined);
                            _a.label = 15;
                        case 15: return [2 /*return*/];
                    }
                });
            }); });
        };
        this._jobQueuerMap = Object.create(null);
        this._jobIteratorProcessorMap = Object.create(null);
        this._stringCrypto = stringCrypto;
        this._database = new Nedb({
            autoload: true,
            filename: filePath,
            afterSerialization: this._afterSerialization,
            beforeDeserialization: this._beforeDeserialization
        });
        if (!!onAddedEventCallback) {
            this._onAddedEventCallback = onAddedEventCallback;
        }
        this._database.persistence.setAutocompactionInterval(60000);
    }
    JobQueueManager.prototype._getNextQueuePosition = function (queue) {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            _this._database.find({ "queue.name": queue.name })
                .sort({ position: -1 })
                .limit(1)
                .exec(function (err, documents) {
                if (err) {
                    reject(err);
                }
                else {
                    if (documents.length > 0) {
                        resolve(documents[0].position + 1);
                    }
                    else {
                        resolve(0);
                    }
                }
            });
        });
    };
    JobQueueManager.prototype.addJob = function (queue, job) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._addItem(queue, job)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    JobQueueManager.prototype.addIterator = function (queue, iterator) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._addItem(queue, iterator)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    JobQueueManager.prototype._addItem = function (queue, item, parentId, pos, preProcess) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(preProcess === null || preProcess === undefined || preProcess)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._preProcessItem(queue, item)];
                    case 1:
                        item = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 7, 8]);
                        if (!!this._processingAddItem) return [3 /*break*/, 4];
                        this._processingAddItem = true;
                        return [4 /*yield*/, this._processAddItem(queue, item, parentId, pos)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [4 /*yield*/, Q.Promise(function (resolve, reject) {
                            var queuedItemPromise = function () {
                                return _this._processAddItem(queue, item, parentId, pos)
                                    .then(resolve)
                                    .catch(function (err) { return reject(err); });
                            };
                            _this._addJobQueue.push(queuedItemPromise);
                        })];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        this._processAddJobComplete();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    JobQueueManager.prototype._preProcessItem = function (queue, item) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var jobQueuers, i;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jobQueuers = this._jobQueuerMap[queue.name];
                        if (!(!!jobQueuers && jobQueuers.length > 0)) return [3 /*break*/, 4];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < jobQueuers.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, jobQueuers[i].preProcess(item)];
                    case 2:
                        item = _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, item];
                }
            });
        });
    };
    JobQueueManager.prototype.getQueueStats = function (queue) {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            _this._database.count({ "queue.name": queue.name, leaseExpiration: { "$lte": Date.now() } }, function (err, n) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ count: n });
                }
            });
        });
    };
    JobQueueManager.prototype.nextJobLease = function (queue, leaseMs) {
        if (leaseMs === void 0) { leaseMs = 2000; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, Q.Promise(function (resolve, reject, notify) {
                        if (!_this._processingNextJob) {
                            _this._processingNextJob = true;
                            _this._processNextJobLease(resolve, reject, queue, leaseMs);
                        }
                        else {
                            _this._nextJobQueue.push(function () { return _this._processNextJobLease(resolve, reject, queue, leaseMs); });
                        }
                    }).finally(this._processNextJobLeaseComplete)];
            });
        });
    };
    JobQueueManager.prototype.releaseJobLease = function (lease) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, Q.Promise(function (resolve, reject, notify) {
                        if (lease.expiration < Date.now()) {
                            resolve(null);
                        }
                        _this._database.update({ _id: lease.id }, { "$set": { leaseExpiration: Date.now() - 1 } }, { returnUpdatedDocs: true, multi: false }, function (err, n, queueEntry) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(null);
                            }
                        });
                    })];
            });
        });
    };
    JobQueueManager.prototype.renewJobLease = function (lease, leaseMs) {
        var _this = this;
        if (leaseMs === void 0) { leaseMs = 2000; }
        return Q.Promise(function (resolve, reject, notify) {
            if (lease.expiration < Date.now()) {
                reject("Existing lease has already expired.");
            }
            else {
                _this._database.update({ _id: lease.id, leaseExpiration: lease.expiration }, { "$set": { leaseExpiration: Date.now() + leaseMs } }, { returnUpdatedDocs: true, multi: false }, function (err, n, queueEntry) {
                    if (err) {
                        reject(err);
                    }
                    else if (n === 0) {
                        reject("Unable to renew job lease.");
                    }
                    else {
                        resolve(_this._convertQueueEntryToJobLease(queueEntry));
                    }
                });
            }
        });
    };
    JobQueueManager.prototype.updateJob = function (lease, job) {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            _this._database.update({ _id: lease.id }, { "$set": { item: job } }, { returnUpdatedDocs: true, multi: false }, function (err, n, queueEntry) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(_this._convertQueueEntryToJobLease(queueEntry));
                }
            });
        });
    };
    JobQueueManager.prototype._convertQueueEntryToJobLease = function (queueEntry) {
        return { id: queueEntry._id, job: queueEntry.item, queue: queueEntry.queue, expiration: queueEntry.leaseExpiration, retryAttempt: queueEntry.retryAttempt, groupId: queueEntry._parentId };
    };
    JobQueueManager.prototype.deleteJob = function (lease) {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            _this._database.remove({ _id: lease.id }, { multi: false }, function (err, n) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(null);
                }
            });
        });
    };
    JobQueueManager.prototype._deleteItem = function (queueEntry) {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            _this._database.remove({ _id: queueEntry._id }, { multi: false }, function (err, n) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(null);
                }
            });
        });
    };
    JobQueueManager.prototype.clearQueue = function (queue) {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            _this._database.remove({ "queue.name": queue.name }, { multi: true }, function (err, n) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(null);
                }
            });
        });
    };
    JobQueueManager.prototype.registerJobQueuer = function (queuer) {
        if (!this._jobQueuerMap[queuer.queue.name]) {
            this._jobQueuerMap[queuer.queue.name] = [];
        }
        this._jobQueuerMap[queuer.queue.name].push(queuer);
        return Promise.resolve();
    };
    JobQueueManager.prototype.registerJobIteratorProcessor = function (queuer) {
        this._jobIteratorProcessorMap[queuer.queue.name] = queuer;
        return Promise.resolve();
    };
    JobQueueManager.prototype.numJobs = function () {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            _this._database.count({}, function (err, n) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(n);
                }
            });
        });
    };
    return JobQueueManager;
}());
exports.default = JobQueueManager;
