"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SeparateProcessProviderProxy_1 = require("../../Components/Providers/ProcessProvider/SeparateProcessProviderProxy");
var SeparateProcessWorker = (function () {
    function SeparateProcessWorker(host, queue, activityManager) {
        var _this = this;
        this._handlingJob = false;
        this._handleActivityAction = function (activityRef, action) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var handleExecuteAction;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._handlingJob) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._provider.getFunction("ActivityManager.onExecuteActionEvent")];
                    case 1:
                        handleExecuteAction = _a.sent();
                        return [4 /*yield*/, handleExecuteAction({
                                activityRef: activityRef,
                                action: action
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.handleJob = function (lease) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var handleJobFunction, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, , 3, 4]);
                        this._handlingJob = true;
                        return [4 /*yield*/, this._provider.getFunction(SeparateProcessWorker._handleJobNamespace)];
                    case 1:
                        handleJobFunction = _a.sent();
                        return [4 /*yield*/, handleJobFunction(lease)];
                    case 2:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this._handlingJob = false;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/, result];
                }
            });
        }); };
        this._host = host;
        this.queue = queue;
        this._provider = new SeparateProcessProviderProxy_1.default("WorkerProvider", "../providers/WorkerProvider");
        activityManager.onExecuteAction(this._handleActivityAction);
    }
    return SeparateProcessWorker;
}());
SeparateProcessWorker._handleJobNamespace = "Worker.handleJob";
exports.default = SeparateProcessWorker;
