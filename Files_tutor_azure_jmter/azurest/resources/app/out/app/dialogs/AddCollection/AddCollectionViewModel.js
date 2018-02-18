"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var ko = require("knockout");
var storageCapacity = {
    fixed: "fixed",
    ulimited: "unlimited"
};
/**
 * View model for the add collection dialog.
 */
var AddCollectionViewModel = (function (_super) {
    tslib_1.__extends(AddCollectionViewModel, _super);
    function AddCollectionViewModel(params) {
        var _this = _super.call(this) || this;
        _this.titleLabel = "Create Collection"; // Localize
        _this.databaseIdLabel = "Database ID"; // Localize
        _this.collectionIdLabel = "Collection ID"; // Localize
        _this.storageCapacityLabel = "Storage capacity"; // Localize
        _this.fixedLabel = "Fixed(10 GB)"; // Localize
        _this.unlimitedLabel = "Unlimited"; // Localize
        _this.throughputLabel = ko.observable("Throughput (400 - 10,000 RU/s)"); // Localize
        _this.throughputStep = ko.observable(100);
        _this.partitionKeyLabel = "Partition key (optional)"; // Localize
        _this.collectionIdPlaceHolder = "e.g., Collecion1"; // Localize
        _this.partitionKeyPlaceHolder = "e.g., /address/zipCode"; // Localize
        _this.databaseId = params.databaseId;
        _this.collectionId = ko.observable();
        _this.storageCapacityOptions = ko.observable(storageCapacity.fixed);
        _this.throughput = ko.observable(400);
        _this.partitionKey = ko.observable();
        _this.isInvalidCollectionId = ko.observable(true);
        _this.isInvalidThroughput = ko.observable(false);
        _this.isInvalidPartitionKey = ko.observable(false);
        _this.isEnabled = ko.observable(false);
        _this.collecionIdTooltip = ko.observable("Please input the collection id.");
        _this.throughputTooltip = ko.observable("");
        _this.partitionKeyTooltip = ko.observable("");
        _this.storageCapacityOptions.subscribe(function (value) {
            if (_this.storageCapacityOptions() === storageCapacity.ulimited) {
                _this.throughputLabel("Throughput (2500 - 100,000 RU/s)");
                _this.throughput(10000);
            }
            else {
                _this.throughputLabel("Throughput (400 - 10,000 RU/s)");
                _this.throughput(400);
            }
        }); // Localize
        _this.collectionId.subscribe(function (value) {
            var result = _this._validateCollectionId(value);
            _this.isInvalidCollectionId(!result.isValid);
            _this.collecionIdTooltip(result.errorMsg);
            _this._updateAcceptButton();
        });
        _this.throughput.subscribe(function (value) {
            var result = _this._validateThroughput(value);
            _this.isInvalidThroughput(!result.isValid);
            _this.throughputTooltip(result.errorMsg);
            _this._updateAcceptButton();
        });
        _this.partitionKey.subscribe(function (value) {
            var result = _this._validatePartitionKey(value);
            _this.isInvalidPartitionKey(!result.isValid);
            _this.partitionKeyTooltip(result.errorMsg);
            _this._updateAcceptButton();
        });
        _this.addAcceptButton(DialogViewModel_1.default.okCaption, _this.isEnabled);
        _this.addCancelButton();
        return _this;
    }
    AddCollectionViewModel.prototype.getResults = function () {
        if (!!this.partitionKey()) {
            return {
                collectionId: this.collectionId().trim(),
                offerThroughput: this.throughput(),
                partitionKeyKind: "Hash",
                partitionKeyPath: [this.partitionKey().trim()]
            };
        }
        else {
            return {
                collectionId: this.collectionId().trim(),
                offerThroughput: this.throughput()
            };
        }
    };
    AddCollectionViewModel.prototype._validateCollectionId = function (value) {
        var hint = "May not contain characters '\\' '/' '#' '?'. The name should be between 3 and 63 characters long."; // Localize
        var isValid = /^[^\/\?#\\]{3,63}$/.test(value);
        var errMsg = isValid ? "" : hint;
        return { isValid: isValid, errorMsg: errMsg };
    };
    // TODO validate partition key
    AddCollectionViewModel.prototype._validatePartitionKey = function (value) {
        var hint = ""; // Localize
        var isValid = true;
        var errMsg = isValid ? "" : hint;
        return { isValid: isValid, errorMsg: errMsg };
    };
    // TODO validate throughput depends on rupm
    AddCollectionViewModel.prototype._validateThroughput = function (value) {
        var hint = "Throughput number is out of range."; // Localize
        var isValid = true;
        if (this.storageCapacityOptions() === storageCapacity.ulimited) {
            isValid = value >= 2500 && value <= 1e5;
        }
        else {
            isValid = value >= 400 && value <= 1e4;
        }
        var errMsg = isValid ? "" : hint;
        return { isValid: isValid, errorMsg: errMsg };
    };
    AddCollectionViewModel.prototype._updateAcceptButton = function () {
        this.isEnabled(!this.isInvalidPartitionKey() &&
            !this.isInvalidCollectionId() &&
            !this.isInvalidThroughput());
    };
    return AddCollectionViewModel;
}(DialogViewModel_1.default));
exports.default = AddCollectionViewModel;
