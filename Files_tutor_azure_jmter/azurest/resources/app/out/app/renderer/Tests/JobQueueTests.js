"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var JobQueueManager_1 = require("../Components/JobQueue/JobQueueManager");
var Assert_1 = require("../Components/TestManager/Assert");
var JobQueueTests = (function (_super) {
    tslib_1.__extends(JobQueueTests, _super);
    function JobQueueTests(activityManager) {
        var _this = _super.call(this, "Job Queue Tests", activityManager) || this;
        _this._remoteJobQueueManager = new JobQueueManager_1.Remote(_this._host);
        _this._addOneAndProcessTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, job, getJobCount, lease, getJobCountAfterLease;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue1" };
                        job = {
                            type: "Job",
                            properties: {
                                arg: "Woot"
                            }
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 3:
                        getJobCount = (_a.sent()).count;
                        Assert_1.default(getJobCount === 1, "Job count should be 1.");
                        return [4 /*yield*/, this._remoteJobQueueManager.nextJobLease(queue)];
                    case 4:
                        lease = _a.sent();
                        Assert_1.default(JSON.stringify(job) === JSON.stringify(lease.job), "Added job and leased job should be equal.");
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 5:
                        getJobCountAfterLease = (_a.sent()).count;
                        Assert_1.default(getJobCountAfterLease === 0, "Job count should be 0 after lease.");
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._addMultipleAndProcessOneTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, job, getJobCount, lease, getJobCountAfterRemoval;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue2" };
                        job = {
                            type: "Job",
                            properties: {
                                arg: "Woot"
                            }
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 7:
                        getJobCount = (_a.sent()).count;
                        Assert_1.default(getJobCount === 5, "Job count should equal 5.");
                        return [4 /*yield*/, this._remoteJobQueueManager.nextJobLease(queue)];
                    case 8:
                        lease = _a.sent();
                        Assert_1.default(JSON.stringify(job) === JSON.stringify(lease.job), "Added job and leased job should be equal.");
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 9:
                        getJobCountAfterRemoval = (_a.sent()).count;
                        Assert_1.default(getJobCountAfterRemoval === 4, "Job count after removal should equal 4.");
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 10:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._expiredLeaseTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, job, getJobCount, lease, getJobCountAfterLeaseExpiration;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue3" };
                        job = {
                            type: "Job",
                            properties: {
                                arg: "Woot"
                            }
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 3:
                        getJobCount = (_a.sent()).count;
                        Assert_1.default(getJobCount === 1, "Job count should be 1.");
                        return [4 /*yield*/, this._remoteJobQueueManager.nextJobLease(queue)];
                    case 4:
                        lease = (_a.sent());
                        Assert_1.default(JSON.stringify(job) === JSON.stringify(lease.job), "Added job and leased job should be equal.");
                        // Let lease expire
                        return [4 /*yield*/, this._createTimerPromise(lease.expiration - Date.now())];
                    case 5:
                        // Let lease expire
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 6:
                        getJobCountAfterLeaseExpiration = (_a.sent()).count;
                        Assert_1.default(getJobCountAfterLeaseExpiration === 1, "Job count after lease expiration should be 1.");
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._renewLeaseTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, job, getJobCount, firstLease, secondLease, jobCountAfterFirstLeaseExpiration, jobCountAfterSecondLeaseExpiration;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue4" };
                        job = {
                            type: "Job",
                            properties: {
                                arg: "Woot"
                            }
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 3:
                        getJobCount = (_a.sent()).count;
                        Assert_1.default(getJobCount === 1, "Job count should be 1.");
                        return [4 /*yield*/, this._remoteJobQueueManager.nextJobLease(queue)];
                    case 4:
                        firstLease = (_a.sent());
                        return [4 /*yield*/, this._remoteJobQueueManager.renewJobLease(firstLease, 3000)];
                    case 5:
                        secondLease = _a.sent();
                        Assert_1.default(secondLease.expiration > firstLease.expiration, "Second lease should have been extended.");
                        Assert_1.default(JSON.stringify(job) === JSON.stringify(firstLease.job), "Added job and leased job should be equal.");
                        return [4 /*yield*/, this._createTimerPromise(firstLease.expiration - Date.now())];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 7:
                        jobCountAfterFirstLeaseExpiration = (_a.sent()).count;
                        Assert_1.default(jobCountAfterFirstLeaseExpiration === 0, "Job should still be leased.");
                        return [4 /*yield*/, this._createTimerPromise(secondLease.expiration - Date.now())];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 9:
                        jobCountAfterSecondLeaseExpiration = (_a.sent()).count;
                        Assert_1.default(jobCountAfterSecondLeaseExpiration === 1, "Job lease should have expired.");
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 10:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._leaseDelete = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, job, getJobCount, lease, jobCountAfterExpiration;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue5" };
                        job = {
                            type: "Job",
                            properties: {
                                arg: "Woot"
                            }
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 3:
                        getJobCount = (_a.sent()).count;
                        Assert_1.default(getJobCount === 1, "Job count should be 1.");
                        return [4 /*yield*/, this._remoteJobQueueManager.nextJobLease(queue)];
                    case 4:
                        lease = (_a.sent());
                        Assert_1.default(JSON.stringify(job) === JSON.stringify(lease.job), "Added job and leased job should be equal.");
                        this._remoteJobQueueManager.deleteJob(lease);
                        return [4 /*yield*/, this._createTimerPromise(lease.expiration - Date.now())];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 6:
                        jobCountAfterExpiration = (_a.sent()).count;
                        Assert_1.default(jobCountAfterExpiration === 0, "Job count should still be 0 after expiration.");
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._updateJob = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, job, updatedJob, getJobCount, lease, updatedLease;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue6" };
                        job = {
                            type: "Job",
                            properties: {
                                arg: "Woot"
                            }
                        };
                        updatedJob = {
                            type: "Job",
                            properties: {
                                arg: "UpdatedWoot"
                            }
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 3:
                        getJobCount = (_a.sent()).count;
                        Assert_1.default(getJobCount === 1, "Job count should be 1.");
                        return [4 /*yield*/, this._remoteJobQueueManager.nextJobLease(queue)];
                    case 4:
                        lease = _a.sent();
                        Assert_1.default(JSON.stringify(job) === JSON.stringify(lease.job), "Added job and leased job should be equal.");
                        return [4 /*yield*/, this._remoteJobQueueManager.updateJob(lease, updatedJob)];
                    case 5:
                        updatedLease = _a.sent();
                        Assert_1.default(JSON.stringify(updatedJob) === JSON.stringify(updatedLease.job), "Updated job and leased updated job should be equal.");
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._clearQueue = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, job, getJobCount, getJobCountAfterClear;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue7" };
                        job = {
                            type: "Job",
                            properties: {
                                arg: "Woot"
                            }
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 7:
                        getJobCount = (_a.sent()).count;
                        Assert_1.default(getJobCount === 5, "Job count should be 5.");
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 9:
                        getJobCountAfterClear = (_a.sent()).count;
                        Assert_1.default(getJobCountAfterClear === 0, "Job count should be 0.");
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._renewExpiredLease = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, job, firstLease, errorMessage;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue8" };
                        job = {
                            type: "Job",
                            properties: {
                                arg: "Woot"
                            }
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, job)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.nextJobLease(queue, 500)];
                    case 3:
                        firstLease = _a.sent();
                        return [4 /*yield*/, this._createTimerPromise(2000)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, (this._remoteJobQueueManager.renewJobLease(firstLease, 2000).then(function () {
                                return "";
                            }).catch(function (error) {
                                return error;
                            }))];
                    case 5:
                        errorMessage = _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 6:
                        _a.sent();
                        Assert_1.default(errorMessage === "Existing lease has already expired.", "Renewing Expired Lease Should Have Thrown Error");
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._simpleIteratorTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, iterator, iteratorProcessor, firstCount, lease, finalCount;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue9" };
                        iterator = {
                            type: "Iterator",
                            properties: {
                                testProperty: "woot",
                                testName: "Simple Iterator"
                            }
                        };
                        iteratorProcessor = {
                            processIteratorNamespace: "JobQueueTestsProvider.processIterator",
                            queue: queue,
                            args: {}
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.registerProviderBasedJobIteratorProcessor(iteratorProcessor)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addIterator(queue, iterator)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 4:
                        firstCount = (_a.sent()).count;
                        return [4 /*yield*/, this._remoteJobQueueManager.nextJobLease(queue)];
                    case 5:
                        lease = _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 6:
                        finalCount = (_a.sent()).count;
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, firstCount === 1 && !!lease && lease.job.properties === iterator.properties.testProperty && finalCount === 0];
                }
            });
        }); };
        _this._tenThingsIteratorTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, iterator, iteratorProcessor, propertyValuesCorrect, i, lease, shouldBeNullLease, finalCount;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue10" };
                        iterator = {
                            type: "Iterator",
                            properties: {
                                testName: "Iterator That Gives 10 Things",
                                count: 10
                            }
                        };
                        iteratorProcessor = {
                            processIteratorNamespace: "JobQueueTestsProvider.processIterator",
                            queue: queue,
                            args: {}
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.registerProviderBasedJobIteratorProcessor(iteratorProcessor)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addIterator(queue, iterator)];
                    case 3:
                        _a.sent();
                        propertyValuesCorrect = true;
                        i = 10;
                        _a.label = 4;
                    case 4:
                        if (!(i > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._remoteJobQueueManager.nextJobLease(queue)];
                    case 5:
                        lease = _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.renewJobLease(lease, 30 * 1000)];
                    case 6:
                        _a.sent();
                        propertyValuesCorrect = propertyValuesCorrect && lease.job.properties === i;
                        _a.label = 7;
                    case 7:
                        i--;
                        return [3 /*break*/, 4];
                    case 8: return [4 /*yield*/, this._remoteJobQueueManager.nextJobLease(queue)];
                    case 9:
                        shouldBeNullLease = _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 10:
                        finalCount = (_a.sent()).count;
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 11:
                        _a.sent();
                        return [2 /*return*/, finalCount === 0 && propertyValuesCorrect && !shouldBeNullLease];
                }
            });
        }); };
        _this._iteratorWithNoThings = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, iterator, iteratorProcessor, shouldBeNullLease, finalCount;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue11" };
                        iterator = {
                            type: "Iterator",
                            properties: {
                                testName: "Iterator With No Things",
                                count: 10
                            }
                        };
                        iteratorProcessor = {
                            processIteratorNamespace: "JobQueueTestsProvider.processIterator",
                            queue: queue,
                            args: {}
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.registerProviderBasedJobIteratorProcessor(iteratorProcessor)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addIterator(queue, iterator)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.nextJobLease(queue)];
                    case 4:
                        shouldBeNullLease = _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.getQueueStats(queue)];
                    case 5:
                        finalCount = (_a.sent()).count;
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, finalCount === 0 && !shouldBeNullLease];
                }
            });
        }); };
        _this._jobOrdering = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var queue, iteratorLong, jobOne, iteratorShort, iteratorProcessor, longProcessedTime, shortProcessedTime, jobReturnedBetweenIterators, promises;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = { name: "Queue16" };
                        iteratorLong = {
                            type: "Iterator",
                            properties: {
                                testName: "Job Ordering",
                                long: true
                            }
                        };
                        jobOne = {
                            type: "Job",
                            properties: {
                                arg: "Woot"
                            }
                        };
                        iteratorShort = {
                            type: "Iterator",
                            properties: {
                                testName: "Job Ordering",
                                long: false
                            }
                        };
                        iteratorProcessor = {
                            processIteratorNamespace: "JobQueueTestsProvider.processIterator",
                            queue: queue,
                            args: {}
                        };
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.registerProviderBasedJobIteratorProcessor(iteratorProcessor)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addIterator(queue, iteratorLong)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addJob(queue, jobOne)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.addIterator(queue, iteratorShort)];
                    case 5:
                        _a.sent();
                        longProcessedTime = -1;
                        shortProcessedTime = -1;
                        jobReturnedBetweenIterators = false;
                        promises = [];
                        promises.push(this._remoteJobQueueManager.nextJobLease(queue).then(function (lease) {
                            if (lease.job.properties.long) {
                                longProcessedTime = lease.job.properties.time;
                            }
                            else if (lease.job.properties.arg === "Woot") {
                                jobReturnedBetweenIterators = longProcessedTime > -1 && shortProcessedTime === -1;
                            }
                            else {
                                shortProcessedTime = lease.job.properties.time;
                            }
                        }));
                        promises.push(this._remoteJobQueueManager.nextJobLease(queue).then(function (lease) {
                            if (lease.job.properties.long) {
                                longProcessedTime = lease.job.properties.time;
                            }
                            else if (lease.job.properties.arg === "Woot") {
                                jobReturnedBetweenIterators = longProcessedTime > -1 && shortProcessedTime === -1;
                            }
                            else {
                                shortProcessedTime = lease.job.properties.time;
                            }
                        }));
                        promises.push(this._remoteJobQueueManager.nextJobLease(queue).then(function (lease) {
                            if (lease.job.properties.long) {
                                longProcessedTime = lease.job.properties.time;
                            }
                            else if (lease.job.properties.arg === "Woot") {
                                jobReturnedBetweenIterators = longProcessedTime > -1 && shortProcessedTime === -1;
                            }
                            else {
                                shortProcessedTime = lease.job.properties.time;
                            }
                        }));
                        return [4 /*yield*/, Promise.all(promises)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this._remoteJobQueueManager.clearQueue(queue)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, longProcessedTime < shortProcessedTime && jobReturnedBetweenIterators];
                }
            });
        }); };
        _this.addTest(new Test_1.default("Add One and Process One", _this._addOneAndProcessTest, _this, activityManager));
        _this.addTest(new Test_1.default("Add Multiple and Process One", _this._addMultipleAndProcessOneTest, _this, activityManager));
        _this.addTest(new Test_1.default("Expired Lease", _this._expiredLeaseTest, _this, activityManager));
        _this.addTest(new Test_1.default("Renew Lease", _this._renewLeaseTest, _this, activityManager));
        _this.addTest(new Test_1.default("Lease With Delete", _this._leaseDelete, _this, activityManager));
        _this.addTest(new Test_1.default("Update Job", _this._updateJob, _this, activityManager));
        _this.addTest(new Test_1.default("Clear Queue", _this._clearQueue, _this, activityManager));
        _this.addTest(new Test_1.default("Renew Expired Lease", _this._renewExpiredLease, _this, activityManager));
        _this.addTest(new Test_1.default("Simple Iterator", _this._simpleIteratorTest, _this, activityManager));
        _this.addTest(new Test_1.default("Iterator That Gives 10 Things", _this._tenThingsIteratorTest, _this, activityManager));
        _this.addTest(new Test_1.default("Iterator With No Things", _this._iteratorWithNoThings, _this, activityManager));
        _this.addTest(new Test_1.default("Job Ordering", _this._jobOrdering, _this, activityManager));
        return _this;
    }
    JobQueueTests.prototype._createTimerPromise = function (ms) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () { return resolve(); }, ms);
        });
    };
    return JobQueueTests;
}(TestGroup_1.default));
exports.default = JobQueueTests;
