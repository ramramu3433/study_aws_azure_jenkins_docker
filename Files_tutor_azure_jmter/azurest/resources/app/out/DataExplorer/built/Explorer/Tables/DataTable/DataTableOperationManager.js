define(["require", "exports", "knockout", "./DataTableOperations", "../Constants", "../Utilities"], function (require, exports, ko, DataTableOperations, Constants, Utilities) {
    "use strict";
    /*
     * Base class for data table row selection.
     */
    var DataTableOperationManager = (function () {
        function DataTableOperationManager(table, viewModel, tableCommands) {
            var _this = this;
            this.click = function (event) {
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
            this.doubleClick = function (event) {
                _this.tryOpenEditor();
            };
            this.contextMenu = function (event) {
                var elem = $(event.currentTarget);
                _this.updateLastSelectedItem(elem, event.shiftKey);
                _this.applyContextMenuSelection(elem);
                setTimeout(function () {
                    $(".context-menu-list").attr("tabindex", -1).focus();
                }, 0);
            };
            this.keyDown = function (event) {
                var isUpArrowKey = (event.keyCode === Constants.keyCodes.UpArrow), isDownArrowKey = (event.keyCode === Constants.keyCodes.DownArrow), handled = false;
                if (isUpArrowKey || isDownArrowKey) {
                    var lastSelectedItem = _this._tableEntityListViewModel.lastSelectedItem;
                    var dataTableRows = $(Constants.htmlSelectors.dataTableAllRowsSelector);
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
                    !Utilities.isEnvironmentAltPressed(event) && event.keyCode === Constants.keyCodes.A) {
                    _this.applySelectAll();
                    handled = true;
                }
                return !handled;
            };
            // Note: There is one key up event each time a key is pressed;
            // in contrast, there may be more than one key down and key
            // pressed events.
            this.keyUp = function (event) {
                var handled = false;
                switch (event.keyCode) {
                    case Constants.keyCodes.Enter:
                        handled = _this.tryOpenEditor();
                        break;
                    case Constants.keyCodes.Delete:
                        handled = _this.tryHandleDeleteSelected();
                        break;
                }
                return !handled;
            };
            this.itemDropped = function (event) {
                var handled = false;
                var items = event.originalEvent.dataTransfer.items;
                if (!items) {
                    // On browsers outside of Chromium
                    // we can't discern between dirs and files
                    // so we will disable drag & drop for now
                    return null;
                }
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var entry = item.webkitGetAsEntry();
                    if (entry.isFile) {
                        // TODO: parse the file and insert content as entities
                    }
                }
                return !handled;
            };
            this.dataTable = table;
            this._tableEntityListViewModel = viewModel;
            this._tableCommands = tableCommands;
            this.bind();
            this._tableEntityListViewModel.bind(this);
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
                PartitionKey: $elem.attr(Constants.htmlAttributeNames.dataTablePartitionKeyAttr),
                RowKey: $elem.attr(Constants.htmlAttributeNames.dataTableRowKeyAttr)
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
        DataTableOperationManager.prototype.focusTable = function () {
            this.dataTable.focus();
        };
        return DataTableOperationManager;
    }());
    return DataTableOperationManager;
});
