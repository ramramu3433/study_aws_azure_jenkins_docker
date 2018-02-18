/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "StorageExplorer/Common/BaseDataTableOperationManager", "StorageExplorer/Common/DataTableOperations", "StorageExplorer/KeyCodes", "StorageExplorer/StorageExplorerConstants", "Common/Utilities"], function (require, exports, ko, BaseDataTableOperationManager_1, DataTableOperations, KeyCodes_1, StorageExplorerConstants, Utilities) {
    "use strict";
    /*
     * Base class for data table row selection.
     */
    var DataTableOperationManager = (function (_super) {
        __extends(DataTableOperationManager, _super);
        function DataTableOperationManager(table, viewModel, tableCommands, telemetry) {
            var _this = _super.call(this, table) || this;
            _this.click = function (event) {
                var elem = $(event.currentTarget);
                _this.updateLastSelectedItem(elem, event.shiftKey);
                if (Utilities.isEnvironmentCtrlPressed(event)) {
                    _this.applyCtrlSelection(elem);
                }
                else if (event.shiftKey) {
                    _this.applyShiftSelection(elem);
                }
                else {
                    _this.applySingleSelection(elem);
                }
            };
            _this.doubleClick = function (event) {
                _this._telemetry.sendEvent("StorageExplorer.Table.OnDoubleClick", { Action: "editEntity" });
                _this.tryOpenEditor();
            };
            _this.contextMenu = function (event) {
                if (event.which === 3) {
                    var elem = $(event.currentTarget);
                    _this.updateLastSelectedItem(elem, event.shiftKey);
                    _this.applyContextMenuSelection(elem);
                    setTimeout(function () {
                        $(".context-menu-list").attr("tabindex", -1).focus();
                    }, 0);
                }
            };
            _this.keyDown = function (event) {
                var isUpArrowKey = (!event.altKey && event.keyCode === KeyCodes_1.default.UpArrow), isDownArrowKey = (!event.altKey && event.keyCode === KeyCodes_1.default.DownArrow), handled = false;
                if (isUpArrowKey || isDownArrowKey) {
                    var lastSelectedItem = _this._tableEntityListViewModel.lastSelectedItem;
                    var dataTableRows = $(StorageExplorerConstants.htmlSelectors.dataTableAllRowsSelector);
                    var maximumIndex = dataTableRows.length - 1;
                    // If can't find an index for lastSelectedItem, then either no item is previously selected or it goes across page.
                    // Simply select the first item in this case.
                    var lastSelectedItemIndex = lastSelectedItem
                        ? _this._tableEntityListViewModel.getItemIndexFromCurrentPage(_this._tableEntityListViewModel.getTableEntityKeys(lastSelectedItem.PartitionKey._, lastSelectedItem.RowKey._))
                        : -1;
                    var nextIndex = (isUpArrowKey) ? lastSelectedItemIndex - 1 : lastSelectedItemIndex + 1;
                    var safeIndex = Utilities.ensureBetweenBounds(nextIndex, 0, maximumIndex);
                    var selectedRowElement = dataTableRows.eq(safeIndex);
                    if (selectedRowElement) {
                        if (event.shiftKey) {
                            _this.applyShiftSelection(selectedRowElement);
                        }
                        else {
                            _this.applySingleSelection(selectedRowElement);
                        }
                        _this.updateLastSelectedItem(selectedRowElement, event.shiftKey);
                        handled = true;
                        DataTableOperations.scrollToRowIfNeeded(dataTableRows, safeIndex, isUpArrowKey);
                    }
                }
                else if (Utilities.isEnvironmentCtrlPressed(event) && !Utilities.isEnvironmentShiftPressed(event) &&
                    !Utilities.isEnvironmentAltPressed(event) && event.keyCode === KeyCodes_1.default.A) {
                    _this.applySelectAll();
                    handled = true;
                }
                return !handled;
            };
            // Note: There is one key up event each time a key is pressed;
            // in contrast, there may be more than one key down and key
            // pressed events.
            _this.keyUp = function (event) {
                var handled = false;
                if (_this._keyDownTarget === event.target) {
                    switch (event.keyCode) {
                        case KeyCodes_1.default.Enter:
                            handled = _this.tryOpenEditor();
                            if (handled) {
                                _this._telemetry.sendEvent("StorageExplorer.Table.OnEnterKeyUp", { Action: "editEntity" });
                            }
                            break;
                        case KeyCodes_1.default.Delete:
                            handled = _this.tryHandleDeleteSelected();
                            if (handled) {
                                _this._telemetry.sendEvent("StorageExplorer.Table.OnDeleteKeyUp", { Action: "deleteEntities" });
                            }
                            break;
                    }
                }
                return !handled;
            };
            _this.itemDropped = function (event) {
                var handled = false;
                var items = event.originalEvent.dataTransfer.items;
                if (!items) {
                    // On browsers outside of Chromium
                    // we can't discern between dirs and files
                    // so we will disable drag & drop for now
                    return;
                }
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var entry = item.webkitGetAsEntry();
                    if (entry.isFile) {
                    }
                }
                return !handled;
            };
            _this._tableEntityListViewModel = viewModel;
            _this._tableCommands = tableCommands;
            _this._telemetry = telemetry;
            _this.bind();
            _this._tableEntityListViewModel.bind(_this);
            return _this;
        }
        DataTableOperationManager.prototype.tryOpenEditor = function () {
            return this._tableCommands.tryOpenEntityEditor(this._tableEntityListViewModel);
        };
        DataTableOperationManager.prototype.tryHandleDeleteSelected = function () {
            var selectedEntities = this._tableEntityListViewModel.selected();
            var handled = false;
            if (selectedEntities && selectedEntities.length) {
                this._tableCommands.deleteEntitiesCommand(this._tableEntityListViewModel);
                handled = true;
            }
            return handled;
        };
        DataTableOperationManager.prototype.getEntityIdentity = function ($elem) {
            return {
                PartitionKey: $elem.attr(StorageExplorerConstants.htmlAttributeNames.dataTablePartitionKeyAttr),
                RowKey: $elem.attr(StorageExplorerConstants.htmlAttributeNames.dataTableRowKeyAttr)
            };
        };
        DataTableOperationManager.prototype.updateLastSelectedItem = function ($elem, isShiftSelect) {
            var entityIdentity = this.getEntityIdentity($elem);
            var entity = this._tableEntityListViewModel.getItemFromCurrentPage(this._tableEntityListViewModel.getTableEntityKeys(entityIdentity.PartitionKey, entityIdentity.RowKey));
            this._tableEntityListViewModel.lastSelectedItem = entity;
            if (!isShiftSelect) {
                this._tableEntityListViewModel.lastSelectedAnchorItem = entity;
            }
        };
        DataTableOperationManager.prototype.applySingleSelection = function ($elem) {
            if ($elem) {
                var entityIdentity = this.getEntityIdentity($elem);
                this._tableEntityListViewModel.clearSelection();
                this.addToSelection(entityIdentity.PartitionKey, entityIdentity.RowKey);
            }
        };
        DataTableOperationManager.prototype.applySelectAll = function () {
            this._tableEntityListViewModel.clearSelection();
            ko.utils.arrayPushAll(this._tableEntityListViewModel.selected, this._tableEntityListViewModel.getAllItemsInCurrentPage());
        };
        DataTableOperationManager.prototype.applyCtrlSelection = function ($elem) {
            var koSelected = this._tableEntityListViewModel ? this._tableEntityListViewModel.selected : null;
            if (koSelected) {
                var entityIdentity = this.getEntityIdentity($elem);
                if (!this._tableEntityListViewModel.isItemSelected(this._tableEntityListViewModel.getTableEntityKeys(entityIdentity.PartitionKey, entityIdentity.RowKey))) {
                    // Adding item not previously in selection
                    this.addToSelection(entityIdentity.PartitionKey, entityIdentity.RowKey);
                }
                else {
                    koSelected.remove(function (item) {
                        return item.PartitionKey._ === entityIdentity.PartitionKey && item.RowKey._ === entityIdentity.RowKey;
                    });
                }
            }
        };
        DataTableOperationManager.prototype.applyShiftSelection = function ($elem) {
            var anchorItem = this._tableEntityListViewModel.lastSelectedAnchorItem;
            // If anchor item doesn't exist, use the first available item of current page instead
            if (!anchorItem && this._tableEntityListViewModel.items().length > 0) {
                anchorItem = this._tableEntityListViewModel.items()[0];
            }
            if (anchorItem) {
                var entityIdentity = this.getEntityIdentity($elem);
                var elementIndex = this._tableEntityListViewModel.getItemIndexFromAllPages(this._tableEntityListViewModel.getTableEntityKeys(entityIdentity.PartitionKey, entityIdentity.RowKey));
                var anchorIndex = this._tableEntityListViewModel.getItemIndexFromAllPages(this._tableEntityListViewModel.getTableEntityKeys(anchorItem.PartitionKey._, anchorItem.RowKey._));
                var startIndex = Math.min(elementIndex, anchorIndex);
                var endIndex = Math.max(elementIndex, anchorIndex);
                this._tableEntityListViewModel.clearSelection();
                ko.utils.arrayPushAll(this._tableEntityListViewModel.selected, this._tableEntityListViewModel.getItemsFromAllPagesWithinRange(startIndex, endIndex + 1));
            }
        };
        DataTableOperationManager.prototype.applyContextMenuSelection = function ($elem) {
            var entityIdentity = this.getEntityIdentity($elem);
            if (!this._tableEntityListViewModel.isItemSelected(this._tableEntityListViewModel.getTableEntityKeys(entityIdentity.PartitionKey, entityIdentity.RowKey))) {
                if (this._tableEntityListViewModel.selected().length) {
                    this._tableEntityListViewModel.clearSelection();
                }
                this.addToSelection(entityIdentity.PartitionKey, entityIdentity.RowKey);
            }
        };
        DataTableOperationManager.prototype.addToSelection = function (partitionKey, rowKey) {
            var selectedEntity = this._tableEntityListViewModel.getItemFromCurrentPage(this._tableEntityListViewModel.getTableEntityKeys(partitionKey, rowKey));
            if (selectedEntity != null) {
                this._tableEntityListViewModel.selected.push(selectedEntity);
            }
        };
        // Selecting first row if the selection is empty.
        DataTableOperationManager.prototype.selectFirstIfNeeded = function () {
            var koSelected = this._tableEntityListViewModel ? this._tableEntityListViewModel.selected : null;
            var koEntities = this._tableEntityListViewModel ? this._tableEntityListViewModel.items : null;
            if (!koSelected().length && koEntities().length) {
                var firstEntity = koEntities()[0];
                // Clear last selection: lastSelectedItem and lastSelectedAnchorItem
                this._tableEntityListViewModel.clearLastSelected();
                this.addToSelection(firstEntity.PartitionKey._, firstEntity.RowKey._);
                // Update last selection
                this._tableEntityListViewModel.lastSelectedItem = firstEntity;
                // Finally, make sure first row is visible
                DataTableOperations.scrollToTopIfNeeded();
            }
        };
        DataTableOperationManager.prototype.bind = function () {
            var _this = this;
            _super.prototype.bind.call(this);
            $(document).on("keydown", function (event) {
                _this._keyDownTarget = event.target;
            });
            this.dataTable.on("click", "tr", this.click);
            this.dataTable.on("dblclick", "tr", this.doubleClick);
            this.dataTable.on("contextmenu", "tr", this.contextMenu);
            this.dataTable.on("keydown", this.keyDown);
            this.dataTable.on("keyup", this.keyUp);
            // Keyboard navigation - selecting first row if the selection is empty when the table gains focus.
            this.dataTable.on("focus", function () {
                _this.selectFirstIfNeeded();
                return true;
            });
            // Bind drag & drop behavior
            $("body").on("drop", this.itemDropped);
        };
        return DataTableOperationManager;
    }(BaseDataTableOperationManager_1.default));
    return DataTableOperationManager;
});
