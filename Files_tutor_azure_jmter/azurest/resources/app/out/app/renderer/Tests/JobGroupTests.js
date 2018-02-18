"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var JobGroupManager_1 = require("../JobHandlers/Groups/JobGroupManager");
var SharedDataManager_1 = require("../Components/SharedData/SharedDataManager");
var JobGroupDataProcessor_1 = require("../JobHandlers/Groups/JobGroupDataProcessor");
var IteratorStatus_1 = require("../JobHandlers/Groups/IteratorStatus");
var Assert_1 = require("../Components/TestManager/Assert");
var ActivityStatus_1 = require("../Components/Activities/ActivityStatus");
var IConflictConfig_1 = require("../JobHandlers/Groups/Conflicts/IConflictConfig");
var IConflictConfig_2 = require("../JobHandlers/Groups/Conflicts/IConflictConfig");
var GroupConflictHandler_1 = require("../JobHandlers/Groups/Conflicts/GroupConflictHandler");
var uuid = require("uuid/v1");
var JobGroupTests = (function (_super) {
    tslib_1.__extends(JobGroupTests, _super);
    function JobGroupTests(activityManager) {
        var _this = _super.call(this, "Job Group Tests", activityManager) || this;
        _this._initGroup = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var jobGroup, groupActivityRef, groupRef;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jobGroup = new MockJobGroupManager(this._sharedDataManager, this._activityManager, this._host);
                        return [4 /*yield*/, this._createActivityForTest()];
                    case 1:
                        groupActivityRef = _a.sent();
                        return [4 /*yield*/, jobGroup.initGroup(groupActivityRef)];
                    case 2:
                        groupRef = _a.sent();
                        Assert_1.default(!!groupRef, "Init group returned nothing.");
                        Assert_1.default(!!groupRef.id, "Group ref did not contain an id.");
                        this._deleteActivityForTest(groupActivityRef);
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._addJob = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var jobGroup, groupActivityRef, groupRef, statsRef;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jobGroup = new MockJobGroupManager(this._sharedDataManager, this._activityManager, this._host);
                        return [4 /*yield*/, this._createActivityForTest()];
                    case 1:
                        groupActivityRef = _a.sent();
                        return [4 /*yield*/, jobGroup.initGroup(groupActivityRef)];
                    case 2:
                        groupRef = _a.sent();
                        return [4 /*yield*/, jobGroup.addJob(groupRef, MockJobState.Queued)];
                    case 3:
                        statsRef = _a.sent();
                        Assert_1.default(!!statsRef, "Add job did not return a stats ref.");
                        Assert_1.default(!!statsRef.id, "The stats ref does not have an id.");
                        Assert_1.default(jobGroup.numJobsWithState(groupRef, MockJobState.Queued) === 1, "Number of queued jobs is not 1. Actual value: " + jobGroup.numJobsWithState(groupRef, MockJobState.Queued));
                        return [4 /*yield*/, this._deleteActivityForTest(groupActivityRef)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._bulkAdd = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var jobGroup, groupActivityRef, groupRef, statsRefs, numJobs;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jobGroup = new MockJobGroupManager(this._sharedDataManager, this._activityManager, this._host);
                        return [4 /*yield*/, this._createActivityForTest()];
                    case 1:
                        groupActivityRef = _a.sent();
                        return [4 /*yield*/, jobGroup.initGroup(groupActivityRef)];
                    case 2:
                        groupRef = _a.sent();
                        return [4 /*yield*/, jobGroup.addJobs(groupRef, MockJobState.Queued, 10)];
                    case 3:
                        statsRefs = _a.sent();
                        Assert_1.default(!!statsRefs, "Add job did not return an array of stats refs.");
                        Assert_1.default(statsRefs.length === 10, "The stats ref does not have an id.");
                        statsRefs.forEach(function (ref) {
                            Assert_1.default(!!ref.id, "One of the returned refs did not have an id.");
                        });
                        numJobs = jobGroup.numJobsWithState(groupRef, MockJobState.Queued);
                        Assert_1.default(numJobs === 10, "Number of queued jobs is not 10. Actual value: " + numJobs);
                        return [4 /*yield*/, this._deleteActivityForTest(groupActivityRef)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._updateState = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var jobGroup, groupActivityRef, groupRef, statsRef, numJobs;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jobGroup = new MockJobGroupManager(this._sharedDataManager, this._activityManager, this._host);
                        return [4 /*yield*/, this._createActivityForTest()];
                    case 1:
                        groupActivityRef = _a.sent();
                        return [4 /*yield*/, jobGroup.initGroup(groupActivityRef)];
                    case 2:
                        groupRef = _a.sent();
                        return [4 /*yield*/, jobGroup.addJob(groupRef, MockJobState.Queued)];
                    case 3:
                        statsRef = _a.sent();
                        return [4 /*yield*/, jobGroup.updateState(groupRef, statsRef, MockJobState.Active)];
                    case 4:
                        _a.sent();
                        numJobs = jobGroup.numJobsWithState(groupRef, MockJobState.Active);
                        Assert_1.default(numJobs === 1, "Number of active jobs is not 1. Actual value: " + numJobs);
                        return [4 /*yield*/, this._deleteActivityForTest(groupActivityRef)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._cancelGroup = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var jobGroup, groupActivityRef, groupRef, groupIsCanceld;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jobGroup = new MockJobGroupManager(this._sharedDataManager, this._activityManager, this._host);
                        return [4 /*yield*/, this._createActivityForTest()];
                    case 1:
                        groupActivityRef = _a.sent();
                        return [4 /*yield*/, jobGroup.initGroup(groupActivityRef)];
                    case 2:
                        groupRef = _a.sent();
                        return [4 /*yield*/, jobGroup.cancelGroup(groupRef)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, jobGroup.isCanceled(groupRef)];
                    case 4:
                        groupIsCanceld = _a.sent();
                        Assert_1.default(groupIsCanceld, "Group not showing as canceled");
                        return [4 /*yield*/, this._deleteActivityForTest(groupActivityRef)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._markIteratorComplete = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var jobGroup, groupActivityRef, groupRef, status;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jobGroup = new MockJobGroupManager(this._sharedDataManager, this._activityManager, this._host);
                        return [4 /*yield*/, this._createActivityForTest()];
                    case 1:
                        groupActivityRef = _a.sent();
                        return [4 /*yield*/, jobGroup.initGroup(groupActivityRef)];
                    case 2:
                        groupRef = _a.sent();
                        return [4 /*yield*/, jobGroup.markIteratorComplete(groupRef)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, jobGroup.iteratorStatus(groupRef)];
                    case 4:
                        status = _a.sent();
                        Assert_1.default(status === IteratorStatus_1.default.Complete, "Iterator not marked as complete.");
                        return [4 /*yield*/, this._deleteActivityForTest(groupActivityRef)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._reportAnIssue = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var jobGroup, groupActivityRef, groupRef, numIssues;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jobGroup = new MockJobGroupManager(this._sharedDataManager, this._activityManager, this._host);
                        return [4 /*yield*/, this._createActivityForTest()];
                    case 1:
                        groupActivityRef = _a.sent();
                        return [4 /*yield*/, jobGroup.initGroup(groupActivityRef)];
                    case 2:
                        groupRef = _a.sent();
                        return [4 /*yield*/, jobGroup.reportIssue(groupRef, "", {})];
                    case 3:
                        _a.sent();
                        numIssues = jobGroup.numIssues(groupRef);
                        Assert_1.default(numIssues === 1, "Number of issues is not 1. Actual value: " + numIssues);
                        return [4 /*yield*/, this._deleteActivityForTest(groupActivityRef)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._simpleConflict = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var testUid, jobGroup, groupActivityRef, groupRef, policy, numTimes;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testUid = uuid();
                        jobGroup = new MockJobGroupManager(this._sharedDataManager, this._activityManager, this._host);
                        return [4 /*yield*/, this._createActivityForTest()];
                    case 1:
                        groupActivityRef = _a.sent();
                        return [4 /*yield*/, jobGroup.initGroup(groupActivityRef)];
                    case 2:
                        groupRef = _a.sent();
                        return [4 /*yield*/, jobGroup.handleConflict(groupRef, "MockConflicts", { uuid: testUid })];
                    case 3:
                        policy = _a.sent();
                        Assert_1.default(!!policy, "No policy returned by handle local conflict.");
                        numTimes = this._host.countMap[testUid];
                        Assert_1.default(numTimes === 1, "Conflict dialog parameters called more than 1 time. Actual value: " + numTimes);
                        return [4 /*yield*/, this._deleteActivityForTest(groupActivityRef)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._multiConflictApplyAll = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var testUid, jobGroup, groupActivityRef, groupRef, numConflicts, policies, promises, i, i, numTimes;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testUid = uuid();
                        jobGroup = new MockJobGroupManager(this._sharedDataManager, this._activityManager, this._host);
                        return [4 /*yield*/, this._createActivityForTest()];
                    case 1:
                        groupActivityRef = _a.sent();
                        return [4 /*yield*/, jobGroup.initGroup(groupActivityRef)];
                    case 2:
                        groupRef = _a.sent();
                        numConflicts = 100;
                        policies = [];
                        promises = [];
                        for (i = 0; i < numConflicts; i++) {
                            promises.push(jobGroup.handleConflict(groupRef, "MockConflicts", { uuid: testUid })
                                .then(function (policy) {
                                policies.push(policy);
                            }));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 3:
                        _a.sent();
                        for (i = 1; i < numConflicts; i++) {
                            Assert_1.default(policies[i - 1] === policies[i], "Not all returned policies match.");
                        }
                        numTimes = this._host.countMap[testUid];
                        Assert_1.default(numTimes === 1, "Conflict dialog parameters called more than 1 time. Actual value: " + numTimes);
                        return [4 /*yield*/, this._deleteActivityForTest(groupActivityRef)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._host = new JobGroupTestsHost(_this._host);
        _this._sharedDataManager = new SharedDataManager_1.default();
        _this.addTest(new Test_1.default("Init Group", _this._initGroup, _this, activityManager));
        _this.addTest(new Test_1.default("Add a Job", _this._addJob, _this, activityManager));
        _this.addTest(new Test_1.default("Bulk Add 10 Jobs", _this._bulkAdd, _this, activityManager));
        _this.addTest(new Test_1.default("Update a Job's State", _this._updateState, _this, activityManager));
        _this.addTest(new Test_1.default("Canceling a Group", _this._cancelGroup, _this, activityManager));
        _this.addTest(new Test_1.default("Marking an Iterator Complete", _this._markIteratorComplete, _this, activityManager));
        _this.addTest(new Test_1.default("Report An Issue", _this._reportAnIssue, _this, activityManager));
        _this.addTest(new Test_1.default("Simple Conflict", _this._simpleConflict, _this, activityManager));
        _this.addTest(new Test_1.default("Multi Conflict", _this._multiConflictApplyAll, _this, activityManager));
        return _this;
    }
    JobGroupTests.prototype._createActivityForTest = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var groupActivity;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        groupActivity = {
                            parent: null,
                            title: "Job Group Tests Activity",
                            message: "",
                            sortOrder: 1,
                            status: ActivityStatus_1.default.InProgress,
                            progress: 0,
                            actions: []
                        };
                        return [4 /*yield*/, this._activityManager.add(groupActivity)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    JobGroupTests.prototype._deleteActivityForTest = function (activityRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._activityManager.delete(activityRef)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return JobGroupTests;
}(TestGroup_1.default));
exports.default = JobGroupTests;
var JobGroupTestsHost = (function () {
    function JobGroupTestsHost(host) {
        this.countMap = {};
        this._host = host;
    }
    JobGroupTestsHost.prototype.executeOperation = function (functionNamespace, args) {
        if (functionNamespace === "Environment.Dialogs.getDialogResult" && args.id === "options") {
            this._incrementCountMap(args.parameters.message);
            return Promise.resolve({ option: MockOverwriteOptions.Replace, button: IConflictConfig_1.ApplyToAllValue });
        }
        else {
            return this._host.executeOperation(functionNamespace, args);
        }
    };
    JobGroupTestsHost.prototype._incrementCountMap = function (key) {
        !!this.countMap[key] ? this.countMap[key]++ : this.countMap[key] = 1;
    };
    JobGroupTestsHost.prototype.raiseEvent = function (eventNamspace, args) {
        return this._host.raiseEvent(eventNamspace, args);
    };
    return JobGroupTestsHost;
}());
var MockJobState;
(function (MockJobState) {
    MockJobState[MockJobState["Failed"] = 0] = "Failed";
    MockJobState[MockJobState["Complete"] = 1] = "Complete";
    MockJobState[MockJobState["Active"] = 2] = "Active";
    MockJobState[MockJobState["Queued"] = 3] = "Queued";
    MockJobState[MockJobState["Canceled"] = 4] = "Canceled";
})(MockJobState || (MockJobState = {}));
;
var MockOverwriteOptions;
(function (MockOverwriteOptions) {
    MockOverwriteOptions[MockOverwriteOptions["Keep"] = 0] = "Keep";
    MockOverwriteOptions[MockOverwriteOptions["Replace"] = 1] = "Replace";
    MockOverwriteOptions[MockOverwriteOptions["Skip"] = 2] = "Skip";
})(MockOverwriteOptions || (MockOverwriteOptions = {}));
;
var MockJobGroupManager = (function (_super) {
    tslib_1.__extends(MockJobGroupManager, _super);
    function MockJobGroupManager(sharedDataManager, activityManager, host) {
        var _this = _super.call(this, activityManager, host) || this;
        _this._mockConflictConfig = {
            policy: "MockConflicts",
            dialogParams: {
                title: "MockConflicts",
                message: {
                    args: ["uuid"],
                    expression: "`${uuid}`"
                },
                options: [
                    {
                        title: "Keep",
                        value: MockOverwriteOptions.Keep
                    },
                    {
                        title: "Replace",
                        value: MockOverwriteOptions.Replace
                    },
                    {
                        title: "Skip",
                        value: MockOverwriteOptions.Skip
                    }
                ],
                defaultOptionValue: MockOverwriteOptions.Skip,
                buttons: [
                    {
                        title: "Apply to All",
                        value: IConflictConfig_1.ApplyToAllValue
                    },
                    {
                        title: "Apply",
                        value: IConflictConfig_2.ApplyValue
                    }
                ]
            }
        };
        _this._groupConflictHandler = new GroupConflictHandler_1.default(sharedDataManager, host, [_this._mockConflictConfig]);
        return _this;
    }
    MockJobGroupManager.prototype.initGroup = function (groupActivityRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var groupRef;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.initGroup.call(this, groupActivityRef)];
                    case 1:
                        groupRef = _a.sent();
                        return [2 /*return*/, groupRef];
                }
            });
        });
    };
    MockJobGroupManager.prototype.numJobsWithState = function (groupActivityRef, state) {
        return new JobGroupDataProcessor_1.default(this._groups[groupActivityRef.id].data).numJobsWithState(state);
    };
    MockJobGroupManager.prototype.numIssues = function (groupActivityRef) {
        return new JobGroupDataProcessor_1.default(this._groups[groupActivityRef.id].data).numIssues();
    };
    /**
     * @override from JobGroup.ts
     */
    MockJobGroupManager.prototype.handleConflict = function (groupRef, policy, values) {
        return this._groupConflictHandler.handleConflict(groupRef, policy, values);
    };
    /**
     * @override from JobGroup.ts
     */
    MockJobGroupManager.prototype.getPolicy = function (groupRef, policy) {
        return this._groupConflictHandler.getPolicy(groupRef, policy);
    };
    /**
     * @override from JobGroup.ts
     */
    MockJobGroupManager.prototype._updateActivity = function (groupRef, groupActivity, dataProcessor) {
        // noop
    };
    /**
     * @override from JobGroup.ts
     */
    MockJobGroupManager.prototype._jobIsComplete = function (state) {
        return state === MockJobState.Complete || state === MockJobState.Canceled;
    };
    /**
     * @override from JobGroup.ts
     */
    MockJobGroupManager.prototype._createIssueActivity = function (issueMessage, details) {
        return null;
    };
    /**
     * @override from JobGroup.ts
     */
    MockJobGroupManager.prototype._retryAll = function (dataProcessor) {
        return Promise.resolve(undefined);
    };
    return MockJobGroupManager;
}(JobGroupManager_1.default));
