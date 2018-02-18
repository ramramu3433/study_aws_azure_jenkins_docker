"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BlobAccessPolicyViewModel_1 = require("./BlobAccessPolicyViewModel");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var QueueAccessPolicyViewModel_1 = require("./QueueAccessPolicyViewModel");
var ResourceTypes_1 = require("../GenerateSas/ResourceTypes");
var TableAccessPolicyViewModel_1 = require("./TableAccessPolicyViewModel");
var TimestampUtilities_1 = require("../../common/TimestampUtilities");
var $ = require("jquery");
var ko = require("knockout");
var SasUtilities = require("../GenerateSas/SasUtilities");
/**
 * View model for the Manage Access Control List dialog
 */
var ManageAclViewModel = (function (_super) {
    tslib_1.__extends(ManageAclViewModel, _super);
    function ManageAclViewModel(parameters) {
        var _this = _super.call(this) || this;
        _this.maximumNumberOfContainerPolicies = 5;
        _this.defaultPolicyDurationInHours = 24 * 7; // 1 week
        /* Controls */
        _this.saveKey = "save";
        _this.saveButtonLabel = "Save"; // localize
        _this.removeButtonLabel = "Remove"; // localize
        _this.addButtonLabel = "Add"; // localize
        /* Labels */
        _this.titleLabel = "Access Policies"; // localize
        _this.accessPoliciesLabel = "Access policies:"; // localize
        _this.timeZoneLabel = "Time zone:"; // localize
        _this.utcLabel = "UTC"; // localize
        _this.localTimeLabel = "Local"; // localize
        _this.idLabel = "Id"; // localize
        _this.startTimeLabel = "Start time"; // localize
        _this.expiryTimeLabel = "Expiry time"; // localize
        /* Observables */
        _this.accessPolicies = ko.observableArray([]);
        _this.timeZone = ko.observable("");
        _this.hasPolicies = ko.computed(function () { return !!_this.accessPolicies().length; });
        _this.canAdd = ko.computed(function () { return _this.accessPolicies().length < _this.maximumNumberOfContainerPolicies; });
        _this.isSaveEnabled = ko.observable(true);
        _this.isCancelEnabled = ko.observable(true);
        DialogOperationRouterProxy_1.default.executeOperation("PersistentStorage.Session.getItem", { key: _this.getStorageSettingKey() })
            .then(function (settings) {
            var defaultTimeZone = (settings && settings.timeZone) ? settings.timeZone : TimestampUtilities_1.default.local;
            _this.timeZone(defaultTimeZone);
        });
        _this.connectionString = parameters.connectionString;
        _this.timeZone.subscribe(function (value) {
            var toUTC = (value === TimestampUtilities_1.default.utc);
            _this.accessPolicies().forEach(function (accessPolicy) {
                TimestampUtilities_1.default.tryChangeTimestampTimeZone(accessPolicy.startTimestamp, toUTC);
                TimestampUtilities_1.default.tryChangeTimestampTimeZone(accessPolicy.expiryTimestamp, toUTC);
            });
        });
        _this.addCustomButton(_this.saveKey, _this.saveButtonLabel, function () { return _this.save(); }, _this.isSaveEnabled);
        _this.addCancelButton(DialogViewModel_1.default.cancelCaption, _this.isCancelEnabled);
        return _this;
    }
    ManageAclViewModel.prototype.isUTC = function () {
        return (this.timeZone() === TimestampUtilities_1.default.utc);
    };
    ManageAclViewModel.prototype.populateAccessPolicies = function () {
        var _this = this;
        // Call Azure Storage to get access policies
        this.getAcl()
            .then(function (accessPolicies) {
            accessPolicies.forEach(function (acl) {
                var convertToLocalTime = !_this.isUTC();
                _this.accessPolicies.push(_this.createAccessPolicyViewModel(acl, convertToLocalTime));
            });
        })
            .catch(function (error) {
            // Localize
            _this.showError("Error when calling Azure Storage:", error);
        });
    };
    ManageAclViewModel.prototype.initializeAccessPolicyPermissionLabels = function () {
        switch (this.resourceType) {
            case ResourceTypes_1.default.blob:
                this.accessPolicyPermissionLabels = [
                    BlobAccessPolicyViewModel_1.default.readLabel,
                    BlobAccessPolicyViewModel_1.default.writeLabel,
                    BlobAccessPolicyViewModel_1.default.deleteLabel,
                    BlobAccessPolicyViewModel_1.default.listLabel
                ];
                break;
            case ResourceTypes_1.default.queue:
                this.accessPolicyPermissionLabels = [
                    QueueAccessPolicyViewModel_1.default.readLabel,
                    QueueAccessPolicyViewModel_1.default.addLabel,
                    QueueAccessPolicyViewModel_1.default.updateLabel,
                    QueueAccessPolicyViewModel_1.default.processLabel
                ];
                break;
            case ResourceTypes_1.default.table:
                this.accessPolicyPermissionLabels = [
                    TableAccessPolicyViewModel_1.default.queryLabel,
                    TableAccessPolicyViewModel_1.default.addLabel,
                    TableAccessPolicyViewModel_1.default.updateLabel,
                    TableAccessPolicyViewModel_1.default.deleteLabel
                ];
                break;
        }
    };
    ManageAclViewModel.prototype.createAccessPolicyViewModel = function (accessPolicyResult, convertToLocalTime) {
        if (convertToLocalTime === void 0) { convertToLocalTime = false; }
        switch (this.resourceType) {
            case ResourceTypes_1.default.blob:
                return new BlobAccessPolicyViewModel_1.default(this, accessPolicyResult, convertToLocalTime);
            case ResourceTypes_1.default.queue:
                return new QueueAccessPolicyViewModel_1.default(this, accessPolicyResult, convertToLocalTime);
            case ResourceTypes_1.default.table:
                return new TableAccessPolicyViewModel_1.default(this, accessPolicyResult, convertToLocalTime);
        }
    };
    ManageAclViewModel.prototype.removePolicy = function (accessPolicy) {
        var index = this.accessPolicies.indexOf(accessPolicy);
        var previousbutton = (index === 0) ? 0 : (index - 1);
        this.accessPolicies.remove(accessPolicy);
        this.accessPolicies()[previousbutton].isRemoveButtonFocused(true);
        this.updateIsSaveEnabled();
    };
    ManageAclViewModel.prototype.addPolicy = function () {
        var localTime = !this.isUTC();
        var defaultSettings = SasUtilities.getDefaultSettings(localTime, this.defaultPolicyDurationInHours);
        // Get unique identifier suffix from millisecond time
        var now = new Date();
        var timeInMilliseconds = now.getTime();
        var uniqueSuffix = timeInMilliseconds.toString(16).toUpperCase();
        var uniqueId = this.resourceName + "-" + uniqueSuffix;
        var accessPolicy = {
            Id: uniqueId,
            AccessPolicy: {
                Start: defaultSettings.startTimestamp,
                Expiry: defaultSettings.expiryTimestamp,
                Permissions: defaultSettings.permissions.join("")
            }
        };
        this.accessPolicies.push(this.createAccessPolicyViewModel(accessPolicy));
    };
    ManageAclViewModel.prototype.isUniqueId = function (id) {
        var accessPolicies = this.accessPolicies(), hits = 0, currentId = id.trim();
        if ($.isArray(accessPolicies)) {
            accessPolicies.forEach(function (policy) {
                if (currentId === policy.id().trim()) {
                    ++hits;
                }
            });
        }
        return (hits === 1);
    };
    ManageAclViewModel.prototype.updateIsSaveEnabled = function () {
        var accessPolicies = this.accessPolicies();
        var policyCount;
        var policy;
        var i;
        var disable = false;
        if ($.isArray(accessPolicies)) {
            policyCount = accessPolicies.length;
            for (i = 0; i < policyCount; i++) {
                policy = accessPolicies[i];
                disable = (policy.isInvalidId() || policy.isInvalidStartTimestamp() || policy.isInvalidExpiryTimestamp());
                if (disable) {
                    break;
                }
            }
        }
        this.isSaveEnabled(!disable);
    };
    ManageAclViewModel.prototype.initialize = function () {
        this.initializeAccessPolicyPermissionLabels();
        this.populateAccessPolicies();
    };
    ManageAclViewModel.prototype.saveSettings = function () {
        var timeZone = this.timeZone();
        var settings = { timeZone: timeZone };
        DialogOperationRouterProxy_1.default.executeOperation("PersistentStorage.Session.setItem", { key: this.getStorageSettingKey(), value: settings });
    };
    ManageAclViewModel.prototype.onSaveError = function (message, error) {
        this.showError(message, error);
        // Re-enable buttons if save fails
        this.isSaveEnabled(true);
        this.isCancelEnabled(true);
    };
    ManageAclViewModel.prototype.saveAccessControlList = function (accessPolicies) {
        var _this = this;
        if (accessPolicies) {
            var azurePolicies = [];
            var isUTC = this.isUTC();
            try {
                accessPolicies.forEach(function (accessPolicy) {
                    var startTimestamp = accessPolicy.startTimestamp();
                    var startDate = TimestampUtilities_1.default.parseDate(startTimestamp, isUTC);
                    var permissions = accessPolicy.getPermissionsString();
                    var azurePolicy = {
                        Id: accessPolicy.id().trim(),
                        AccessPolicy: {
                            Expiry: TimestampUtilities_1.default.parseDate(accessPolicy.expiryTimestamp(), isUTC).toISOString(),
                            Start: startDate ? TimestampUtilities_1.default.parseDate(startTimestamp, isUTC).toISOString() : undefined,
                            Permissions: permissions ? permissions : undefined
                        }
                    };
                    azurePolicies.push(azurePolicy);
                });
                // Call Azure Storage to set access policies
                this.setAcl(azurePolicies)
                    .then(function () {
                    // Dismiss dialog if save is successful
                    _this.dialogResult(null);
                })
                    .catch(function (error) {
                    _this.onSaveError("Error when calling Azure Storage:", error); // Localize
                });
            }
            catch (error) {
                this.onSaveError("Error saving access control list:", error); // Localize
            }
        }
    };
    ManageAclViewModel.prototype.save = function () {
        // Disable buttons at save start
        this.isSaveEnabled(false);
        this.isCancelEnabled(false);
        this.saveSettings();
        this.saveAccessControlList(this.accessPolicies());
    };
    ManageAclViewModel.prototype.getStorageSettingKey = function () {
        return ManageAclViewModel.storageKeyPrefix + this.resourceType;
    };
    return ManageAclViewModel;
}(DialogViewModel_1.default));
/* Constants */
ManageAclViewModel.storageKeyPrefix = "StorageExplorer_ManageAccessControlList_v1_";
exports.default = ManageAclViewModel;
