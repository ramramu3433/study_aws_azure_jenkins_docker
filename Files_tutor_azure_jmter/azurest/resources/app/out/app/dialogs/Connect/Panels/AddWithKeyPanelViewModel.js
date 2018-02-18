"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var AttachedStorage_1 = require("../../../common/AttachedStorage");
var ConnectDialogPanelViewModel_1 = require("./ConnectDialogPanelViewModel");
var ConnectionString_1 = require("../../../renderer/Components/AzureStorage/ConnectionString/Parsers/ConnectionString");
var ConnectSteps_1 = require("./../ConnectSteps");
var EndpointDomains_1 = require("../../../renderer/Components/AzureStorage/EndpointDomains");
var ko = require("knockout");
var Utilities = require("../../../Utilities");
/**
 * View model for adding external storage accounts dialog
 */
var AddStorageAccountDialogViewModel = (function (_super) {
    tslib_1.__extends(AddStorageAccountDialogViewModel, _super);
    function AddStorageAccountDialogViewModel(parentDialog, key) {
        if (key === void 0) { key = ""; }
        var _this = _super.call(this, parentDialog, "Attach using Name and Key") || this;
        _this.defaultDomain = EndpointDomains_1.default.default;
        _this.chinaAzure = EndpointDomains_1.default.chinaAzure;
        _this.germanyAzure = EndpointDomains_1.default.germanyAzure;
        _this.govAzure = EndpointDomains_1.default.usAzure;
        _this.other = "";
        _this.endpointOptionsLabel = "select storage endpoints domain";
        _this.endpointOptions = ko.observableArray([
            {
                displayValue: "Azure",
                value: _this.defaultDomain
            },
            {
                displayValue: "Azure China",
                value: _this.chinaAzure
            },
            {
                displayValue: "Azure Germany",
                value: _this.germanyAzure
            },
            {
                displayValue: "US Government",
                value: _this.govAzure
            },
            {
                displayValue: "Other (enter below)",
                value: _this.other
            }
        ]);
        _this.accountNamePlaceholder = "Enter a storage account name"; // localize
        _this.accountKeyPlaceholder = "Enter a storage account key"; // localize
        _this.endpointsDomainPlaceholder = "Enter storage endpoints domain"; // localize
        _this.accountName = ko.observable("");
        _this.accountKey = ko.observable("");
        _this.useHttp = ko.observable(false);
        _this.selectedEndpointsDomain = ko.observable({
            displayValue: "Azure",
            value: _this.defaultDomain
        });
        _this.enteredEndpointsDomain = ko.observable(_this.defaultDomain);
        _this._trimmedAccountName = ko.computed(function () {
            return _this.accountName().trim();
        });
        _this._trimmedAccountKey = ko.pureComputed(function () {
            return _this.accountKey().trim();
        });
        _this.isBase64Encoded = ko.pureComputed(function () {
            var accountKey = _this._trimmedAccountKey();
            return Utilities.isBase64Encoded(accountKey);
        });
        // Localize
        _this.isAccountNameValid = ko.pureComputed(function () {
            var accountName = _this._trimmedAccountName();
            return !accountName || !_this.wasAccountStored();
        });
        _this.isAccountKeyValid = ko.pureComputed(function () {
            var accountKey = _this._trimmedAccountKey();
            return !accountKey || _this.isBase64Encoded();
        });
        _this.warningMessage = ko.computed(function () {
            var message = "";
            if (!_this.isAccountNameValid()) {
                message = "This Microsoft Azure storage account has already been attached";
            }
            else if (!_this.isAccountKeyValid()) {
                message = "Invalid account key: invalid length for a Base-64 char array or string";
            }
            return message;
        });
        _this.wasAccountStored = ko.pureComputed(function () {
            var accountName = _this._trimmedAccountName();
            return AttachedStorage_1.default.wasAccountStored({
                accountName: accountName,
                endpointsDomain: _this.selectedEndpointsDomain().value,
                connectionType: 3 /* key */
            });
        });
        _this.openStatement = function () {
            _this.dialogViewModel.host.executeOperation("Environment.Browser.openUrl", 
            // TODO: replace with a FwLink
            { url: "https://www.visualstudio.com/en-us/dn948229" });
        };
        _this.finishText("Connect");
        _this.isLastStep(false);
        _this._nextButtonEnabled(false);
        _this.canContinue = ko.pureComputed(function () { return !!_this.accountName() && !!_this.accountKey() && !_this.warningMessage() && !!_this.enteredEndpointsDomain(); });
        _this.canContinue.subscribe(function (newValue) {
            _this._nextButtonEnabled(newValue);
        });
        _this.selectedEndpointsDomain.subscribe(function (newValue) {
            return _this.enteredEndpointsDomain(newValue.value);
        });
        _this.accountKey(key);
        return _this;
    }
    AddStorageAccountDialogViewModel.prototype.onBack = function () {
        this.dialogViewModel.openConnectOptions();
    };
    AddStorageAccountDialogViewModel.prototype.onNext = function () {
        var storageAccount = {
            accountName: this._trimmedAccountName(),
            accountKey: this._trimmedAccountKey(),
            endpointsDomain: this.enteredEndpointsDomain(),
            connectionType: 3 /* key */,
            useHttp: this.useHttp(),
            defaultEndpointsProtocol: this.useHttp() ? "http" : "https"
        };
        var connectionString = ConnectionString_1.default.createFromStorageAccount(storageAccount);
        this.dialogViewModel.openSummary({ connectionString: connectionString, source: "Key" });
    };
    AddStorageAccountDialogViewModel.prototype.show = function () {
        this.dialogViewModel.currentPanel(ConnectSteps_1.default.addStorageAccountKey);
    };
    AddStorageAccountDialogViewModel.prototype.getParameters = function () {
        return null;
    };
    ;
    return AddStorageAccountDialogViewModel;
}(ConnectDialogPanelViewModel_1.default));
exports.default = AddStorageAccountDialogViewModel;
