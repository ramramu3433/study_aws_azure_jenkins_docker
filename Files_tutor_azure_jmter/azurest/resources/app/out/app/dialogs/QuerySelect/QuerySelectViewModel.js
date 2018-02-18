"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var TableEntitySystemKey_1 = require("../EntityEditor/TableEntitySystemKey");
var $ = require("jquery");
var _ = require("underscore");
var ko = require("knockout");
/**
 * TODO: [cralvord] Merge with Customize Columns dialog.
 */
var QuerySelectViewModel = (function (_super) {
    tslib_1.__extends(QuerySelectViewModel, _super);
    function QuerySelectViewModel(parameters) {
        var _this = _super.call(this) || this;
        _this.titleLabel = "Select Columns";
        _this.instructionLabel = "Select the columns that you want to query.";
        _this.availableColumnsLabel = "Available Columns";
        _this.selectAllLabel = "Select All";
        _this.clearAllLabel = "Clear All";
        _this.noColumnSelectedWarning = "At least one column should be selected.";
        _this.selectedColumnOption = null;
        _this.handleClick = function (data, event) {
            console.assert(!!data);
            _this.selectTargetItem($(event.currentTarget), data);
            return true;
        };
        _this.setTableColumns(parameters.columnNames);
        _this.setDisplayedColumns(parameters.querySelect, _this.columnOptions());
        _this.anyColumnSelected = ko.computed(function () {
            return _.some(_this.columnOptions(), function (value) {
                return value.selected();
            });
        });
        _this.canSelectAll = ko.computed(function () {
            return _.some(_this.columnOptions(), function (value) {
                return !value.selected();
            });
        });
        _this.addAcceptButton(DialogViewModel_1.default.okCaption, _this.anyColumnSelected);
        _this.addCancelButton();
        return _this;
    }
    /**
     * @override
     */
    QuerySelectViewModel.prototype.getResults = function () {
        if (this.canSelectAll() === false) {
            return [];
        }
        var selectedColumns = this.columnOptions().filter(function (value) { return value.selected() === true; });
        var columns = selectedColumns.map(function (value) {
            var name = value.columnName();
            return name;
        });
        return columns;
    };
    ;
    QuerySelectViewModel.prototype.setTableColumns = function (columnNames) {
        var _this = this;
        var columns = columnNames.map(function (value) {
            var columnOption = {
                columnName: ko.observable(value),
                selected: ko.observable(true),
                editable: ko.observable(_this.isEntitiyEditable(value))
            };
            return columnOption;
        });
        this.columnOptions = ko.observableArray(columns);
    };
    QuerySelectViewModel.prototype.setDisplayedColumns = function (querySelect, columns) {
        if (querySelect == null || _.isEmpty(querySelect)) {
            return;
        }
        this.setSelected(querySelect, columns);
    };
    QuerySelectViewModel.prototype.setSelected = function (querySelect, columns) {
        this.clearAll();
        querySelect.forEach(function (value) {
            for (var i = 0; i < columns.length; i++) {
                if (value === columns[i].columnName()) {
                    columns[i].selected(true);
                }
            }
        });
    };
    QuerySelectViewModel.prototype.selectAll = function () {
        this.columnOptions().forEach(function (value) {
            value.selected(true);
        });
    };
    QuerySelectViewModel.prototype.clearAll = function () {
        this.columnOptions().forEach(function (value) {
            if (value.columnName() === TableEntitySystemKey_1.default.PartitionKey ||
                value.columnName() === TableEntitySystemKey_1.default.RowKey) {
                value.selected(true);
            }
            else {
                value.selected(false);
            }
        });
    };
    QuerySelectViewModel.prototype.selectTargetItem = function ($target, targetColumn) {
        this.selectedColumnOption = targetColumn;
        $(".list-item.selected").removeClass("selected");
        $target.addClass("selected");
    };
    QuerySelectViewModel.prototype.isEntitiyEditable = function (name) {
        return !(name === TableEntitySystemKey_1.default.PartitionKey ||
            name === TableEntitySystemKey_1.default.RowKey);
    };
    return QuerySelectViewModel;
}(DialogViewModel_1.default));
exports.default = QuerySelectViewModel;
