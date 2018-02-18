"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Errors = require("../../common/Errors");
var ko = require("knockout");
var SasUtilities = require("../GenerateSas/SasUtilities");
var AccessPolicyViewModel = (function () {
    function AccessPolicyViewModel(manageAccessControlListViewModel, accessPolicy, convertToLocalTime) {
        if (convertToLocalTime === void 0) { convertToLocalTime = false; }
        var _this = this;
        /* Labels */
        this.idPlaceholder = "Please provide a unique ID"; // localize
        this.invalidIdTooltip = "Required field. Please provide a unique ID."; // localize
        var id = accessPolicy.Id;
        var settings = SasUtilities.getPolicySettings(accessPolicy, convertToLocalTime);
        this.id = ko.observable(id);
        this.startTimestamp = ko.observable(settings.startTimestamp);
        this.expiryTimestamp = ko.observable(settings.expiryTimestamp);
        this.permissionViewModels = ko.observableArray();
        this.manageAccessControlListViewModel = manageAccessControlListViewModel;
        // Input validation
        this.isInvalidId = ko.observable(false);
        this.idTooltip = ko.observable(SasUtilities.noTooltip);
        this.id.subscribe(function (value) {
            var result = _this.isInvalidIdInput(value, _this.manageAccessControlListViewModel);
            _this.isInvalidId(result.isInvalid);
            _this.idTooltip(result.help);
            _this.manageAccessControlListViewModel.updateIsSaveEnabled();
        });
        this.isInvalidStartTimestamp = ko.observable(false);
        this.startTimestampTooltip = ko.observable(SasUtilities.noTooltip);
        this.startTimestamp.subscribe(function (value) {
            _this.validateTimestampInput(value, _this.expiryTimestamp(), _this.manageAccessControlListViewModel.isUTC());
            _this.manageAccessControlListViewModel.updateIsSaveEnabled();
        });
        this.isRemoveButtonFocused = ko.observable(false);
        this.isInvalidExpiryTimestamp = ko.observable(false);
        this.expiryTimestampTooltip = ko.observable(SasUtilities.noTooltip);
        this.expiryTimestamp.subscribe(function (value) {
            _this.validateTimestampInput(_this.startTimestamp(), value, _this.manageAccessControlListViewModel.isUTC());
            _this.manageAccessControlListViewModel.updateIsSaveEnabled();
        });
    }
    AccessPolicyViewModel.prototype.remove = function () {
        this.manageAccessControlListViewModel.removePolicy(this);
    };
    AccessPolicyViewModel.prototype.getPermissionsString = function () {
        throw new Errors.NotImplementedFunctionError("Abstract method. This method should be implemented by a subclass.");
    };
    // Is empty string or duplicate id
    AccessPolicyViewModel.prototype.isInvalidIdInput = function (value, manageAccessControlListViewModel) {
        var tooltip = SasUtilities.noTooltip, isValid = value && !!value.trim();
        if (isValid && manageAccessControlListViewModel) {
            isValid = this.manageAccessControlListViewModel.isUniqueId(value);
        }
        if (!isValid) {
            tooltip = this.invalidIdTooltip;
        }
        return { isInvalid: !isValid, help: tooltip };
    };
    AccessPolicyViewModel.prototype.validateTimestampInput = function (startTimestamp, expiryTimestamp, isUTC) {
        // Start timestamp
        var isUTC = this.manageAccessControlListViewModel.isUTC(), result = SasUtilities.isInvalidStartTimeInput(startTimestamp, expiryTimestamp, isUTC);
        this.isInvalidStartTimestamp(result.isInvalid);
        this.startTimestampTooltip(result.help);
        // Expiry timestamp
        result = SasUtilities.isInvalidExpiryTimeInput(startTimestamp, expiryTimestamp, isUTC);
        this.isInvalidExpiryTimestamp(result.isInvalid);
        this.expiryTimestampTooltip(result.help);
    };
    return AccessPolicyViewModel;
}());
exports.default = AccessPolicyViewModel;
