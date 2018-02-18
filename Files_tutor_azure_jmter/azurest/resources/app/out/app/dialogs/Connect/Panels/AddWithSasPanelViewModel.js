"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ConnectDialogPanelViewModel_1 = require("./ConnectDialogPanelViewModel");
var ConnectSteps_1 = require("../ConnectSteps");
var ConnectionString_1 = require("../../../renderer/Components/AzureStorage/ConnectionString/Parsers/ConnectionString");
var ConnectionStringKey_1 = require("../../../renderer/Components/AzureStorage/ConnectionString/Parsers/ConnectionStringKey");
var ConnectionStringValidationError_1 = require("../../../renderer/Components/AzureStorage/ConnectionString/Validators/ConnectionStringValidationError");
var ConnectionStringValidator_1 = require("../../../renderer/Components/AzureStorage/ConnectionString/Validators/ConnectionStringValidator");
var SasUriValidationError_1 = require("../../../renderer/Components/AzureStorage/Sas/Validators/SasUriValidationError");
var DialogOperationRouterProxy_1 = require("../../Common/DialogOperationRouterProxy");
var SasResourceEndpoints_1 = require("../../../renderer/Components/AzureStorage/SasResourceEndpoints");
var SasUri_1 = require("../../../renderer/Components/AzureStorage/Sas/Parsers/SasUri");
var SasUriValidator_1 = require("../../../renderer/Components/AzureStorage/Sas/Validators/SasUriValidator");
var ValidationResult_1 = require("../../../renderer/Components/Validation/ValidationResult");
var ko = require("knockout");
var url = require("url");
var AccountNameValidationCode = {
    MissingAccountName: "MissingAccountName",
    DuplicateAccountName: "DuplicateAccountName"
};
var SasUriEndpointValidationCode = {
    SasUriMissingEndpoint: "SasUriMissingEndpoint",
    SasUriInvalidBlobEndpoint: "SasUriInvalidBlobEndpoint",
    SasUriInvalidFileEndpoint: "SasUriInvalidFileEndpoint",
    SasUriInvalidQueueEndpoint: "SasUriInvalidQueueEndpoint",
    SasUriInvalidTableEndpoint: "SasUriInvalidBTablendpoint"
};
/**
 * View model for adding external storage accounts.
 */
var AddWithSasViewModel = (function (_super) {
    tslib_1.__extends(AddWithSasViewModel, _super);
    //#endregion
    function AddWithSasViewModel(parentDialog, connectionString) {
        if (connectionString === void 0) { connectionString = ""; }
        var _this = _super.call(this, parentDialog, "Attach with Connection String or SAS URI") || this;
        _this.selectedSection = ko.observable("");
        _this.errorMessage = ko.pureComputed(function () {
            if (_this.isConnectionStringSectionEnabled()) {
                return _this.connectionStringSectionErrorMessage();
            }
            else {
                return _this.sasUriSectionErrorMessage();
            }
        });
        _this.isAttachable = ko.pureComputed(function () {
            return _this.isConnectionStringSectionEnabled() && _this.isConnectionStringSectionValid() ||
                _this.isSasUriSectionEnabled() && _this.isSasUriSectionValid();
        });
        //#region Connection String Variables
        // Localize
        _this.connectionStringSectionLabel = "Use a connection string";
        _this.connectionStringInputLabel = "Connection string:";
        _this.connectionStringLabelLabel = "Account label:";
        _this.connectionStringTooltip = "Right click on a storage account to get a shared access signature";
        _this.isConnectionStringSectionEnabled = ko.pureComputed(function () { return _this.selectedSection() === "connectionString"; });
        _this.connectionString = ko.observable("");
        _this.isConnectionStringValid = ko.pureComputed(function () { return _this._connectionStringValidation().isValid; });
        _this.connectionStringErrorMessage = ko.pureComputed(function () {
            var shouldShowMessage = !_this.isConnectionStringValid() &&
                !_this._connectionStringValidation().errors.some(function (error) { return error.code === ConnectionStringValidationError_1.default.ConnectionStringEmpty; });
            if (shouldShowMessage) {
                return _this._connectionStringValidation().errors[0].message;
            }
            else {
                return "";
            }
        });
        _this.connectionStringLabel = ko.observable("");
        _this.isConnectionStringLabelValid = ko.pureComputed(function () { return _this._connectionStringLabelValidation().isValid; });
        _this.connectionStringLabelErrorMessage = ko.pureComputed(function () {
            var shouldShowMessage = _this.isConnectionStringValid() && !_this.isConnectionStringLabelValid();
            if (shouldShowMessage) {
                return _this._connectionStringLabelValidation().errors[0].message;
            }
            else {
                return "";
            }
        });
        _this.isConnectionStringSectionValid = ko.pureComputed(function () { return _this.isConnectionStringValid() && _this.isConnectionStringLabelValid(); });
        _this.connectionStringSectionErrorMessage = ko.pureComputed(function () { return _this.connectionStringErrorMessage() || _this.connectionStringLabelErrorMessage(); });
        _this._connectionStringValidation = ko.pureComputed(function () {
            var connectionString = new ConnectionString_1.default(_this.connectionString());
            return ConnectionStringValidator_1.default.validate(connectionString);
        });
        _this._connectionStringLabelValidation = ko.observable(new ValidationResult_1.default());
        //#endregion
        //#region SAS URI Variables
        // Localize
        _this.sasUriSectionLabel = "Use a SAS URI";
        _this.sasUriInputLabel = "URI:";
        _this.sasUriLabelLabel = "Account or resource label:";
        _this.sasUriTooltip = "Right click on a blob container, queue, table, or file share to get a shared access signature";
        _this.sasUriBlobEndpointLabel = "Blob endpoint:";
        _this.sasUriFileEndpointLabel = "File endpoint:";
        _this.sasUriQueueEndpointLabel = "Queue endpoint:";
        _this.sasUriTableEndpointLabel = "Table endpoint:";
        _this.isSasUriSectionEnabled = ko.pureComputed(function () { return _this.selectedSection() === "sasUri"; });
        _this.sasUri = ko.observable("");
        _this.isSasUriValid = ko.pureComputed(function () { return _this._sasUriValidation().isValid; });
        _this.sasUriErrorMessage = ko.pureComputed(function () {
            var shouldShowMessage = !_this.isSasUriValid() &&
                !_this._sasUriValidation().errors.some(function (error) { return error.code === SasUriValidationError_1.default.UriEmpty; });
            if (shouldShowMessage) {
                return _this._sasUriValidation().errors[0].message;
            }
            else {
                return "";
            }
        });
        _this.sasUriLabel = ko.observable("");
        _this.isSasUriLabelValid = ko.pureComputed(function () { return _this._sasUriLabelValidation().isValid; });
        _this.isSasUriLabelEnabled = ko.pureComputed(function () {
            var sasUri = new SasUri_1.default(_this.sasUri());
            return sasUri.sasToken.isAccountToken();
        });
        _this.sasUriLabelTooltip = ko.pureComputed(function () { return !_this.isSasUriLabelEnabled() ? "A label is not required for service-level SAS URIs" : ""; });
        _this.sasUriLabelErrorMessage = ko.pureComputed(function () {
            var shouldShowMessage = _this.isSasUriValid() && !_this.isSasUriLabelValid();
            if (shouldShowMessage) {
                return _this._sasUriLabelValidation().errors[0].message;
            }
            else {
                return "";
            }
        });
        _this.sasUriBlobEndpoint = ko.observable("");
        _this.isSasUriBlobEndpointValid = ko.pureComputed(function () {
            return !_this._sasUriEndpointsValidation().errors.some(function (error) { return error.code === SasUriEndpointValidationCode.SasUriInvalidBlobEndpoint; });
        });
        _this.isSasUriBlobEndpointEnabled = ko.pureComputed(function () {
            var sasUri = new SasUri_1.default(_this.sasUri());
            return sasUri.sasToken.isAccountToken() && sasUri.sasToken.hasServiceAccess("b");
        });
        _this.sasUriBlobEndpointTooltip = ko.pureComputed(function () { return !_this.isSasUriBlobEndpointEnabled() ? "The SAS URI does not support blob services" : ""; });
        _this.sasUriFileEndpoint = ko.observable("");
        _this.isSasUriFileEndpointValid = ko.pureComputed(function () {
            return !_this._sasUriEndpointsValidation().errors.some(function (error) { return error.code === SasUriEndpointValidationCode.SasUriInvalidFileEndpoint; });
        });
        _this.isSasUriFileEndpointEnabled = ko.pureComputed(function () {
            var sasUri = new SasUri_1.default(_this.sasUri());
            return sasUri.sasToken.isAccountToken() && sasUri.sasToken.hasServiceAccess("f");
        });
        _this.sasUriFileEndpointTooltip = ko.pureComputed(function () { return !_this.isSasUriFileEndpointEnabled() ? "The SAS URI does not support file services" : ""; });
        _this.sasUriQueueEndpoint = ko.observable("");
        _this.isSasUriQueueEndpointValid = ko.pureComputed(function () {
            return !_this._sasUriEndpointsValidation().errors.some(function (error) { return error.code === SasUriEndpointValidationCode.SasUriInvalidQueueEndpoint; });
        });
        _this.isSasUriQueueEndpointEnabled = ko.pureComputed(function () {
            var sasUri = new SasUri_1.default(_this.sasUri());
            return sasUri.sasToken.isAccountToken() && sasUri.sasToken.hasServiceAccess("q");
        });
        _this.sasUriQueueEndpointTooltip = ko.pureComputed(function () { return !_this.isSasUriQueueEndpointEnabled() ? "The SAS URI does not support queue services" : ""; });
        _this.sasUriTableEndpoint = ko.observable("");
        _this.isSasUriTableEndpointValid = ko.pureComputed(function () {
            return !_this._sasUriEndpointsValidation().errors.some(function (error) { return error.code === SasUriEndpointValidationCode.SasUriInvalidTableEndpoint; });
        });
        _this.isSasUriTableEndpointEnabled = ko.pureComputed(function () {
            var sasUri = new SasUri_1.default(_this.sasUri());
            return sasUri.sasToken.isAccountToken() && sasUri.sasToken.hasServiceAccess("t");
        });
        _this.sasUriTableEndpointTooltip = ko.pureComputed(function () { return !_this.isSasUriTableEndpointEnabled() ? "The SAS URI does not support table services" : ""; });
        _this.isSasUriEndpointsValid = ko.pureComputed(function () { return _this._sasUriEndpointsValidation().isValid; });
        _this.sasUriEndpointsErrorMessage = ko.pureComputed(function () {
            var shouldShowMessage = _this.isSasUriValid() && _this.isSasUriLabelValid() && !_this.isSasUriEndpointsValid();
            if (shouldShowMessage) {
                return _this._sasUriEndpointsValidation().errors[0].message;
            }
            else {
                return "";
            }
        });
        _this.isSasUriSectionValid = ko.pureComputed(function () {
            return _this.isSasUriValid() &&
                _this.isSasUriLabelValid() &&
                _this.isSasUriEndpointsValid();
        });
        _this.sasUriSectionErrorMessage = ko.pureComputed(function () { return _this.sasUriErrorMessage() || _this.sasUriLabelErrorMessage() || _this.sasUriEndpointsErrorMessage(); });
        _this._sasUriValidation = ko.pureComputed(function () {
            var sasUri = new SasUri_1.default(_this.sasUri());
            return SasUriValidator_1.default.validate(sasUri);
        });
        _this._sasUriLabelValidation = ko.observable(new ValidationResult_1.default());
        _this._sasUriEndpointsValidation = ko.observable(new ValidationResult_1.default());
        _this._isSasUriEndpointRequired = ko.pureComputed(function () {
            var sasUri = new SasUri_1.default(_this.sasUri());
            return !sasUri.isDefaultEndpoint();
        });
        _this.finishText("Connect");
        _this.isLastStep(false);
        _this._nextButtonEnabled(false);
        _this.canContinue = ko.computed(function () { return _this.isAttachable(); });
        _this.canContinue.subscribe(function (newValue) {
            _this._nextButtonEnabled(newValue);
        });
        _this.connectionString.subscribe(function (newValue) { return _this.autofillConnectionStringLabel(); });
        _this.connectionStringLabel.subscribe(function (newValue) { return _this.validateConnectionStringLabel(newValue); });
        _this.sasUri.subscribe(function (newValue) {
            _this.autofillSasUriLabel();
            _this.validateSasUriLabel(_this.sasUriLabel());
            _this.autofillSasUriEndpoints();
        });
        _this.sasUriLabel.subscribe(function (newValue) { return _this.validateSasUriLabel(newValue); });
        _this.sasUriBlobEndpoint.subscribe(function (newValue) { return _this.validateSasUriEndpoints(); });
        _this.sasUriFileEndpoint.subscribe(function (newValue) { return _this.validateSasUriEndpoints(); });
        _this.sasUriQueueEndpoint.subscribe(function (newValue) { return _this.validateSasUriEndpoints(); });
        _this.sasUriTableEndpoint.subscribe(function (newValue) { return _this.validateSasUriEndpoints(); });
        _this._isSasUriEndpointRequired.subscribe(function (newValue) { return _this.validateSasUriEndpoints(); });
        _this.connectionString(connectionString);
        _this.validateConnectionStringLabel(_this.connectionStringLabel());
        _this.validateSasUriLabel(_this.sasUriLabel());
        _this.validateSasUriEndpoints();
        return _this;
    }
    AddWithSasViewModel.prototype.show = function () {
        this.dialogViewModel.currentPanel(ConnectSteps_1.default.addWithSas);
        if (!this.selectedSection()) {
            this.selectedSection("connectionString");
        }
    };
    AddWithSasViewModel.prototype.onBack = function () {
        this.dialogViewModel.openConnectOptions();
    };
    AddWithSasViewModel.prototype.onNext = function () {
        if (this.isConnectionStringSectionEnabled()) {
            this.dialogViewModel.openSummary({ accountName: this.connectionStringLabel(), connectionString: this.connectionString(), source: "SAS" });
        }
        else if (this.isSasUriSectionEnabled()) {
            var sasUri = new SasUri_1.default(this.sasUri());
            if (sasUri.sasToken.isAccountToken()) {
                var values = {};
                values[ConnectionStringKey_1.default.sharedAccessSignature] = sasUri.sasToken.inputString;
                values[ConnectionStringKey_1.default.blobEndpoint] = sasUri.sasToken.hasServiceAccess("b") ? this.sasUriBlobEndpoint() : undefined;
                values[ConnectionStringKey_1.default.fileEndpoint] = sasUri.sasToken.hasServiceAccess("f") ? this.sasUriFileEndpoint() : undefined;
                values[ConnectionStringKey_1.default.queueEndpoint] = sasUri.sasToken.hasServiceAccess("q") ? this.sasUriQueueEndpoint() : undefined;
                values[ConnectionStringKey_1.default.tableEndpoint] = sasUri.sasToken.hasServiceAccess("t") ? this.sasUriTableEndpoint() : undefined;
                var connectionString = ConnectionString_1.default.createFromValues(values);
                this.dialogViewModel.openSummary({ accountName: this.sasUriLabel(), connectionString: connectionString, source: "SAS" });
            }
            else {
                this.dialogViewModel.openSummary({ sasUri: this.sasUri(), source: "SAS" });
            }
        }
    };
    AddWithSasViewModel.prototype.validateConnectionStringLabel = function (label) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = new ValidationResult_1.default();
                        if (!label) {
                            result.errors.push({
                                code: AccountNameValidationCode.MissingAccountName,
                                message: "A label for this connection is required."
                            });
                        }
                        return [4 /*yield*/, this.isAccountNameInUse(label)];
                    case 1:
                        if (_a.sent()) {
                            result.errors.push({
                                code: AccountNameValidationCode.DuplicateAccountName,
                                message: "An account connection with label '" + label + "' already exists. Detach the existing account or provide a different label."
                            });
                        }
                        this._connectionStringLabelValidation(result);
                        return [2 /*return*/];
                }
            });
        });
    };
    AddWithSasViewModel.prototype.validateSasUriLabel = function (label) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, sasUri;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = new ValidationResult_1.default();
                        sasUri = new SasUri_1.default(this.sasUri());
                        if (!sasUri.sasToken.isAccountToken()) return [3 /*break*/, 2];
                        if (!label) {
                            result.errors.push({
                                code: AccountNameValidationCode.MissingAccountName,
                                message: "A label for this connection is required."
                            });
                        }
                        return [4 /*yield*/, this.isAccountNameInUse(label)];
                    case 1:
                        if (_a.sent()) {
                            result.errors.push({
                                code: AccountNameValidationCode.DuplicateAccountName,
                                message: "An account connection with label '" + label + "' already exists. Detach the existing account or provide a different label."
                            });
                        }
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.isResourceNameInUse(label, sasUri.resourceType)];
                    case 3:
                        if (_a.sent()) {
                            result.errors.push({
                                code: SasUriValidationError_1.default.DuplicateResourceName,
                                message: "A service connection with label '" + label + "' already exists."
                            });
                        }
                        _a.label = 4;
                    case 4:
                        this._sasUriLabelValidation(result);
                        return [2 /*return*/];
                }
            });
        });
    };
    AddWithSasViewModel.prototype.validateSasUriEndpoints = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, sasUri, endpoints;
            return tslib_1.__generator(this, function (_a) {
                result = new ValidationResult_1.default();
                sasUri = new SasUri_1.default(this.sasUri());
                if (sasUri.sasToken.isAccountToken()) {
                    endpoints = [];
                    if (this.isSasUriBlobEndpointEnabled() && !!this.sasUriBlobEndpoint()) {
                        endpoints.push(this.sasUriBlobEndpoint());
                        if (!this.isEndpointValid(this.sasUriBlobEndpoint())) {
                            result.errors.push({ code: SasUriEndpointValidationCode.SasUriInvalidBlobEndpoint, message: "The blob endpoint is invalid." });
                        }
                    }
                    if (this.isSasUriFileEndpointEnabled() && !!this.sasUriFileEndpoint()) {
                        endpoints.push(this.sasUriFileEndpoint());
                        if (!this.isEndpointValid(this.sasUriFileEndpoint())) {
                            result.errors.push({ code: SasUriEndpointValidationCode.SasUriInvalidFileEndpoint, message: "The file endpoint is invalid." });
                        }
                    }
                    if (this.isSasUriQueueEndpointEnabled() && !!this.sasUriQueueEndpoint()) {
                        endpoints.push(this.sasUriQueueEndpoint());
                        if (!this.isEndpointValid(this.sasUriQueueEndpoint())) {
                            result.errors.push({ code: SasUriEndpointValidationCode.SasUriInvalidQueueEndpoint, message: "The queue endpoint is invalid." });
                        }
                    }
                    if (this.isSasUriTableEndpointEnabled() && !!this.sasUriTableEndpoint()) {
                        endpoints.push(this.sasUriTableEndpoint());
                        if (!this.isEndpointValid(this.sasUriTableEndpoint())) {
                            result.errors.push({ code: SasUriEndpointValidationCode.SasUriInvalidTableEndpoint, message: "The table endpoint is invalid." });
                        }
                    }
                    if (this._isSasUriEndpointRequired() && endpoints.length === 0) {
                        result.errors.push({
                            code: SasUriEndpointValidationCode.SasUriMissingEndpoint,
                            message: "Unable to infer service endpoints from account SAS URI. Please provide at least one endpoint."
                        });
                    }
                }
                this._sasUriEndpointsValidation(result);
                return [2 /*return*/];
            });
        });
    };
    AddWithSasViewModel.prototype.autofillConnectionStringLabel = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var label, parsedConnectionString, prefix, i;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        label = this.connectionStringLabel();
                        if (!!label) return [3 /*break*/, 4];
                        parsedConnectionString = new ConnectionString_1.default(this.connectionString());
                        label = parsedConnectionString.getAccountName();
                        prefix = label;
                        i = 1;
                        _a.label = 1;
                    case 1: return [4 /*yield*/, this.isAccountNameInUse(label)];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        label = prefix + "-" + i;
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.connectionStringLabel(label);
                        return [2 /*return*/];
                }
            });
        });
    };
    AddWithSasViewModel.prototype.autofillSasUriLabel = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var label, sasUri, prefix, i;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        label = this.sasUriLabel();
                        sasUri = new SasUri_1.default(this.sasUri());
                        if (!(!label && sasUri.sasToken.isAccountToken() && !!sasUri.accountName)) return [3 /*break*/, 5];
                        label = sasUri.accountName;
                        prefix = label;
                        i = 1;
                        _a.label = 1;
                    case 1: return [4 /*yield*/, this.isAccountNameInUse(label)];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        label = prefix + "-" + i;
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        if (sasUri.sasToken.isServiceToken() && sasUri.resourceName) {
                            label = sasUri.resourceName;
                        }
                        _a.label = 6;
                    case 6:
                        this.sasUriLabel(label);
                        return [2 /*return*/];
                }
            });
        });
    };
    AddWithSasViewModel.prototype.autofillSasUriEndpoints = function () {
        var sasUri = new SasUri_1.default(this.sasUri());
        if (sasUri.sasToken.isAccountToken() && sasUri.isDefaultEndpoint()) {
            if (!this.sasUriBlobEndpoint()) {
                this.sasUriBlobEndpoint(SasUri_1.default.getInferredDefaultEndpoint(sasUri, "blob", true).toString());
            }
            if (!this.sasUriFileEndpoint()) {
                this.sasUriFileEndpoint(SasUri_1.default.getInferredDefaultEndpoint(sasUri, "file", true).toString());
            }
            if (!this.sasUriQueueEndpoint()) {
                this.sasUriQueueEndpoint(SasUri_1.default.getInferredDefaultEndpoint(sasUri, "queue", true).toString());
            }
            if (!this.sasUriTableEndpoint()) {
                this.sasUriTableEndpoint(SasUri_1.default.getInferredDefaultEndpoint(sasUri, "table", true).toString());
            }
        }
    };
    AddWithSasViewModel.prototype.isAccountNameInUse = function (accountName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DialogOperationRouterProxy_1.default.executeOperation("PersistentStorage.Local.getItem", { key: "StorageExplorer_AddExternalStorageAccount_SessionKey_v1" })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, !!data && data.some(function (account) { return account.accountName === accountName; })];
                }
            });
        });
    };
    AddWithSasViewModel.prototype.isResourceNameInUse = function (resourceName, resourceType) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key, data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = SasResourceEndpoints_1.default.fromString(resourceType).localStorageKey;
                        return [4 /*yield*/, DialogOperationRouterProxy_1.default.executeOperation("PersistentStorage.Local.getItem", { key: key })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, !!data && data.some(function (resource) { return resource.resourceName === resourceName; })];
                }
            });
        });
    };
    AddWithSasViewModel.prototype.isEndpointValid = function (endpoint) {
        var parsedUri = url.parse(endpoint, true);
        return !!parsedUri.protocol &&
            !!parsedUri.hostname &&
            parsedUri.path === "/" &&
            Object.getOwnPropertyNames(parsedUri.query).length === 0;
    };
    return AddWithSasViewModel;
}(ConnectDialogPanelViewModel_1.default));
exports.default = AddWithSasViewModel;
