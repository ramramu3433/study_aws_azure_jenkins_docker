"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ko = require("knockout");
var _ = require("underscore");
var ConnectSteps_1 = require("./../ConnectSteps");
var ConnectDialogPanelViewModel_1 = require("./ConnectDialogPanelViewModel");
var ConnectDialogConstants = require("./../ConnectDialogConstants");
function isPublicAzureEnvironment(value) {
    return value !== ConnectDialogConstants.azureEnvironmentValue.azureStack;
}
;
var ConnectOptionsViewModel = (function (_super) {
    tslib_1.__extends(ConnectOptionsViewModel, _super);
    function ConnectOptionsViewModel(dialogViewModel, input) {
        if (input === void 0) { input = ""; }
        var _this = _super.call(this, dialogViewModel, "Connect to Azure Storage") || this;
        _this.connectOptionsLabel = "How do you want to connect to your Storage Account or service?"; // Localize
        _this.selectedConnectOption = ko.observable("");
        _this.availableEnvironments = ko.observableArray(ConnectDialogConstants.azureEnvironments);
        _this._refreshAvailableEnvironments();
        _this.selectedEnvironment = ko.observable();
        _this.selectedEnvironment.subscribe(function (selectOptionsViewModel) {
            if (!!selectOptionsViewModel) {
                _this.isLastStep(isPublicAzureEnvironment(selectOptionsViewModel.value));
            }
        });
        _this.finishText("Sign in...");
        _this.isFirstStep(true);
        _this.isLastStep(true);
        _this.canContinue(true);
        _this.connectOptions = ko.observableArray([
            {
                label: "Add an Azure Account",
                name: "signInToAzure",
                action: function () {
                    if (_this.selectedConnectOption() === "signInToAzure") {
                        if (_this.selectedEnvironment().value !== "azurestack") {
                            _this.dialogViewModel.openAwaitAuth({ environment: _this.selectedEnvironment().value });
                        }
                        else {
                            _this.dialogViewModel.openAzureStackEnvironment({ existingCustomProviders: _this._currentCustomProviders });
                        }
                    }
                },
                dropdown: ko.observable({
                    options: _this.availableEnvironments,
                    label: "Azure environment:",
                    selectedOption: _this.selectedEnvironment
                }),
                hasDropdown: true
            },
            {
                label: "Use a connection string or a shared access signature URI",
                name: "addWithSas",
                action: function () {
                    _this.dialogViewModel.openAddWithSas();
                },
                hasDropdown: false
            },
            {
                label: "Use a storage account name and key",
                name: "addStorageAccountKey",
                action: function () {
                    _this.dialogViewModel.openAddWithKey();
                },
                hasDropdown: false
            }
        ]);
        _this.selectedConnectOption.subscribe(function (newValue) {
            if (newValue === "signInToAzure") {
                var selectedOptionViewModel = _this.connectOptions().filter(function (o) { return o.name === _this.selectedConnectOption(); })[0];
                if (!!selectedOptionViewModel.dropdown().selectedOption()) {
                    _this.isLastStep(isPublicAzureEnvironment(selectedOptionViewModel.dropdown().selectedOption().value));
                }
                else {
                    _this.isLastStep(false);
                }
                _this.finishText("Sign in...");
            }
            else {
                _this.isLastStep(false);
                _this.finishText("Connect");
            }
        });
        return _this;
    }
    ConnectOptionsViewModel.prototype.onNext = function () {
        var _this = this;
        this.connectOptions().filter(function (o) { return o.name === _this.selectedConnectOption(); })[0].action();
    };
    ConnectOptionsViewModel.prototype.onFinish = function () {
        var _this = this;
        this.connectOptions().filter(function (o) { return o.name === _this.selectedConnectOption(); })[0].action();
    };
    ConnectOptionsViewModel.prototype.show = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var temp;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.dialogViewModel.currentPanel(ConnectSteps_1.default.connectOptions);
                        return [4 /*yield*/, this._refreshAvailableEnvironments()];
                    case 1:
                        _a.sent();
                        if (!this.selectedConnectOption()) {
                            this.selectedConnectOption(this.connectOptions()[0].name);
                        }
                        else {
                            temp = this.selectedConnectOption();
                            this.selectedConnectOption("");
                            this.selectedConnectOption(temp);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ConnectOptionsViewModel.prototype._refreshAvailableEnvironments = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, atLeastOneCustomProvider, refreshedOptions;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.dialogViewModel.host.executeOperation("Azure.UserAccounts.getCustomAadProviders", {})];
                    case 1:
                        _a._currentCustomProviders = _b.sent();
                        atLeastOneCustomProvider = _.keys(this._currentCustomProviders).length > 0;
                        refreshedOptions = [];
                        ConnectDialogConstants.azureEnvironments.forEach(function (element) {
                            if (!isPublicAzureEnvironment(element.value)) {
                                if (atLeastOneCustomProvider) {
                                    refreshedOptions.push({
                                        value: element.value,
                                        displayValue: "Use " + element.displayValue
                                    });
                                }
                                else {
                                    refreshedOptions.push({
                                        value: element.value,
                                        displayValue: "Create " + element.displayValue
                                    });
                                }
                            }
                            else {
                                refreshedOptions.push({
                                    value: element.value,
                                    displayValue: element.displayValue
                                });
                            }
                        });
                        this.availableEnvironments(refreshedOptions);
                        return [2 /*return*/];
                }
            });
        });
    };
    return ConnectOptionsViewModel;
}(ConnectDialogPanelViewModel_1.default));
exports.default = ConnectOptionsViewModel;
