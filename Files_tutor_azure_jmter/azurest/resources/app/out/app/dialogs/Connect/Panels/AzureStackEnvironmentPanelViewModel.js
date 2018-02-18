"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ko = require("knockout");
var CustomEnvironmentViewModel_1 = require("./CustomEnvironmentViewModel");
var ConnectDialogConstants = require("./../ConnectDialogConstants");
var ConnectSteps_1 = require("./../ConnectSteps");
var TelemetryManager = require("../../../renderer/telemetry/TelemetryManager");
var AzureStackEnvironmentViewModel = (function (_super) {
    tslib_1.__extends(AzureStackEnvironmentViewModel, _super);
    function AzureStackEnvironmentViewModel(parentDialog) {
        var _this = _super.call(this, parentDialog) || this;
        _this.title("Azure Stack");
        var defaultValues = ConnectDialogConstants.azureStackEnvironmentDefaults;
        _this.inputViewModels = ko.observableArray([
            {
                label: "Environment name:",
                observable: ko.observable(),
                setters: [function (value) { return _this.newEnvironment.setEnvironmentName(value); }],
                id: "name",
                isInvalid: ko.observable(false),
                isRequired: true,
                isHelpLinkVisible: false
            },
            {
                label: "ARM endpoint:",
                observable: ko.observable(defaultValues.armEndpoint),
                setters: [function (value) { return _this.newEnvironment.setArmResourceEndpoint(value); }],
                id: "armEndpoint",
                isInvalid: ko.observable(false),
                isRequired: true,
                isHelpLinkVisible: true
            },
            {
                label: "Tenant Id:",
                observable: ko.observable(),
                setters: [function (value) { return _this.newEnvironment.setAadTenants(value); }],
                id: "tenantIds",
                isInvalid: ko.observable(false),
                isRequired: false,
                isHelpLinkVisible: false
            }
        ]);
        // Although this may look like a double for loop, it isn't. It is one for loop which
        // is calling subscribe on each inputViewModel, with an argument of subscribe being
        // a function which has a for loop inside of it.
        _this.inputViewModels().forEach(function (viewModel) {
            viewModel.observable.subscribe(function (newValue) {
                for (var j = 0; j < viewModel.setters.length; j++) {
                    // set every field this value is supposed to propagate to
                    viewModel.setters[j](newValue);
                }
                viewModel.isInvalid(false);
                // validate the new configuration
                _this.validateInput();
            });
        });
        return _this;
    }
    AzureStackEnvironmentViewModel.prototype.duplicateEnvironment = function () {
        var nameToDuplicate = this.selectedCustomEnvironmentOption().getEnvironmentName();
        var configToDuplicate = this.selectedCustomEnvironmentOption().getConfiguration();
        this.selectInputById("name").observable(nameToDuplicate + "_Copy");
        this.selectInputById("armEndpoint").observable(configToDuplicate.armResource.endpoint);
        var tenantIdsDuplicated = "";
        if (!!configToDuplicate.adTenants) {
            tenantIdsDuplicated = configToDuplicate.adTenants.join(", ");
        }
        this.selectInputById("tenantIds").observable(tenantIdsDuplicated);
        this.selectedCustomEnvironmentOption(this.customEnvironmentOptions()[this.customEnvironmentOptions().length - 1]);
    };
    AzureStackEnvironmentViewModel.prototype.onFinish = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.disableInput()) return [3 /*break*/, 1];
                        // existing env
                        _super.prototype.onFinish.call(this);
                        return [3 /*break*/, 5];
                    case 1:
                        this.connectStatusPrompt("Retrieving configuration...");
                        this.canContinue(false);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.newEnvironment.updateConfigFromArmEndpointAsync(this.dialogViewModel.host)];
                    case 3:
                        _a.sent();
                        this.connectStatusPrompt("");
                        this.dialogViewModel.openAwaitAuth({ newEnvironment: this.newEnvironment });
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        TelemetryManager.sendEvent("StorageExplorer.ConnectDialog.AzureStackConfigRetrievalError", { err: err_1 });
                        this.dialogViewModel.openCustomEnvironment({ existingCustomProviders: this._currentCustomProviders, startingEnv: this.newEnvironment, prompt: "Unable to retrieve configuration. Please fill in the values manually." });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AzureStackEnvironmentViewModel.prototype.show = function (args) {
        _super.prototype.show.call(this, args);
        this.dialogViewModel.currentPanel(ConnectSteps_1.default.azureStackEnvironment);
    };
    return AzureStackEnvironmentViewModel;
}(CustomEnvironmentViewModel_1.default));
exports.default = AzureStackEnvironmentViewModel;
