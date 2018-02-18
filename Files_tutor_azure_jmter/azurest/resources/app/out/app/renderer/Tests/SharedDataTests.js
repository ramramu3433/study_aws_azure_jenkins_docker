"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var SharedDataManager_1 = require("../Components/SharedData/SharedDataManager");
var ActivityTests = (function (_super) {
    tslib_1.__extends(ActivityTests, _super);
    function ActivityTests(activityManager) {
        var _this = _super.call(this, "Shared Data Tests", activityManager) || this;
        _this._remoteSharedDataManager = new SharedDataManager_1.Remote(_this._host);
        _this._generalTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var data, ref, firstGetResolveTime, secondGetResolveTime, renewalExtendedLease, firstLease, secondLease, shouldBeNullLease, promises;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        data.properties.data[0].value = "b";
                        promises = [];
                        promises.push(this._remoteSharedDataManager.getSharedDataLease(ref)
                            .then(function (lease) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        firstGetResolveTime = Date.now();
                                        return [4 /*yield*/, this._remoteSharedDataManager.updateSharedData(lease, data)];
                                    case 1:
                                        _a.sent();
                                        firstLease = lease;
                                        return [2 /*return*/];
                                }
                            });
                        }); }));
                        promises.push(this._remoteSharedDataManager.getSharedDataLease(ref)
                            .then(function (lease) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var initalExpiration;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        secondGetResolveTime = Date.now();
                                        initalExpiration = lease.expiration;
                                        return [4 /*yield*/, this._remoteSharedDataManager.renewSharedDataLease(lease)];
                                    case 1:
                                        lease = _a.sent();
                                        renewalExtendedLease = initalExpiration < lease.expiration;
                                        return [4 /*yield*/, this._remoteSharedDataManager.deleteSharedData(lease)];
                                    case 2:
                                        _a.sent();
                                        secondLease = lease;
                                        return [2 /*return*/];
                                }
                            });
                        }); }));
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 3:
                        shouldBeNullLease = _a.sent();
                        return [2 /*return*/, firstGetResolveTime < secondGetResolveTime && renewalExtendedLease && JSON.stringify(secondLease.data) === JSON.stringify(data) && !shouldBeNullLease];
                }
            });
        }); };
        _this._create = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, ref;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        return [2 /*return*/, !!ref];
                }
            });
        }); };
        _this._createAndGet = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, ref, lease;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        lease = _a.sent();
                        return [2 /*return*/, !!lease && JSON.stringify(lease.data) === JSON.stringify(data)];
                }
            });
        }); };
        _this._createGetAndUpdate = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, ref, lease;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        lease = _a.sent();
                        data.properties.data[0].value = "b";
                        return [4 /*yield*/, this._remoteSharedDataManager.updateSharedData(lease, data)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 4:
                        lease = _a.sent();
                        return [2 /*return*/, !!lease && JSON.stringify(lease.data) === JSON.stringify(data)];
                }
            });
        }); };
        _this._createGetAndDelete = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, ref, lease, postDeleteLease;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        lease = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.deleteSharedData(lease)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 4:
                        postDeleteLease = _a.sent();
                        return [2 /*return*/, !!lease && !postDeleteLease];
                }
            });
        }); };
        _this._createGetAndRenew = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, ref, leaseOne, leaseTwo;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        leaseOne = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.renewSharedDataLease(leaseOne)];
                    case 3:
                        leaseTwo = _a.sent();
                        return [2 /*return*/, !!leaseOne && !!leaseTwo && JSON.stringify(leaseOne.data) === JSON.stringify(leaseTwo.data) && leaseOne.id === leaseTwo.id];
                }
            });
        }); };
        _this._createGetRenewAndUpdate = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, ref, leaseOne, leaseTwo, postUpdateLease;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        leaseOne = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.renewSharedDataLease(leaseOne)];
                    case 3:
                        leaseTwo = _a.sent();
                        data.properties.data[0].value = "b";
                        return [4 /*yield*/, this._remoteSharedDataManager.updateSharedData(leaseTwo, data)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 5:
                        postUpdateLease = _a.sent();
                        return [2 /*return*/, !!postUpdateLease && JSON.stringify(postUpdateLease.data) === JSON.stringify(data)];
                }
            });
        }); };
        _this._createGetRenewAndDelete = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, ref, leaseOne, leaseTwo, postDeleteLease;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        leaseOne = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.renewSharedDataLease(leaseOne)];
                    case 3:
                        leaseTwo = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.deleteSharedData(leaseTwo)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 5:
                        postDeleteLease = _a.sent();
                        return [2 /*return*/, !postDeleteLease];
                }
            });
        }); };
        _this._updateTwiceSameLease = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, errorThrownAndCaught, ref, lease, e_1, postUpdateLease;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        errorThrownAndCaught = false;
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        lease = _a.sent();
                        data.properties.data[0].value = "b";
                        return [4 /*yield*/, this._remoteSharedDataManager.updateSharedData(lease, data)];
                    case 3:
                        _a.sent();
                        data.properties.data[0].value = "c";
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this._remoteSharedDataManager.updateSharedData(lease, data)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        errorThrownAndCaught = true;
                        return [3 /*break*/, 7];
                    case 7: return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 8:
                        postUpdateLease = _a.sent();
                        return [2 /*return*/, !!postUpdateLease && postUpdateLease.data.properties.data[0].value === "b" && errorThrownAndCaught];
                }
            });
        }); };
        _this._updateAndDeleteSameLease = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, errorThrownAndCaught, ref, lease, e_2, postUpdateLease;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        errorThrownAndCaught = false;
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        lease = _a.sent();
                        data.properties.data[0].value = "b";
                        return [4 /*yield*/, this._remoteSharedDataManager.updateSharedData(lease, data)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this._remoteSharedDataManager.deleteSharedData(lease)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _a.sent();
                        errorThrownAndCaught = true;
                        return [3 /*break*/, 7];
                    case 7: return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 8:
                        postUpdateLease = _a.sent();
                        return [2 /*return*/, !!postUpdateLease && postUpdateLease.data.properties.data[0].value === "b" && errorThrownAndCaught];
                }
            });
        }); };
        _this._updateAndRenewSameLease = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, errorThrownAndCaught, ref, lease, e_3, postUpdateLease;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        errorThrownAndCaught = false;
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        lease = _a.sent();
                        data.properties.data[0].value = "b";
                        return [4 /*yield*/, this._remoteSharedDataManager.updateSharedData(lease, data)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this._remoteSharedDataManager.renewSharedDataLease(lease)];
                    case 5:
                        lease = _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_3 = _a.sent();
                        errorThrownAndCaught = true;
                        return [3 /*break*/, 7];
                    case 7: return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 8:
                        postUpdateLease = _a.sent();
                        return [2 /*return*/, !!postUpdateLease && postUpdateLease.data.properties.data[0].value === "b" && errorThrownAndCaught];
                }
            });
        }); };
        _this._updateTwiceDifferentLeases = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, ref, leaseOne, leaseTwo, postUpdateLease;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        data.properties.data[0].value = "b";
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        leaseOne = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.updateSharedData(leaseOne, data)];
                    case 3:
                        _a.sent();
                        data.properties.data[0].value = "c";
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 4:
                        leaseTwo = _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.updateSharedData(leaseTwo, data)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 6:
                        postUpdateLease = _a.sent();
                        return [2 /*return*/, !!postUpdateLease && JSON.stringify(postUpdateLease.data) === JSON.stringify(data)];
                }
            });
        }); };
        _this._renewTenTimes = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, ref, lease, i;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        data.properties.data[0].value = "b";
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        lease = _a.sent();
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < 10)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._remoteSharedDataManager.renewSharedDataLease(lease)];
                    case 4:
                        lease = _a.sent();
                        if (!lease) {
                            return [3 /*break*/, 6];
                        }
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, i === 10];
                }
            });
        }); };
        _this._getAndUpdateTenTimes = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data, ref, lease, i;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            properties: {
                                data: [
                                    {
                                        name: "one",
                                        value: "a"
                                    },
                                    {
                                        name: "two",
                                        value: "b"
                                    }
                                ]
                            }
                        };
                        return [4 /*yield*/, this._remoteSharedDataManager.createSharedData(data)];
                    case 1:
                        ref = _a.sent();
                        data.properties.data[0].value = "b";
                        return [4 /*yield*/, this._remoteSharedDataManager.getSharedDataLease(ref)];
                    case 2:
                        lease = _a.sent();
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < 10)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._remoteSharedDataManager.renewSharedDataLease(lease)];
                    case 4:
                        lease = _a.sent();
                        if (!lease) {
                            return [3 /*break*/, 6];
                        }
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, i === 10];
                }
            });
        }); };
        _this.addTest(new Test_1.default("General Test", _this._generalTest, _this, activityManager));
        _this.addTest(new Test_1.default("Create", _this._create, _this, activityManager));
        _this.addTest(new Test_1.default("Create and Get", _this._createAndGet, _this, activityManager));
        _this.addTest(new Test_1.default("Create, Get, and Update", _this._createGetAndUpdate, _this, activityManager));
        _this.addTest(new Test_1.default("Create, Get, and Delete", _this._createGetAndDelete, _this, activityManager));
        _this.addTest(new Test_1.default("Create, Get, and Renew Lease", _this._createGetAndRenew, _this, activityManager));
        _this.addTest(new Test_1.default("Create, Get, Renew Lease, and Update", _this._createGetRenewAndUpdate, _this, activityManager));
        _this.addTest(new Test_1.default("Create, Get, Renew Lease, and Delete", _this._createGetRenewAndDelete, _this, activityManager));
        _this.addTest(new Test_1.default("Update Twice With Same Lease", _this._updateTwiceSameLease, _this, activityManager));
        _this.addTest(new Test_1.default("Update then Delete With Same Lease", _this._updateAndDeleteSameLease, _this, activityManager));
        _this.addTest(new Test_1.default("Update then Renew With Same Lease", _this._updateAndRenewSameLease, _this, activityManager));
        _this.addTest(new Test_1.default("Update Twice With Different Leases", _this._updateTwiceDifferentLeases, _this, activityManager));
        _this.addTest(new Test_1.default("Renew 10 times", _this._renewTenTimes, _this, activityManager));
        _this.addTest(new Test_1.default("Create, then Get and Update 10 times", _this._getAndUpdateTenTimes, _this, activityManager));
        return _this;
    }
    return ActivityTests;
}(TestGroup_1.default));
exports.default = ActivityTests;
