"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SharedDataProcessor_1 = require("../../../Components/SharedData/SharedDataProcessor");
var IConflictConfig_1 = require("./IConflictConfig");
var ExpressionEvaluator_1 = require("../../../Components/Expressions/ExpressionEvaluator");
var Q = require("q");
var GroupConflictHandler = (function () {
    function GroupConflictHandler(sharedDataManager, host, conflictConfigs) {
        this._sharedDataManager = sharedDataManager;
        this._host = host;
        this._groupMap = {};
        this._creationPromiseMap = {};
        this._conflictConfigs = {};
        for (var i = 0; i < conflictConfigs.length; i++) {
            this._conflictConfigs[conflictConfigs[i].policy] = conflictConfigs[i];
        }
    }
    GroupConflictHandler.prototype.getPolicy = function (groupRef, policy) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var sharedDataRef, sharedDataProcessor;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._groupRefToSharedDataRef(groupRef)];
                    case 1:
                        sharedDataRef = _a.sent();
                        sharedDataProcessor = new SharedDataProcessor_1.default(this._sharedDataManager, sharedDataRef, true);
                        return [4 /*yield*/, sharedDataProcessor.isReady()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, sharedDataProcessor.getField(policy)];
                }
            });
        });
    };
    GroupConflictHandler.prototype.handleConflict = function (groupRef, policy, values) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var sharedDataRef, sharedDataProcessor, config, conflictPolicy, policyToReturn, dialogResult;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._groupRefToSharedDataRef(groupRef)];
                    case 1:
                        sharedDataRef = _a.sent();
                        sharedDataProcessor = new SharedDataProcessor_1.default(this._sharedDataManager, sharedDataRef);
                        return [4 /*yield*/, sharedDataProcessor.isReady()];
                    case 2:
                        _a.sent();
                        config = this._conflictConfigs[policy];
                        conflictPolicy = sharedDataProcessor.getField(policy);
                        policyToReturn = null;
                        if (!!conflictPolicy) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._host.executeOperation("Environment.Dialogs.getDialogResult", {
                                id: "options",
                                parameters: this._parseConflictConfig(config, values)
                            })];
                    case 3:
                        dialogResult = _a.sent();
                        if (!!dialogResult) {
                            policyToReturn = dialogResult.option;
                            if (dialogResult.button === IConflictConfig_1.ApplyToAllValue) {
                                sharedDataProcessor.setField(policy, dialogResult.option);
                            }
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        policyToReturn = conflictPolicy;
                        _a.label = 5;
                    case 5: return [4 /*yield*/, sharedDataProcessor.commit()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, policyToReturn];
                }
            });
        });
    };
    GroupConflictHandler.prototype._parseConflictConfig = function (config, values) {
        var dialogParamsConfig = config.dialogParams;
        var params = {
            title: dialogParamsConfig.title,
            defaultOptionValue: dialogParamsConfig.defaultOptionValue,
            buttons: dialogParamsConfig.buttons,
            message: typeof dialogParamsConfig.message === "string" ? dialogParamsConfig.message : ExpressionEvaluator_1.default.evaluate(dialogParamsConfig.message, values),
            options: []
        };
        for (var i = 0; i < dialogParamsConfig.options.length; i++) {
            var optionConfig = dialogParamsConfig.options[i];
            var title = "";
            if (typeof optionConfig.title !== "string") {
                title = ExpressionEvaluator_1.default.evaluate(optionConfig.title, values);
            }
            else {
                title = optionConfig.title;
            }
            params.options.push({ title: title, value: optionConfig.value });
        }
        return params;
    };
    GroupConflictHandler.prototype._createGroup = function (groupRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                if (!this._creationPromiseMap[groupRef.id]) {
                    this._creationPromiseMap[groupRef.id] = Q.Promise(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var data, policy, sharedDataRef;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    data = {};
                                    for (policy in this._conflictConfigs) {
                                        data[policy] = undefined;
                                    }
                                    return [4 /*yield*/, this._sharedDataManager.createSharedData(data)];
                                case 1:
                                    sharedDataRef = _a.sent();
                                    this._groupMap[groupRef.id] = sharedDataRef.id;
                                    resolve(undefined);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }
                return [2 /*return*/, this._creationPromiseMap[groupRef.id]];
            });
        });
    };
    GroupConflictHandler.prototype._groupRefToSharedDataRef = function (groupRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._groupMap[groupRef.id]) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._createGroup(groupRef)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, { id: this._groupMap[groupRef.id] }];
                }
            });
        });
    };
    return GroupConflictHandler;
}());
exports.default = GroupConflictHandler;
