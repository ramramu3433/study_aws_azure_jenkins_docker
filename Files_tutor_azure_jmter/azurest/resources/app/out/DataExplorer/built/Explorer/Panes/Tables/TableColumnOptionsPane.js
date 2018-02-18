var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "knockout", "../../Tables/DataTable/DataTableOperations", "../ContextualPaneBase"], function (require, exports, ko, DataTableOperations, ContextualPaneBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TableColumnOptionsPane = (function (_super) {
        __extends(TableColumnOptionsPane, _super);
        function TableColumnOptionsPane(options) {
            var _this = _super.call(this, options) || this;
            _this.titleLabel = "Column Options";
            _this.instructionLabel = "Choose the columns and the order in which you want to display them in the table.";
            _this.availableColumnsLabel = "Available Columns";
            _this.moveUpLabel = "Move Up";
            _this.moveDownLabel = "Move Down";
            _this.noColumnSelectedWarning = "At least one column should be selected.";
            _this.selectedColumnOption = null;
            _this.handleClick = function (data, event) {
                _this.selectTargetItem($(event.currentTarget), data);
                return true;
            };
            _this.columnOptions = ko.observableArray();
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
            _this.allSelected = ko.pureComputed({
                read: function () {
                    return !_this.canSelectAll();
                },
                write: function (value) {
                    if (value) {
                        _this.selectAll();
                    }
                    else {
                        _this.clearAll();
                    }
                },
                owner: _this
            });
            return _this;
        }
        TableColumnOptionsPane.prototype.submit = function () {
            var _this = this;
            var newColumnSetting = this.getParameters();
            DataTableOperations.reorderColumns(this.tableViewModel.table, newColumnSetting.order).then(function () {
                DataTableOperations.filterColumns(_this.tableViewModel.table, newColumnSetting.visible);
                _this.visible(false);
            });
        };
        TableColumnOptionsPane.prototype.open = function () {
            this.setDisplayedColumns(this.parameters.columnNames, this.parameters.order, this.parameters.visible);
            _super.prototype.open.call(this);
        };
        TableColumnOptionsPane.prototype.getParameters = function () {
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
        TableColumnOptionsPane.prototype.setDisplayedColumns = function (columnNames, order, visible) {
            var options = order.map(function (value, index) {
                var columnOption = {
                    columnName: ko.observable(columnNames[index]),
                    order: value,
                    selected: ko.observable(visible[index]),
                    index: index
                };
                return columnOption;
            });
            this.columnOptions(options);
        };
        TableColumnOptionsPane.prototype.selectAll = function () {
            this.columnOptions().forEach(function (value) {
                value.selected(true);
            });
        };
        TableColumnOptionsPane.prototype.clearAll = function () {
            this.columnOptions().forEach(function (value) {
                value.selected(false);
            });
            this.columnOptions()[0].selected(true);
        };
        TableColumnOptionsPane.prototype.moveUp = function () {
            if (this.selectedColumnOption) {
                var currentSelectedIndex = this.selectedColumnOption.index;
                var swapTargetIndex = currentSelectedIndex - 1;
                //Debug.assert(currentSelectedIndex > 0);
                this.swapColumnOption(this.columnOptions(), swapTargetIndex, currentSelectedIndex);
                this.selectTargetItem($("div.column-options li:eq(" + swapTargetIndex + ")"), this.columnOptions()[swapTargetIndex]);
            }
        };
        TableColumnOptionsPane.prototype.moveDown = function () {
            if (this.selectedColumnOption) {
                var currentSelectedIndex = this.selectedColumnOption.index;
                var swapTargetIndex = currentSelectedIndex + 1;
                //Debug.assert(currentSelectedIndex < (this.columnOptions().length - 1));
                this.swapColumnOption(this.columnOptions(), swapTargetIndex, currentSelectedIndex);
                this.selectTargetItem($("div.column-options li:eq(" + swapTargetIndex + ")"), this.columnOptions()[swapTargetIndex]);
            }
        };
        TableColumnOptionsPane.prototype.selectTargetItem = function ($target, targetColumn) {
            this.selectedColumnOption = targetColumn;
            this.canMoveUp(targetColumn.index !== 0);
            this.canMoveDown(targetColumn.index !== (this.columnOptions().length - 1));
            $(".list-item.selected").removeClass("selected");
            $target.addClass("selected");
        };
        TableColumnOptionsPane.prototype.swapColumnOption = function (options, indexA, indexB) {
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
        return TableColumnOptionsPane;
    }(ContextualPaneBase_1.ContextualPaneBase));
    exports.TableColumnOptionsPane = TableColumnOptionsPane;
});
