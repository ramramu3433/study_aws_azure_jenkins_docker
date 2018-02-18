/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*----------------------------------------------------------*/
define(["require", "exports", "knockout", "StorageExplorer/StorageExplorerConstants", "Providers/Common/AzureConstants", "StorageExplorer/Dialogs/CustomTimestampHelper", "../../../Common/Utilities"], function (require, exports, ko, StorageExplorerConstants, AzureConstants, CustomTimestampHelper, Utilities) {
    "use strict";
    var QueryClauseViewModel = (function () {
        function QueryClauseViewModel(queryBuilderViewModel, host, and_or, field, type, operator, value, canAnd, timeValue, customTimeValue, timestampType, customLastTimestamp, isLocal, id) {
            var _this = this;
            this._queryBuilderViewModel = queryBuilderViewModel;
            this._host = host;
            this.checkedForGrouping = ko.observable(false);
            this.isFirstInGroup = ko.observable(false);
            this.and_or = ko.observable(and_or);
            this.field = ko.observable(field);
            this.type = ko.observable(type);
            this.operator = ko.observable(operator);
            this.value = ko.observable(value);
            this.timeValue = ko.observable(timeValue);
            this.customTimeValue = ko.observable(customTimeValue);
            this.canAnd = ko.observable(canAnd);
            this.isLocal = ko.observable(isLocal);
            this._id = id ? id : Utilities.guid();
            this.customLastTimestamp = ko.observable(customLastTimestamp);
            this.setCustomLastTimestamp();
            this.timestampType = ko.observable(timestampType);
            this.getValueType();
            this.isOperaterEditable = ko.pureComputed(function () { return ((_this.isValue()) || (_this.isCustomRangeTimestamp())); });
            this.isTypeEditable = ko.pureComputed(function () { return (_this.field() !== "Timestamp" && _this.field() !== "PartitionKey" && _this.field() !== "RowKey"); });
            this.and_or.subscribe(function (value) { _this._queryBuilderViewModel.checkIfClauseChanged(_this); });
            this.field.subscribe(function (value) { _this.changeField(); });
            this.type.subscribe(function (value) { _this.changeType(); });
            this.timeValue.subscribe(function (value) {
                if (_this.timeValue() === StorageExplorerConstants.timeOptions.custom) {
                    _this.customTimestampDialog();
                }
            });
            this.customTimeValue.subscribe(function (value) { _this._queryBuilderViewModel.checkIfClauseChanged(_this); });
            this.value.subscribe(function (value) { _this._queryBuilderViewModel.checkIfClauseChanged(_this); });
            this.operator.subscribe(function (value) { _this._queryBuilderViewModel.checkIfClauseChanged(_this); });
            this._groupCheckSubscription = this.checkedForGrouping.subscribe(function (value) { _this._queryBuilderViewModel.updateCanGroupClauses(); });
            this.isAndOrFocused = ko.observable(false);
            this.isDeleteButtonFocused = ko.observable(false);
        }
        QueryClauseViewModel.prototype.setCustomLastTimestamp = function () {
            if (this.customLastTimestamp() === null) {
                var lastNumberandType = {
                    lastNumber: 7,
                    lastTimeUnit: "Days"
                };
                this.customLastTimestamp(lastNumberandType);
            }
        };
        QueryClauseViewModel.prototype.getValueType = function () {
            switch (this.timestampType()) {
                case "time":
                    this.isValue = ko.observable(false);
                    this.isTimestamp = ko.observable(true);
                    this.isCustomLastTimestamp = ko.observable(false);
                    this.isCustomRangeTimestamp = ko.observable(false);
                    break;
                case "last":
                    this.isValue = ko.observable(false);
                    this.isTimestamp = ko.observable(false);
                    this.isCustomLastTimestamp = ko.observable(true);
                    this.isCustomRangeTimestamp = ko.observable(false);
                    break;
                case "range":
                    this.isValue = ko.observable(false);
                    this.isTimestamp = ko.observable(false);
                    this.isCustomLastTimestamp = ko.observable(false);
                    this.isCustomRangeTimestamp = ko.observable(true);
                    break;
                default:
                    this.isValue = ko.observable(true);
                    this.isTimestamp = ko.observable(false);
                    this.isCustomLastTimestamp = ko.observable(false);
                    this.isCustomRangeTimestamp = ko.observable(false);
            }
        };
        QueryClauseViewModel.prototype.changeField = function () {
            this.isCustomLastTimestamp(false);
            this.isCustomRangeTimestamp(false);
            if (this.field() === "Timestamp") {
                this.isValue(false);
                this.isTimestamp(true);
                this.type(StorageExplorerConstants.DisplayedEdmType.DateTime);
                this.operator(StorageExplorerConstants.Operator.GreaterThanOrEqualTo);
                this.timestampType("time");
            }
            else if (this.field() === "PartitionKey" || this.field() === "RowKey") {
                this.resetFromTimestamp();
                this.type(StorageExplorerConstants.DisplayedEdmType.String);
            }
            else {
                this.resetFromTimestamp();
                this.type(StorageExplorerConstants.DisplayedEdmType.String);
            }
            this._queryBuilderViewModel.checkIfClauseChanged(this);
        };
        QueryClauseViewModel.prototype.resetFromTimestamp = function () {
            this.isValue(true);
            this.isTimestamp(false);
            this.operator(StorageExplorerConstants.Operator.Equal);
            this.value("");
            this.timestampType("");
            this.timeValue("");
            this.customTimeValue("");
        };
        QueryClauseViewModel.prototype.changeType = function () {
            this.isCustomLastTimestamp(false);
            this.isCustomRangeTimestamp(false);
            if (this.type() === StorageExplorerConstants.DisplayedEdmType.DateTime) {
                this.isValue(false);
                this.isTimestamp(true);
                this.operator(StorageExplorerConstants.Operator.GreaterThanOrEqualTo);
                this.timestampType("time");
            }
            else {
                this.isValue(true);
                this.isTimestamp(false);
                this.timeValue("");
                this.operator(StorageExplorerConstants.Operator.EqualTo);
                this.value("");
                this.timestampType("");
                this.timeValue("");
                this.customTimeValue("");
            }
            this._queryBuilderViewModel.checkIfClauseChanged(this);
        };
        QueryClauseViewModel.prototype.customTimestampDialog = function () {
            var _this = this;
            var lastNumber = this.customLastTimestamp().lastNumber;
            var lastTimeUnit = this.customLastTimestamp().lastTimeUnit;
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.customizeTimestamp,
                parameters: { lastNumber: lastNumber, lastTimeUnit: lastTimeUnit }
            }).then(function (timestamp) {
                if (timestamp) {
                    _this.isValue(false);
                    _this.isTimestamp(false);
                    _this.timestampType(timestamp.queryType);
                    if (timestamp.queryType === "last") {
                        _this.isCustomLastTimestamp(true);
                        _this.isCustomRangeTimestamp(false);
                        var lastNumberandType = {
                            lastNumber: timestamp.lastNumber,
                            lastTimeUnit: timestamp.lastTimeUnit
                        };
                        _this.customLastTimestamp(lastNumberandType);
                        _this.customTimeValue("Last " + timestamp.lastNumber + " " + timestamp.lastTimeUnit);
                    }
                    else {
                        if (timestamp.timeZone === "local") {
                            _this.isLocal = ko.observable(true);
                        }
                        else {
                            _this.isLocal = ko.observable(false);
                        }
                        _this.isCustomLastTimestamp(false);
                        _this.isCustomRangeTimestamp(true);
                        _this.customTimeValue(timestamp.startTime);
                        CustomTimestampHelper.addRangeTimestamp(timestamp, _this._queryBuilderViewModel, _this);
                    }
                }
                else {
                    _this.timeValue(StorageExplorerConstants.timeOptions.lastHour);
                }
            });
        };
        QueryClauseViewModel.prototype.getId = function () {
            return this._id;
        };
        Object.defineProperty(QueryClauseViewModel.prototype, "groupDepth", {
            get: function () {
                if (this.clauseGroup) {
                    return this.clauseGroup.getCurrentGroupDepth();
                }
                return -1;
            },
            enumerable: true,
            configurable: true
        });
        QueryClauseViewModel.prototype.dispose = function () {
            if (this._groupCheckSubscription) {
                this._groupCheckSubscription.dispose();
            }
            this.clauseGroup = null;
            this._queryBuilderViewModel = null;
        };
        return QueryClauseViewModel;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueryClauseViewModel;
});
