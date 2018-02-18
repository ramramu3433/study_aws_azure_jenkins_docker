define(["require", "exports", "../Constants", "./TableCommands"], function (require, exports, Constants, TableCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /*
     * ContextMenu view representation
     */
    var DataTableContextMenu = (function () {
        function DataTableContextMenu(viewModel, tableCommands) {
            var _this = this;
            this.headerContextMenuSelect = function (key, options) {
                var promise = null;
                switch (key) {
                    case TableCommands_1.default.customizeColumnsCommand:
                        promise = _this._tableCommands.customizeColumnsCommand(_this.viewModel);
                        break;
                    case TableCommands_1.default.resetColumnsCommand:
                        promise = Promise.resolve(_this._tableCommands.resetColumns(_this.viewModel));
                        break;
                    default:
                        break;
                }
                if (promise) {
                    promise.then(function () {
                        _this.viewModel.focusDataTable();
                    });
                }
            };
            this.bodyContextMenuSelect = function (key, options) {
                var promise = null;
                switch (key) {
                    case TableCommands_1.default.editEntityCommand:
                        promise = _this._tableCommands.editEntityCommand(_this.viewModel);
                        break;
                    case TableCommands_1.default.deleteEntitiesCommand:
                        promise = _this._tableCommands.deleteEntitiesCommand(_this.viewModel);
                        break;
                    case TableCommands_1.default.reorderColumnsCommand:
                        promise = _this._tableCommands.reorderColumnsBasedOnSelectedEntities(_this.viewModel);
                        break;
                    case TableCommands_1.default.resetColumnsCommand:
                        promise = Promise.resolve(_this._tableCommands.resetColumns(_this.viewModel));
                        break;
                    default:
                        break;
                }
                if (promise) {
                    promise.then(function () {
                        _this.viewModel.focusDataTable();
                    });
                }
            };
            this.viewModel = viewModel;
            this._tableCommands = tableCommands;
            this.registerTableBodyContextMenu();
            this.registerTableHeaderContextMenu();
            DataTableContextMenu.Instance[viewModel.queryTablesTab.tabId] = { contextMenu: this };
        }
        DataTableContextMenu.prototype.unregisterContextMenu = function (selector) {
            $.contextMenu("destroy", "div#" + this.viewModel.queryTablesTab.tabId + ".tab-pane " + selector);
        };
        DataTableContextMenu.prototype.registerTableBodyContextMenu = function () {
            var _this = this;
            // Localize
            $.contextMenu({
                selector: "div#" + this.viewModel.queryTablesTab.tabId + ".tab-pane " + Constants.htmlSelectors.dataTableBodyRowSelector,
                callback: this.bodyContextMenuSelect,
                items: {
                    "edit": {
                        name: "Edit",
                        cmd: TableCommands_1.default.editEntityCommand,
                        icon: "edit-entity",
                        disabled: function () { return !_this.isEnabled(TableCommands_1.default.editEntityCommand); }
                    },
                    "delete": {
                        name: "Delete",
                        cmd: TableCommands_1.default.deleteEntitiesCommand,
                        icon: "delete-entity",
                        disabled: function () { return !_this.isEnabled(TableCommands_1.default.deleteEntitiesCommand); }
                    },
                    "reorder": {
                        name: "Reorder Columns Based on Schema",
                        cmd: TableCommands_1.default.reorderColumnsCommand,
                        icon: "shift-non-empty-columns-left",
                        disabled: function () { return !_this.isEnabled(TableCommands_1.default.reorderColumnsCommand); }
                    },
                    "reset": {
                        name: "Reset Columns",
                        cmd: TableCommands_1.default.resetColumnsCommand,
                        icon: "reset-column-order"
                    }
                }
            });
        };
        DataTableContextMenu.prototype.registerTableHeaderContextMenu = function () {
            // Localize
            $.contextMenu({
                selector: "div#" + this.viewModel.queryTablesTab.tabId + ".tab-pane " + Constants.htmlSelectors.dataTableHeadRowSelector,
                callback: this.headerContextMenuSelect,
                items: {
                    "customizeColumns": {
                        name: "Column Options",
                        cmd: TableCommands_1.default.customizeColumnsCommand,
                        icon: "customize-columns"
                    },
                    "reset": {
                        name: "Reset Columns",
                        cmd: TableCommands_1.default.resetColumnsCommand,
                        icon: "reset-column-order"
                    }
                }
            });
        };
        DataTableContextMenu.prototype.isEnabled = function (commandName) {
            return this._tableCommands.isEnabled(commandName, this.viewModel.selected());
        };
        /**
         * A context menu factory to construct the one context menu for each tab/table view model.
         */
        DataTableContextMenu.contextMenuFactory = function (viewModel, tableCommands) {
            if (!DataTableContextMenu.Instance[viewModel.queryTablesTab.tabId]) {
                DataTableContextMenu.Instance[viewModel.queryTablesTab.tabId] = { contextMenu: new DataTableContextMenu(viewModel, tableCommands) };
            }
        };
        return DataTableContextMenu;
    }());
    // There is one context menu for each selector on each tab and they should all be registered here.
    // Once the context menus are registered, we should access them through this instance.
    DataTableContextMenu.Instance = {};
    exports.default = DataTableContextMenu;
});
