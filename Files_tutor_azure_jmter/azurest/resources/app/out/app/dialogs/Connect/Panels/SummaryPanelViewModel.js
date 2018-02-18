"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ConnectionString_1 = require("../../../renderer/Components/AzureStorage/ConnectionString/Parsers/ConnectionString");
var ConnectionStringKey_1 = require("../../../renderer/Components/AzureStorage/ConnectionString/Parsers/ConnectionStringKey");
var ConnectSteps_1 = require("./../ConnectSteps");
var SasToken_1 = require("../../../renderer/Components/AzureStorage/Sas/Parsers/SasToken");
var WizardPanelViewModel_1 = require("../../Common/WizardPanelViewModel");
var ko = require("knockout");
var SummaryPanelViewModel = (function (_super) {
    tslib_1.__extends(SummaryPanelViewModel, _super);
    function SummaryPanelViewModel(dialogViewModel) {
        var _this = _super.call(this, dialogViewModel) || this;
        // Localize
        _this._labels = {
            AccountName: "Account name:",
            SharedAccessSignature: "SAS:",
            AccountKey: "Account key:",
            UseDevelopmentStorage: "Development:",
            DefaultEndpointsProtocol: "Default endpoints protocol:",
            EndpointSuffix: "Endpoint suffix:",
            BlobEndpoint: "Blob endpoint:",
            FileEndpoint: "File endpoint:",
            QueueEndpoint: "Queue endpoint:",
            TableEndpoint: "Table endpint:"
        };
        _this._SASlabels = {
            displayExpiration: "Expiration date:",
            displayPermission: "Permissions:"
        };
        _this.securityNote = ko.observable("Make sure you only connect to resources you trust."); // Localize
        _this.isFirstStep(false);
        _this.isLastStep(true);
        _this.canContinue(true);
        _this.values = ko.observableArray([]);
        // Localize
        _this.title("Connection Summary");
        _this.finishText("Connect");
        return _this;
    }
    SummaryPanelViewModel.prototype.onBack = function () {
        if (this._backDestination === "SAS") {
            this.dialogViewModel.openAddWithSas();
        }
        else if (this._backDestination === "Key") {
            this.dialogViewModel.openAddWithKey();
        }
        else {
            this.dialogViewModel.openConnectOptions();
        }
    };
    SummaryPanelViewModel.prototype.show = function (args) {
        this._backDestination = args.source;
        if (args.connectionString) {
            this._connectionString = args.connectionString;
            this._parsedConnectionString = new ConnectionString_1.default(this._connectionString);
        }
        else {
            this._sasUri = args.sasUri;
            this._parsedConnectionString = new ConnectionString_1.default(ConnectionString_1.default.createFromSASUri(this._sasUri));
        }
        this._accountName = args.accountName || this._parsedConnectionString.getAccountName();
        this._defaultEndpointsProtocol = this._parsedConnectionString.getDefaultEndpointsProtocol();
        var valuesToShow = [];
        var values = this._parsedConnectionString.getValues();
        for (var labelKey in this._labels) {
            var value = (labelKey === ConnectionStringKey_1.default.accountName) ?
                this._accountName :
                values[labelKey];
            if (value) {
                valuesToShow.push({
                    label: this._labels[labelKey],
                    value: value
                });
            }
            if (labelKey === ConnectionStringKey_1.default.sharedAccessSignature) {
                this._sas = new SasToken_1.default(value);
                for (var labelKey_1 in this._SASlabels) {
                    var value_1 = this._sas[labelKey_1];
                    if (value_1) {
                        valuesToShow.push({
                            label: this._SASlabels[labelKey_1],
                            value: value_1
                        });
                    }
                }
            }
        }
        this.values(valuesToShow);
        this.dialogViewModel.currentPanel(ConnectSteps_1.default.summary);
    };
    SummaryPanelViewModel.prototype.onFinish = function () {
        var result = {
            connectionString: this._connectionString
        };
        if (this._sasUri) {
            result.sasUri = this._sasUri;
            result.connectionType = 4 /* sasAttachedService */;
        }
        else if (this._accountName) {
            result.accountName = this._accountName;
            result.connectionType = this._parsedConnectionString.containsSAS() ?
                1 /* sasAttachedAccount */ :
                3 /* key */;
        }
        this.dialogViewModel.dialogResult(result);
    };
    return SummaryPanelViewModel;
}(WizardPanelViewModel_1.default));
exports.default = SummaryPanelViewModel;
