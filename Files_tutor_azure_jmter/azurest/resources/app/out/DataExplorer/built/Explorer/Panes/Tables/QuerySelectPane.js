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
define(["require", "exports", "knockout", "../../Tables/Constants", "../ContextualPaneBase"], function (require, exports, ko, Constants, ContextualPaneBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QuerySelectPane = (function (_super) {
        __extends(QuerySelectPane, _super);
        function QuerySelectPane(options) {
            var _this = _super.call(this, options) || this;
            _this.titleLabel = "Select Columns";
            _this.instructionLabel = "Select the columns that you want to query.";
            _this.availableColumnsLabel = "Available Columns";
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
        QuerySelectPane.prototype.submit = function () {
            this.queryViewModel.selectText(this.getParameters());
            this.queryViewModel.getSelectMessage();
            this.close();
        };
        QuerySelectPane.prototype.open = function () {
            this.setTableColumns(this.queryViewModel.columnOptions());
            this.setDisplayedColumns(this.queryViewModel.selectText(), this.columnOptions());
            _super.prototype.open.call(this);
        };
        QuerySelectPane.prototype.getParameters = function () {
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
        QuerySelectPane.prototype.setTableColumns = function (columnNames) {
            var _this = this;
            var columns = columnNames.map(function (value) {
                var columnOption = {
                    columnName: ko.observable(value),
                    selected: ko.observable(true),
                    editable: ko.observable(_this.isEntitiyEditable(value))
                };
                return columnOption;
            });
            this.columnOptions(columns);
        };
        QuerySelectPane.prototype.setDisplayedColumns = function (querySelect, columns) {
            if (querySelect == null || _.isEmpty(querySelect)) {
                return;
            }
            this.setSelected(querySelect, columns);
        };
        QuerySelectPane.prototype.setSelected = function (querySelect, columns) {
            this.clearAll();
            querySelect.forEach(function (value) {
                for (var i = 0; i < columns.length; i++) {
                    if (value === columns[i].columnName()) {
                        columns[i].selected(true);
                    }
                }
            });
        };
        QuerySelectPane.prototype.availableColumnsCheckboxClick = function () {
            if (this.canSelectAll()) {
                return this.selectAll();
            }
            else {
                return this.clearAll();
            }
        };
        QuerySelectPane.prototype.selectAll = function () {
            this.columnOptions().forEach(function (value) {
                value.selected(true);
            });
            return true;
        };
        QuerySelectPane.prototype.clearAll = function () {
            this.columnOptions().forEach(function (value) {
                if (value.columnName() === Constants.EntityKeyNames.PartitionKey ||
                    value.columnName() === Constants.EntityKeyNames.RowKey ||
                    value.columnName() === Constants.EntityKeyNames.Timestamp) {
                    value.selected(true);
                }
                else {
                    value.selected(false);
                }
            });
            return true;
        };
        QuerySelectPane.prototype.selectTargetItem = function ($target, targetColumn) {
            this.selectedColumnOption = targetColumn;
            $(".list-item.selected").removeClass("selected");
            $target.addClass("selected");
        };
        QuerySelectPane.prototype.isEntitiyEditable = function (name) {
            return !(name === Constants.EntityKeyNames.PartitionKey ||
                name === Constants.EntityKeyNames.RowKey ||
                name === Constants.EntityKeyNames.Timestamp);
        };
        return QuerySelectPane;
    }(ContextualPaneBase_1.ContextualPaneBase));
    exports.QuerySelectPane = QuerySelectPane;
});
