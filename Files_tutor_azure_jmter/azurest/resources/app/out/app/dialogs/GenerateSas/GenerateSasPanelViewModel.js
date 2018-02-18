"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ko = require("knockout");
var SasUtilities = require("./SasUtilities");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var DialogOperationRouterProxy_2 = require("../Common/DialogOperationRouterProxy");
var PanelViewModel_1 = require("../Common/PanelViewModel");
var ResourceTypes_1 = require("./ResourceTypes");
var TimestampUtilities_1 = require("../../common/TimestampUtilities");
/**
 * View model for Generate Shared Access Signature dialog
 */
var GenerateSasPanelViewModel = (function (_super) {
    tslib_1.__extends(GenerateSasPanelViewModel, _super);
    function GenerateSasPanelViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel) || this;
        /* Controls */
        _this.createKey = "create";
        _this.createButtonLabel = "Create";
        // Localize
        _this.titleLabel = "Shared Access Signature";
        _this.policyLabel = "Access policy:";
        _this.startTimestampLabel = "Start time:";
        _this.expiryTimestampLabel = "Expiry time:";
        _this.timeZoneLabel = "Time zone:";
        _this.utcLabel = "UTC";
        _this.localTimeLabel = "Local";
        _this.noAccessPolicyLabel = "None";
        _this.permissionsLabel = "Permissions:";
        /* Observables */
        _this.startTimestamp = ko.observable("");
        _this.expiryTimestamp = ko.observable("");
        _this.timeZone = ko.observable("");
        _this.accessPolicies = ko.observableArray([_this.noAccessPolicyLabel]);
        _this.accessPolicy = ko.observable(_this.noAccessPolicyLabel);
        _this.noAccessPolicy = ko.computed(function () { return _this.accessPolicy() === _this.noAccessPolicyLabel; });
        _this.permissionViewModels = ko.observableArray([]);
        _this.isInvalidStartTimestamp = ko.observable(false);
        _this.startTimestampTooltip = ko.observable("");
        _this.isInvalidExpiryTimestamp = ko.observable(false);
        _this.expiryTimestampTooltip = ko.observable(SasUtilities.noTooltip);
        _this.isCreateEnabled = ko.observable(true);
        _this.isTableResource = ko.computed(function () { return _this.resourceType === "table"; });
        _this.accessPolicyMap = {};
        _this.connectionString = parameters.connectionString;
        _this.resourceType = parameters.resourceType;
        _this.loadSettingsOrDefault()
            .then(function (settings) {
            _this.startTimestamp(settings.startTimestamp);
            _this.expiryTimestamp(settings.expiryTimestamp);
            _this.timeZone(settings.timeZone);
        });
        _this.accessPolicy.subscribe(function (value) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var noPolicy, toLocal, accessPolicy, settings, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        noPolicy = (value === this.noAccessPolicyLabel);
                        toLocal = !this.isUTC();
                        accessPolicy = this.accessPolicyMap[value];
                        if (!noPolicy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadSettingsOrDefault(/* convertIfNeeded */ true, /* toLocal */ toLocal, /* defaultToLocalTime */ toLocal)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = SasUtilities.getPolicySettings(accessPolicy, toLocal);
                        _b.label = 3;
                    case 3:
                        settings = _a;
                        this.startTimestamp(settings.startTimestamp);
                        this.expiryTimestamp(settings.expiryTimestamp);
                        this.permissionViewModels().forEach(function (permission) {
                            return permission.isSelected(settings.permissions.indexOf(permission.value) >= 0);
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        _this.timeZone.subscribe(function (value) {
            var toUTC = (value === SasUtilities.utc);
            TimestampUtilities_1.default.tryChangeTimestampTimeZone(_this.startTimestamp, toUTC);
            TimestampUtilities_1.default.tryChangeTimestampTimeZone(_this.expiryTimestamp, toUTC);
        });
        _this.startTimestamp.subscribe(function (value) {
            _this.validateTimestampInput(value, _this.expiryTimestamp(), _this.isUTC());
            _this.updateIsCreateEnabled();
        });
        _this.expiryTimestamp.subscribe(function (value) {
            _this.validateTimestampInput(_this.startTimestamp(), value, _this.isUTC());
            _this.updateIsCreateEnabled();
        });
        _this.addCustomButton(_this.createKey, _this.createButtonLabel, function () { return _this.generateSas(_this.getParameters()); }, { isEnabled: _this.isCreateEnabled });
        _this.addCancelButton();
        return _this;
    }
    GenerateSasPanelViewModel.prototype.loadSettingsOrDefault = function (convertSettingTimestampsIfNeeded, toLocal, defaultToLocalTime) {
        if (convertSettingTimestampsIfNeeded === void 0) { convertSettingTimestampsIfNeeded = false; }
        if (toLocal === void 0) { toLocal = null; }
        if (defaultToLocalTime === void 0) { defaultToLocalTime = true; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var settings;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DialogOperationRouterProxy_2.default.executeOperation("PersistentStorage.Session.getItem", { key: this.getStorageSettingsKey() })];
                    case 1:
                        settings = _a.sent();
                        // Get defaults if settings are missing
                        if (!settings || !settings.startTimestamp || !settings.expiryTimestamp || !settings.timeZone || !Array.isArray(settings.permissions)) {
                            settings = SasUtilities.getDefaultSettings(defaultToLocalTime);
                        }
                        else if (convertSettingTimestampsIfNeeded) {
                            if (toLocal && (settings.timeZone !== SasUtilities.local)) {
                                settings.startTimestamp = TimestampUtilities_1.default.localFromUtcDateString(settings.startTimestamp);
                                settings.expiryTimestamp = TimestampUtilities_1.default.localFromUtcDateString(settings.expiryTimestamp);
                            }
                            else if (!toLocal && (settings.timeZone === SasUtilities.local)) {
                                settings.startTimestamp = TimestampUtilities_1.default.utcFromLocalDateString(settings.startTimestamp);
                                settings.expiryTimestamp = TimestampUtilities_1.default.utcFromLocalDateString(settings.expiryTimestamp);
                            }
                        }
                        return [2 /*return*/, settings];
                }
            });
        });
    };
    GenerateSasPanelViewModel.prototype.initialize = function () {
        var _this = this;
        this.loadSettingsOrDefault()
            .then(function (settings) {
            // Storage account SAS does not yet support shared access policies.
            if (_this.resourceType !== ResourceTypes_1.default.account) {
                _this.populateAccessPolicies(_this.accessPolicies, _this.accessPolicyMap);
            }
            _this.permissionViewModels().forEach(function (permission) {
                return permission.isSelected(settings.permissions.indexOf(permission.value) >= 0);
            });
        });
    };
    GenerateSasPanelViewModel.prototype.getParameters = function () {
        var settings = {
            startTimestamp: this.startTimestamp(),
            expiryTimestamp: this.expiryTimestamp(),
            timeZone: this.timeZone(),
            permissions: this.permissionViewModels()
                .filter(function (permission) { return permission.isSelected(); })
                .map(function (permission) { return permission.value; })
        };
        settings = this.appendSettings(settings);
        // Only save new settings entered by the user, not policy settings.
        if (this.noAccessPolicy()) {
            DialogOperationRouterProxy_2.default.executeOperation("PersistentStorage.Session.setItem", { key: this.getStorageSettingsKey(), value: settings });
        }
        var parameters = {
            expiry: TimestampUtilities_1.default.parseDate(settings.expiryTimestamp, this.isUTC()),
            start: TimestampUtilities_1.default.parseDate(settings.startTimestamp, this.isUTC()),
            permissions: SasUtilities.getPermissionString(settings.permissions, this.resourceType),
            accessPolicyId: this.noAccessPolicy() ? null : this.accessPolicy()
        };
        parameters = this.appendParameters(parameters);
        return parameters;
    };
    GenerateSasPanelViewModel.prototype.isUTC = function () {
        return (this.timeZone() === SasUtilities.utc);
    };
    GenerateSasPanelViewModel.prototype.getStorageSettingsKey = function () {
        return GenerateSasPanelViewModel.storageKeyPrefix + this.resourceType;
    };
    GenerateSasPanelViewModel.prototype.populateAccessPolicies = function (koAccessPolicies, accessPolicyMap) {
        var _this = this;
        if (koAccessPolicies && accessPolicyMap) {
            // Call Azure Storage to get access policies
            DialogOperationRouterProxy_1.default.executeOperation(this.getAclOperation(), this.getAclOperationParameters())
                .then(function (accessPolicies) {
                accessPolicies.forEach(function (acl) {
                    var id = acl.Id;
                    koAccessPolicies.push(id);
                    accessPolicyMap[id] = acl;
                });
            })
                .catch(function (error) {
                _this.showError("Error when calling Azure Storage:", error);
            });
        }
    };
    GenerateSasPanelViewModel.prototype.validateTimestampInput = function (startTimestamp, expiryTimestamp, isUTC) {
        // Start timestamp
        var isUTC = this.isUTC();
        var result = SasUtilities.isInvalidStartTimeInput(startTimestamp, expiryTimestamp, isUTC);
        this.isInvalidStartTimestamp(result.isInvalid);
        this.startTimestampTooltip(result.help);
        // Expiry timestamp
        result = SasUtilities.isInvalidExpiryTimeInput(startTimestamp, expiryTimestamp, isUTC);
        this.isInvalidExpiryTimestamp(result.isInvalid);
        this.expiryTimestampTooltip(result.help);
    };
    GenerateSasPanelViewModel.prototype.updateIsCreateEnabled = function () {
        var disable = (this.isInvalidStartTimestamp() || this.isInvalidExpiryTimestamp());
        this.isCreateEnabled(!disable);
    };
    GenerateSasPanelViewModel.prototype.generateSas = function (parameters) {
        this.dialogViewModel.openShowSasPanel(parameters);
    };
    return GenerateSasPanelViewModel;
}(PanelViewModel_1.default));
/* Constants */
GenerateSasPanelViewModel.dialogId = "#generate-sas";
GenerateSasPanelViewModel.allDialogIds = "#generate-sas, #show-sas";
GenerateSasPanelViewModel.storageKeyPrefix = "StorageExplorer_GenerateSharedAccessSignature_v1_";
exports.default = GenerateSasPanelViewModel;
