"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var ko = require("knockout");
var CosmosDBConnectionString_1 = require("./CosmosDBConnectionString");
/**
 * View model for the add CosmosDB account dialog.
 */
var AddCosmosDBAccountViewModel = (function (_super) {
    tslib_1.__extends(AddCosmosDBAccountViewModel, _super);
    function AddCosmosDBAccountViewModel(params) {
        var _this = _super.call(this) || this;
        _this.defaultExperienceLabel = "Select API"; // Localize
        _this.connectionStringLabel = "Connection string"; // Localize
        _this.connectionStringPlaceHolder = "Please input connection string."; // Localize
        _this.supportExperiences = [
            { display: "DocumentDB", value: "DocumentDB" },
            { display: "Table", value: "Table" },
            { display: "Graph", value: "Graph" },
            { display: "MongoDB", value: "MongoDB" }
        ];
        _this.defaultExperience = ko.observable(_this.supportExperiences[0]);
        _this.connectionString = ko.observable("");
        _this.isInvalidConnectionString = ko.observable(true);
        _this.isEnabled = ko.observable(false);
        _this.connectionStringTooltip = ko.observable("Please input connection string.");
        _this.connectionString.subscribe(function (value) {
            var result = _this._validateConnectionString(value);
            _this.isInvalidConnectionString(!result.isValid);
            _this.connectionStringTooltip(result.errorMsg);
            _this._updateAcceptButton();
        });
        _this.addAcceptButton(DialogViewModel_1.default.okCaption, _this.isEnabled);
        _this.addCancelButton();
        return _this;
    }
    AddCosmosDBAccountViewModel.prototype.getResults = function () {
        var connectionString = new CosmosDBConnectionString_1.default(this.defaultExperience().value, this.connectionString());
        return {
            accountEndpoint: connectionString.accountEndpoint,
            accountKey: connectionString.accountKey,
            defaultExperience: this.defaultExperience().value,
            accountName: this._getAcountNameFromEndpoint(connectionString.accountEndpoint)
        };
    };
    AddCosmosDBAccountViewModel.prototype._validateConnectionString = function (value) {
        var isValid = value.length > 0;
        var errorMsg = isValid ? "" : "Connecting string is empty."; // Localize
        return {
            isValid: isValid,
            errorMsg: errorMsg
        };
    };
    AddCosmosDBAccountViewModel.prototype._updateAcceptButton = function () {
        this.isEnabled(!this.isInvalidConnectionString());
    };
    AddCosmosDBAccountViewModel.prototype._getAcountNameFromEndpoint = function (endpoint) {
        var endpointPhases = endpoint.match(/https:\/\/(.*).documents.azure.com/);
        return endpointPhases.length < 2 ? "" : endpointPhases[1];
    };
    ;
    return AddCosmosDBAccountViewModel;
}(DialogViewModel_1.default));
exports.default = AddCosmosDBAccountViewModel;
