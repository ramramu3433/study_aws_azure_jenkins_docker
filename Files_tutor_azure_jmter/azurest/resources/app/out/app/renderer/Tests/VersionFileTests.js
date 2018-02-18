"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var VersionFile_1 = require("../Updates/VersionFile");
var VersionFileTests = (function (_super) {
    tslib_1.__extends(VersionFileTests, _super);
    function VersionFileTests(activityManager) {
        var _this = _super.call(this, "Version File Tests", activityManager) || this;
        _this._acceptAnyUpdate = function () {
            var file = new VersionFile_1.default([
                {
                    "version": -1,
                    "displayName": "0.0.0",
                    "updateGroups": [
                        {
                            "name": "insiders",
                            "percentage": 100
                        }
                    ]
                }
            ], {}, 1, true);
            return file.getLatestVersion().then(function (update) {
                return !!update && update.version === -1;
            });
        };
        _this._getLatestVersionWhenPastLatest = function () {
            var file = new VersionFile_1.default([
                {
                    "version": 2,
                    "displayName": "0.8.15"
                }
            ], {}, 3);
            return file.getLatestVersion().then(function (update) {
                return !update;
            });
        };
        _this._getLatestVersionWhenAtLatest = function () {
            var file = new VersionFile_1.default([
                {
                    "version": 2,
                    "displayName": "0.8.15"
                }
            ], {}, 2);
            return file.getLatestVersion().then(function (update) {
                return !update;
            });
        };
        _this._getLatestVersionSingleTest = function () {
            var file = new VersionFile_1.default([
                {
                    "version": 2,
                    "displayName": "0.8.15"
                }
            ], {}, 1);
            return file.getLatestVersion().then(function (update) {
                return !!update && update.version === 2 && update.displayName === "0.8.15";
            });
        };
        _this._getLatestVersionMultipleTest = function () {
            var file = new VersionFile_1.default([
                {
                    "version": 3,
                    "displayName": "0.8.15"
                },
                {
                    "version": 4,
                    "displayName": "0.8.20"
                },
                {
                    "version": 2,
                    "displayName": "0.8.10"
                }
            ], {}, 1);
            return file.getLatestVersion().then(function (update) {
                return !!update && update.version === 4 && update.displayName === "0.8.20";
            });
        };
        _this._getLatestVersionSingleWithValidUpdateGroup = function () {
            var file = new VersionFile_1.default([
                {
                    "version": 2,
                    "displayName": "0.8.15",
                    "updateGroups": [
                        {
                            "name": "insiders",
                            "percentage": 100
                        }
                    ]
                }
            ], {
                "insiders": {
                    "name": "insiders",
                    "percentage": 100
                }
            }, 1);
            return file.getLatestVersion().then(function (update) {
                return !!update && update.version === 2 && update.displayName === "0.8.15";
            });
        };
        _this._getLatestVersionSingleWithoutValidUpdateGroup = function () {
            var file = new VersionFile_1.default([
                {
                    "version": 2,
                    "displayName": "0.8.15",
                    "updateGroups": [
                        {
                            "name": "insiders",
                            "percentage": 50
                        }
                    ]
                }
            ], {
                "insiders": {
                    "name": "insiders",
                    "percentage": 100
                }
            }, 1);
            return file.getLatestVersion().then(function (update) {
                return !update;
            });
        };
        _this._getLatestVersionMultipleWithValidUpdateGroup = function () {
            var file = new VersionFile_1.default([
                {
                    "version": 4,
                    "displayName": "0.8.20",
                    "updateGroups": [
                        {
                            "name": "insiders",
                            "percentage": 25
                        }
                    ]
                },
                {
                    "version": 3,
                    "displayName": "0.8.15",
                    "updateGroups": [
                        {
                            "name": "insiders",
                            "percentage": 50
                        }
                    ]
                },
                {
                    "version": 2,
                    "displayName": "0.8.10",
                    "updateGroups": [
                        {
                            "name": "insiders",
                            "percentage": 100
                        }
                    ]
                }
            ], {
                "insiders": {
                    "name": "insiders",
                    "percentage": 100
                }
            }, 1);
            return file.getLatestVersion().then(function (update) {
                return !!update && update.version === 2 && update.displayName === "0.8.10";
            });
        };
        _this._getLatestVersionMultipleWithoutValidUpdateGroup = function () {
            var file = new VersionFile_1.default([
                {
                    "version": 4,
                    "displayName": "0.8.20",
                    "updateGroups": [
                        {
                            "name": "insiders",
                            "percentage": 0
                        }
                    ]
                },
                {
                    "version": 3,
                    "displayName": "0.8.15",
                    "updateGroups": [
                        {
                            "name": "insiders",
                            "percentage": 0
                        }
                    ]
                },
                {
                    "version": 2,
                    "displayName": "0.8.10",
                    "updateGroups": [
                        {
                            "name": "insiders",
                            "percentage": 0
                        }
                    ]
                }
            ], {
                "insiders": {
                    "name": "insiders",
                    "percentage": 100
                }
            }, 1);
            return file.getLatestVersion().then(function (update) {
                return !update;
            });
        };
        _this._getAvailablePreviousVersion = function () {
            var file = new VersionFile_1.default([
                {
                    "version": 3,
                    "displayName": "0.8.15",
                    "previousVersion": 2
                },
                {
                    "version": 2,
                    "displayName": "0.8.14"
                }
            ], {}, 1);
            return file.getVersionPreviousTo(3).then(function (update) {
                return !!update && update.version === 2 && update.displayName === "0.8.14";
            });
        };
        _this._getUnavailablePreviousVersion = function () {
            var file = new VersionFile_1.default([
                {
                    "version": 3,
                    "displayName": "0.8.15"
                },
                {
                    "version": 2,
                    "displayName": "0.8.14"
                }
            ], {}, 1);
            return file.getVersionPreviousTo(3).then(function (update) {
                return !update;
            });
        };
        _this.addTest(new Test_1.default("Accept Any Update", _this._acceptAnyUpdate, _this, activityManager));
        _this.addTest(new Test_1.default("Get Latest When Past Latest", _this._getLatestVersionWhenPastLatest, _this, activityManager));
        _this.addTest(new Test_1.default("Get Latest When At Latest", _this._getLatestVersionWhenAtLatest, _this, activityManager));
        _this.addTest(new Test_1.default("Get Latest Version Single", _this._getLatestVersionSingleTest, _this, activityManager));
        _this.addTest(new Test_1.default("Get Latest Version Single With Valid Update Group", _this._getLatestVersionSingleWithValidUpdateGroup, _this, activityManager));
        _this.addTest(new Test_1.default("Get Latest Version Single Without Valid Update Group", _this._getLatestVersionSingleWithoutValidUpdateGroup, _this, activityManager));
        _this.addTest(new Test_1.default("Get Latest Version Multiple", _this._getLatestVersionMultipleTest, _this, activityManager));
        _this.addTest(new Test_1.default("Get Latest Version Multiple With Valid Update Group", _this._getLatestVersionMultipleWithValidUpdateGroup, _this, activityManager));
        _this.addTest(new Test_1.default("Get Latest Version Multiple Without Valid Update Group", _this._getLatestVersionMultipleWithoutValidUpdateGroup, _this, activityManager));
        _this.addTest(new Test_1.default("Get Available Previous Version", _this._getAvailablePreviousVersion, _this, activityManager));
        _this.addTest(new Test_1.default("Get Unavailable Previous Version", _this._getUnavailablePreviousVersion, _this, activityManager));
        return _this;
    }
    return VersionFileTests;
}(TestGroup_1.default));
exports.default = VersionFileTests;
