"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var $ = require("jquery");
var _ = require("underscore");
var ko = require("knockout");
/**
 * View model for set container access level dialog
 */
var CustomizeColumnsViewModel = (function (_super) {
    tslib_1.__extends(CustomizeColumnsViewModel, _super);
    function CustomizeColumnsViewModel(parameters) {
        var _this = _super.call(this) || this;
        // localize
        _this.titleLabel = "Column Options";
        _this.instructionLabel = "Choose the columns and the order in which you want to display them in the table.";
        _this.availableColumnsLabel = "Available Columns";
        _this.selectAllLabel = "Select All";
        _this.clearAllLabel = "Clear All";
        _this.moveUpLabel = "Move Up";
        _this.moveDownLabel = "Move Down";
        _this.noColumnSelectedWarning = "At least one column should be selected.";
        _this.selectedColumnOption = null;
        _this.handleClick = function (data, event) {
            console.assert(!!data);
            _this.selectTargetItem($(event.currentTarget), data);
            return true;
        };
        // We need to make sure the passed in column setting is valid and has same length among its properties.
        console.assert(function () { return !!parameters.columnNames &&
            !!parameters.order &&
            !!parameters.visible &&
            parameters.columnNames.length > 0 &&
            parameters.order.length === parameters.columnNames.length &&
            parameters.visible.length === parameters.order.length; });
        _this.setDisplayedColumns(parameters.columnNames, parameters.order, parameters.visible);
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
        _this.canMoveUp = ko.observable(false);
        _this.canMoveDown = ko.observable(false);
        _this.addAcceptButton(DialogViewModel_1.default.okCaption, _this.anyColumnSelected);
        _this.addCancelButton();
        return _this;
    }
    CustomizeColumnsViewModel.prototype.getResults = function () {
        var newColumnSettings = {
            columnNames: [],
            order: [],
            visible: []
        };
        this.columnOptions().map(function (value) {
            newColumnSettings.columnNames.push(value.columnName());
            newColumnSettings.order.push(value.order);
            newColumnSettings.visible.push(value.selected());
        });
        return newColumnSettings;
    };
    ;
    CustomizeColumnsViewModel.prototype.setDisplayedColumns = function (columnNames, order, visible) {
        var options = order.map(function (value, index) {
            var columnOption = {
                columnName: ko.observable(columnNames[index]),
                order: value,
                selected: ko.observable(visible[index]),
                index: index
            };
            return columnOption;
        });
        this.columnOptions = ko.observableArray(options);
    };
    CustomizeColumnsViewModel.prototype.selectAll = function () {
        this.columnOptions().forEach(function (value) {
            value.selected(true);
        });
    };
    CustomizeColumnsViewModel.prototype.clearAll = function () {
        this.columnOptions().forEach(function (value) {
            value.selected(false);
        });
        this.columnOptions()[0].selected(true);
    };
    CustomizeColumnsViewModel.prototype.moveUp = function () {
        if (this.selectedColumnOption) {
            var currentSelectedIndex = this.selectedColumnOption.index;
            var swapTargetIndex = currentSelectedIndex - 1;
            console.assert(currentSelectedIndex > 0);
            this.swapColumnOption(this.columnOptions(), swapTargetIndex, currentSelectedIndex);
            this.selectTargetItem($("li:eq(" + swapTargetIndex + ")"), this.columnOptions()[swapTargetIndex]);
        }
    };
    CustomizeColumnsViewModel.prototype.moveDown = function () {
        if (this.selectedColumnOption) {
            var currentSelectedIndex = this.selectedColumnOption.index;
            var swapTargetIndex = currentSelectedIndex + 1;
            console.assert(currentSelectedIndex < (this.columnOptions().length - 1));
            this.swapColumnOption(this.columnOptions(), swapTargetIndex, currentSelectedIndex);
            this.selectTargetItem($("li:eq(" + swapTargetIndex + ")"), this.columnOptions()[swapTargetIndex]);
        }
    };
    CustomizeColumnsViewModel.prototype.selectTargetItem = function ($target, targetColumn) {
        this.selectedColumnOption = targetColumn;
        this.canMoveUp(targetColumn.index !== 0);
        this.canMoveDown(targetColumn.index !== (this.columnOptions().length - 1));
        $(".list-item.selected").removeClass("selected");
        $target.addClass("selected");
    };
    CustomizeColumnsViewModel.prototype.swapColumnOption = function (options, indexA, indexB) {
        var tempColumnName = options[indexA].columnName();
        var tempSelected = options[indexA].selected();
        var tempOrder = options[indexA].order;
        options[indexA].columnName(options[indexB].columnName());
        options[indexB].columnName(tempColumnName);
        options[indexA].selected(options[indexB].selected());
        options[indexB].selected(tempSelected);
        options[indexA].order = options[indexB].order;
        options[indexB].order = tempOrder;
    };
    return CustomizeColumnsViewModel;
}(DialogViewModel_1.default));
exports.default = CustomizeColumnsViewModel;
