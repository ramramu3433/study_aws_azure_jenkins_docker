"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ko = require("knockout");
var _ = require("underscore");
var ConnectSteps_1 = require("./../ConnectSteps");
var AzureEnvironment_1 = require("./../AzureEnvironment");
var AzureEnvironment_2 = require("./../AzureEnvironment");
var ConnectDialogPanelViewModel_1 = require("./ConnectDialogPanelViewModel");
var ConnectDialogConstants = require("./../ConnectDialogConstants");
var CustomEnvironmentViewModel = (function (_super) {
    tslib_1.__extends(CustomEnvironmentViewModel, _super);
    function CustomEnvironmentViewModel(parentDialog) {
        var _this = _super.call(this, parentDialog, "Configure Environment") || this;
        _this.existingPrompt = "Choose an existing environment or create a new one.";
        _this.inputPrompt = "Enter the following information to create a new environment.";
        _this.customEnvironmentSelectLabel = "Environment:";
        _this.duplicateButtonText = "Duplicate";
        _this.deleteButtonText = "Delete";
        _this.requiredText = "Required field";
        _this.onClickArmEndpointHelpLink = function (value) {
            _this.dialogViewModel.host.executeOperation("Environment.Browser.openUrl", { url: ConnectDialogConstants.azureStackArmEndpointHelpLink });
        };
        _this.isLastStep(true);
        _this.canContinue(false);
        _this.finishText("Sign in...");
        _this.customEnvironmentOptions = ko.observableArray();
        _this.selectedCustomEnvironmentOption = ko.observable();
        _this.environmentErrorMessage = ko.observable();
        _this.connectStatusPrompt = ko.observable();
        _this.disableInput = ko.observable(false);
        _this.deleting = ko.observable(false);
        _this.selectedHost = ko.observable("");
        _this.selectedResourceId = ko.observable("");
        _this.selectedGraphEndpoint = ko.observable("");
        _this.selectedArmId = ko.observable("");
        _this.selectedArmEndpoint = ko.observable("");
        _this.selectedTenantIds = ko.observable("");
        _this.prompt = ko.observable();
        _this._currentCustomProviders = {};
        _this.selectedCustomEnvironmentOption.subscribe(function (newValue) {
            if (!!newValue) {
                _this.disableInput(!!newValue.configuration);
                if (_this.disableInput()) {
                    _this.selectedHost(newValue.getConfiguration().host);
                    _this.selectedResourceId(newValue.getConfiguration().signInResourceId);
                    _this.selectedGraphEndpoint(newValue.getConfiguration().graphResource.endpoint);
                    _this.selectedArmId(newValue.getConfiguration().armResource.id);
                    _this.selectedArmEndpoint(newValue.getConfiguration().armResource.endpoint);
                    _this.selectedTenantIds(!!newValue.getConfiguration().adTenants ? newValue.getConfiguration().adTenants.join(", ") : "");
                    _this.canContinue(true);
                }
                else {
                    _this.validateInput();
                }
                if (_this.customEnvironmentOptions().length === 1) {
                    _this.prompt(_this.inputPrompt);
                }
                else {
                    _this.prompt(_this.existingPrompt);
                }
            }
        });
        _this.selectedCustomEnvironmentOption(_this.customEnvironmentOptions()[0]);
        var defaultValues = ConnectDialogConstants.azureStackEnvironmentDefaults;
        _this.newEnvironment = new AzureEnvironment_1.default();
        _this.newEnvironment.setHost(defaultValues.host);
        _this.newEnvironment.setSignInResourceId(defaultValues.signInResourceId);
        _this.newEnvironment.setGraphResourceId(defaultValues.graphResource);
        _this.newEnvironment.setGraphResourceEndpoint(defaultValues.graphResource);
        _this.newEnvironment.setArmResourceId(defaultValues.armId);
        _this.newEnvironment.setArmResourceEndpoint(defaultValues.armEndpoint);
        _this.inputViewModels = ko.observableArray([
            {
                label: "Environment name:",
                observable: ko.observable(_this.newEnvironment.environmentName),
                setters: [function (value) { return _this.newEnvironment.setEnvironmentName(value); }],
                id: "name",
                isInvalid: ko.observable(false),
                isRequired: true,
                isHelpLinkVisible: false
            },
            {
                label: "Authority:",
                observable: ko.observable(_this.newEnvironment.configuration.host),
                setters: [function (value) { return _this.newEnvironment.setHost(value); }],
                id: "host",
                isInvalid: ko.observable(false),
                isRequired: true,
                isHelpLinkVisible: false
            },
            {
                label: "Sign in resource id:",
                observable: ko.observable(_this.newEnvironment.configuration.signInResourceId),
                setters: [function (value) { return _this.newEnvironment.setSignInResourceId(value); }],
                id: "signInResource",
                isInvalid: ko.observable(false),
                isRequired: true,
                isHelpLinkVisible: false
            },
            {
                label: "Graph endpoint:",
                observable: ko.observable(_this.newEnvironment.configuration.graphResource.endpoint),
                setters: [function (value) { return _this.newEnvironment.setGraphResourceId(value); }, function (value) { return _this.newEnvironment.setGraphResourceEndpoint(value); }],
                id: "graphEndpoint",
                isInvalid: ko.observable(false),
                isRequired: true,
                isHelpLinkVisible: false
            },
            {
                label: "ARM resource id:",
                observable: ko.observable(_this.newEnvironment.configuration.armResource.id),
                setters: [function (value) { return _this.newEnvironment.setArmResourceId(value); }],
                id: "armId",
                isInvalid: ko.observable(false),
                isRequired: true,
                isHelpLinkVisible: false
            },
            {
                label: "ARM endpoint:",
                observable: ko.observable(_this.newEnvironment.configuration.armResource.endpoint),
                setters: [function (value) { return _this.newEnvironment.setArmResourceEndpoint(value); }],
                id: "armEndpoint",
                isInvalid: ko.observable(false),
                isRequired: true,
                isHelpLinkVisible: true
            },
            {
                label: "Tenant Id:",
                observable: ko.observable(_this.newEnvironment.configuration.adTenants ? _this.newEnvironment.configuration.adTenants[0] : ""),
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
    CustomEnvironmentViewModel.prototype.validateInput = function () {
        // validate the new configuration
        var validationResult = !this.newEnvironment ? AzureEnvironment_2.AzureEnvironmentValidationResult.NA : this.newEnvironment.validate(_.keys(this._currentCustomProviders));
        if (validationResult !== AzureEnvironment_2.AzureEnvironmentValidationResult.OK) {
            if (validationResult !== AzureEnvironment_2.AzureEnvironmentValidationResult.NA) {
                this.environmentErrorMessage(this.validationResultToString(validationResult));
                this.applyInvalidStyling(validationResult);
            }
            this.canContinue(false);
        }
        else {
            this.environmentErrorMessage("");
            this.canContinue(true);
        }
    };
    CustomEnvironmentViewModel.prototype.show = function (args) {
        this._currentCustomProviders = args.existingCustomProviders;
        var atLeastOneCustomProviderExists = false;
        this.customEnvironmentOptions([]);
        for (var environmentName in this._currentCustomProviders) {
            atLeastOneCustomProviderExists = true;
            var configuration = this._currentCustomProviders[environmentName];
            this.customEnvironmentOptions.push(AzureEnvironment_1.default.createFromExisting(environmentName, configuration));
        }
        this.customEnvironmentOptions.push(AzureEnvironment_1.default.createFromExisting("Create New Environment", null));
        if (atLeastOneCustomProviderExists) {
            this.selectedCustomEnvironmentOption(this.customEnvironmentOptions()[0]);
            this.disableInput(true);
        }
        else {
            this.disableInput(false);
        }
        if (!!args.startingEnv) {
            this.newEnvironment = args.startingEnv;
            this.selectInputById("name").observable(this.newEnvironment.environmentName);
            this.validateInput();
            this.disableInput(false);
        }
        if (!!args.prompt) {
            this.prompt(args.prompt);
        }
        this.dialogViewModel.currentPanel(ConnectSteps_1.default.customEnvironment);
    };
    CustomEnvironmentViewModel.prototype.onBack = function () {
        this.dialogViewModel.openConnectOptions();
    };
    CustomEnvironmentViewModel.prototype.onFinish = function () {
        if (this.disableInput()) {
            this.dialogViewModel.openAwaitAuth({ environment: this.selectedCustomEnvironmentOption().environmentName });
        }
        else {
            this.dialogViewModel.openAwaitAuth({ newEnvironment: this.newEnvironment });
        }
    };
    CustomEnvironmentViewModel.prototype.duplicateEnvironment = function () {
        var nameToDuplicate = this.selectedCustomEnvironmentOption().getEnvironmentName();
        var configToDuplicate = this.selectedCustomEnvironmentOption().getConfiguration();
        this.selectInputById("name").observable(nameToDuplicate + "_Copy");
        this.selectInputById("host").observable(configToDuplicate.host);
        this.selectInputById("signInResource").observable(configToDuplicate.signInResourceId);
        this.selectInputById("graphEndpoint").observable(configToDuplicate.graphResource.endpoint);
        this.selectInputById("armId").observable(configToDuplicate.armResource.id);
        this.selectInputById("armEndpoint").observable(configToDuplicate.armResource.endpoint);
        var tenantIdsDuplicated = "";
        if (!!configToDuplicate.adTenants) {
            tenantIdsDuplicated = configToDuplicate.adTenants.join(", ");
        }
        this.selectInputById("tenantIds").observable(tenantIdsDuplicated);
        this.selectedCustomEnvironmentOption(this.customEnvironmentOptions()[this.customEnvironmentOptions().length - 1]);
    };
    CustomEnvironmentViewModel.prototype.deleteEnvironment = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.disableAllButtons();
                        this.deleting(true);
                        return [4 /*yield*/, this.dialogViewModel.host.executeOperation("Azure.UserAccounts.removeCustomAadProvider", { environment: this.selectedCustomEnvironmentOption().environmentName })];
                    case 1:
                        _a.sent();
                        this.deleting(false);
                        this.customEnvironmentOptions.remove(function (item) { return item.environmentName === _this.selectedCustomEnvironmentOption().environmentName; });
                        // this.selectedCustomEnvironmentOption(this.customEnvironmentOptions()[0]);
                        this.enableAllButtons();
                        return [2 /*return*/];
                }
            });
        });
    };
    CustomEnvironmentViewModel.prototype.selectInputById = function (id) {
        return this.inputViewModels().filter(function (element) { return element.id === id; })[0];
    };
    CustomEnvironmentViewModel.prototype.validationResultToString = function (value) {
        switch (value) {
            case AzureEnvironment_2.AzureEnvironmentValidationResult.INVALID_HOST:
                return "Authority be a https url and have no trailing /'s.";
            case AzureEnvironment_2.AzureEnvironmentValidationResult.INVALID_TENANTS:
                return "Tenant IDs must be a list of comma separated values.";
            case AzureEnvironment_2.AzureEnvironmentValidationResult.SIGN_IN_RESOURCE_ID:
                return "Sign in resource id required.";
            case AzureEnvironment_2.AzureEnvironmentValidationResult.GRAPH_RESOURCE_ID:
                return "Graph resource id required";
            case AzureEnvironment_2.AzureEnvironmentValidationResult.GRAPH_RESOURCE_ENDPOINT:
                return "Graph endpoint must be a https url.";
            case AzureEnvironment_2.AzureEnvironmentValidationResult.ARM_RESOURCE_ID:
                return "ARM resource id required.";
            case AzureEnvironment_2.AzureEnvironmentValidationResult.ARM_RESOURCE_ENDPOINT:
                return "ARM endpoint must be a https url.";
            case AzureEnvironment_2.AzureEnvironmentValidationResult.NO_NAME:
                return "Environment name required.";
            case AzureEnvironment_2.AzureEnvironmentValidationResult.NAME_IN_USE:
                return "Name already in use.";
            case AzureEnvironment_2.AzureEnvironmentValidationResult.RESERVED_NAME:
                return "This name is reserved.";
            default:
                return "Invalid configuration.";
        }
    };
    CustomEnvironmentViewModel.prototype.applyInvalidStyling = function (value) {
        switch (value) {
            case AzureEnvironment_2.AzureEnvironmentValidationResult.INVALID_HOST:
                this.selectInputById("host").isInvalid(true);
                break;
            case AzureEnvironment_2.AzureEnvironmentValidationResult.INVALID_TENANTS:
                this.selectInputById("tenantIds").isInvalid(true);
                break;
            case AzureEnvironment_2.AzureEnvironmentValidationResult.SIGN_IN_RESOURCE_ID:
                this.selectInputById("signInResource").isInvalid(true);
                break;
            case AzureEnvironment_2.AzureEnvironmentValidationResult.GRAPH_RESOURCE_ID:
            case AzureEnvironment_2.AzureEnvironmentValidationResult.GRAPH_RESOURCE_ENDPOINT:
                this.selectInputById("graphResource").isInvalid(true);
                break;
            case AzureEnvironment_2.AzureEnvironmentValidationResult.ARM_RESOURCE_ID:
                this.selectInputById("armId").isInvalid(true);
                break;
            case AzureEnvironment_2.AzureEnvironmentValidationResult.ARM_RESOURCE_ENDPOINT:
                this.selectInputById("armEndpoint").isInvalid(true);
                break;
            case AzureEnvironment_2.AzureEnvironmentValidationResult.NO_NAME:
            case AzureEnvironment_2.AzureEnvironmentValidationResult.NAME_IN_USE:
            case AzureEnvironment_2.AzureEnvironmentValidationResult.RESERVED_NAME:
                break;
        }
    };
    return CustomEnvironmentViewModel;
}(ConnectDialogPanelViewModel_1.default));
exports.default = CustomEnvironmentViewModel;
