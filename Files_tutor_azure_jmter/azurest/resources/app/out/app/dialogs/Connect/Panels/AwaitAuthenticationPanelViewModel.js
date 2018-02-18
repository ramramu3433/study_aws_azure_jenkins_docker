"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ConnectDialogPanelViewModel_1 = require("./ConnectDialogPanelViewModel");
var ConnectSteps_1 = require("./../ConnectSteps");
var AwaitAuthenticationPanelViewModel = (function (_super) {
    tslib_1.__extends(AwaitAuthenticationPanelViewModel, _super);
    function AwaitAuthenticationPanelViewModel(parentDialog) {
        var _this = _super.call(this, parentDialog, "Waiting for authentication...") || this;
        _this.isLastStep(true);
        _this.canContinue(true);
        _this.hideAllButtons();
        return _this;
    }
    AwaitAuthenticationPanelViewModel.prototype.show = function (args) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var dismissAfterTimeout, timeoutId, result, error;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.dialogViewModel.currentPanel(ConnectSteps_1.default.signInSpinner);
                        dismissAfterTimeout = true;
                        timeoutId = window.setTimeout(function () {
                            dismissAfterTimeout = false;
                            _this.dialogViewModel.dialogResult({ accountAdded: false });
                        }, (1000 * 60) * 2);
                        if (!!!args.accountId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._promptForReAuth(args.accountId)];
                    case 1:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this._promptForAuth(args.environment, args.newEnvironment)];
                    case 3:
                        result = _a.sent();
                        _a.label = 4;
                    case 4:
                        error = result.error !== "Operation was canceled." ? result.error : null;
                        window.clearTimeout(timeoutId);
                        if (dismissAfterTimeout) {
                            this.dialogViewModel.dialogResult({ accountAdded: !!result.account, account: result.account, error: error });
                        }
                        return [2 /*return*/, Promise.resolve(undefined)];
                }
            });
        });
    };
    ;
    AwaitAuthenticationPanelViewModel.prototype._promptForAuth = function (environment, newEnvironment) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!!newEnvironment) return [3 /*break*/, 2];
                        environment = newEnvironment.environmentName;
                        return [4 /*yield*/, this.dialogViewModel.host.executeOperation("Azure.UserAccounts.addCustomAadProvider", { environment: newEnvironment.environmentName, provider: newEnvironment.getConfiguration() })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.dialogViewModel.host.executeOperation("Azure.UserAccounts.addAccount", { environment: environment })];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AwaitAuthenticationPanelViewModel.prototype._promptForReAuth = function (accountId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dialogViewModel.host.executeOperation("Azure.UserAccounts.promptUserAuthentication", { accountId: accountId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return AwaitAuthenticationPanelViewModel;
}(ConnectDialogPanelViewModel_1.default));
exports.default = AwaitAuthenticationPanelViewModel;
