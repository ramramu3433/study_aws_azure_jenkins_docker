define(["require", "exports", "knockout", "../Constants", "../Utilities"], function (require, exports, ko, QueryBuilderConstants, Utilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QueryClauseViewModel = (function () {
        function QueryClauseViewModel(queryBuilderViewModel, and_or, field, type, operator, value, canAnd, timeValue, customTimeValue, timestampType, 
            //customLastTimestamp: CustomTimestampHelper.ILastQuery,
            isLocal, id) {
            var _this = this;
            this._queryBuilderViewModel = queryBuilderViewModel;
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
            //this.customLastTimestamp = ko.observable<CustomTimestampHelper.ILastQuery>(customLastTimestamp);
            //this.setCustomLastTimestamp();
            this.timestampType = ko.observable(timestampType);
            this.getValueType();
            this.isOperaterEditable = ko.pureComputed(function () { return ((_this.isValue()) || (_this.isCustomRangeTimestamp())); });
            this.isTypeEditable = ko.pureComputed(function () { return (_this.field() !== "Timestamp" && _this.field() !== "PartitionKey" && _this.field() !== "RowKey"); });
            this.and_or.subscribe(function (value) { _this._queryBuilderViewModel.checkIfClauseChanged(_this); });
            this.field.subscribe(function (value) { _this.changeField(); });
            this.type.subscribe(function (value) { _this.changeType(); });
            this.timeValue.subscribe(function (value) {
                // if (this.timeValue() === QueryBuilderConstants.timeOptions.custom) {
                //     this.customTimestampDialog();
                // }
            });
            this.customTimeValue.subscribe(function (value) { _this._queryBuilderViewModel.checkIfClauseChanged(_this); });
            this.value.subscribe(function (value) { _this._queryBuilderViewModel.checkIfClauseChanged(_this); });
            this.operator.subscribe(function (value) { _this._queryBuilderViewModel.checkIfClauseChanged(_this); });
            this._groupCheckSubscription = this.checkedForGrouping.subscribe(function (value) { _this._queryBuilderViewModel.updateCanGroupClauses(); });
            this.isAndOrFocused = ko.observable(false);
            this.isDeleteButtonFocused = ko.observable(false);
        }
        // private setCustomLastTimestamp() : void {
        //     if (this.customLastTimestamp() === null) {
        //         var lastNumberandType: CustomTimestampHelper.ILastQuery = {
        //             lastNumber: 7,
        //             lastTimeUnit: "Days"
        //     };
        //         this.customLastTimestamp(lastNumberandType);
        //     }
        // }
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
                this.type(QueryBuilderConstants.DisplayedEdmType.DateTime);
                this.operator(QueryBuilderConstants.Operator.GreaterThanOrEqualTo);
                this.timestampType("time");
            }
            else if (this.field() === "PartitionKey" || this.field() === "RowKey") {
                this.resetFromTimestamp();
                this.type(QueryBuilderConstants.DisplayedEdmType.String);
            }
            else {
                this.resetFromTimestamp();
                this.type(QueryBuilderConstants.DisplayedEdmType.String);
            }
            this._queryBuilderViewModel.checkIfClauseChanged(this);
        };
        QueryClauseViewModel.prototype.resetFromTimestamp = function () {
            this.isValue(true);
            this.isTimestamp(false);
            this.operator(QueryBuilderConstants.Operator.Equal);
            this.value("");
            this.timestampType("");
            this.timeValue("");
            this.customTimeValue("");
        };
        QueryClauseViewModel.prototype.changeType = function () {
            this.isCustomLastTimestamp(false);
            this.isCustomRangeTimestamp(false);
            if (this.type() === QueryBuilderConstants.DisplayedEdmType.DateTime) {
                this.isValue(false);
                this.isTimestamp(true);
                this.operator(QueryBuilderConstants.Operator.GreaterThanOrEqualTo);
                this.timestampType("time");
            }
            else {
                this.isValue(true);
                this.isTimestamp(false);
                this.timeValue("");
                this.operator(QueryBuilderConstants.Operator.EqualTo);
                this.value("");
                this.timestampType("");
                this.timeValue("");
                this.customTimeValue("");
            }
            this._queryBuilderViewModel.checkIfClauseChanged(this);
        };
        // private customTimestampDialog(): Promise<any> {
        //     var lastNumber = this.customLastTimestamp().lastNumber;
        //     var lastTimeUnit = this.customLastTimestamp().lastTimeUnit;
        //     return this._host.executeOperation("Environment.openDialog", [{
        //         id: AzureConstants.registeredDialogs.customTimestampQueryDialog,
        //         width: 500,
        //         height: 300,
        //         parameters: { lastNumber, lastTimeUnit }
        //     }]).then((timestamp: CustomTimestampHelper.ITimestampQuery) => {
        //         if (timestamp) {
        //             this.isValue(false);
        //             this.isTimestamp(false);
        //             this.timestampType(timestamp.queryType);
        //             if (timestamp.queryType === "last") {
        //                 this.isCustomLastTimestamp(true);
        //                 this.isCustomRangeTimestamp(false);
        //                 var lastNumberandType: CustomTimestampHelper.ILastQuery = {
        //                     lastNumber: timestamp.lastNumber,
        //                     lastTimeUnit: timestamp.lastTimeUnit
        //                 };
        //                 this.customLastTimestamp(lastNumberandType);
        //                 this.customTimeValue(`Last ${timestamp.lastNumber} ${timestamp.lastTimeUnit}`);
        //             } else {
        //                 if (timestamp.timeZone === "local") {
        //                     this.isLocal = ko.observable(true);
        //                 } else {
        //                     this.isLocal = ko.observable(false);
        //                 }
        //                 this.isCustomLastTimestamp(false);
        //                 this.isCustomRangeTimestamp(true);
        //                 this.customTimeValue(timestamp.startTime);
        //                 CustomTimestampHelper.addRangeTimestamp(timestamp, this._queryBuilderViewModel, this);
        //             }
        //         } else {
        //             this.timeValue(QueryBuilderConstants.timeOptions.lastHour);
        //         }
        //     });
        // }
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
    exports.default = QueryClauseViewModel;
});
