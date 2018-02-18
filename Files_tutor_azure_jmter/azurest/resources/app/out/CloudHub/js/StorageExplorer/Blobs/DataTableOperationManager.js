/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "StorageExplorer/Common/DataTableOperations", "StorageExplorer/KeyCodes", "StorageExplorer/StorageExplorerConstants", "Common/Utilities"], function (require, exports, ko, DataTableOperations, KeyCodes_1, StorageExplorerConstants, Utilities) {
    "use strict";
    /*
     * Base class for data table row selection.
     */
    var DataTableOperationManager = (function () {
        function DataTableOperationManager(table, viewModel, blobExplorerViewModel) {
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
                var selectedItem = _this.selectDoubleClickedItem(event.currentTarget);
                if (!selectedItem) {
                    return;
                }
                _this._blobExplorerViewModel.OpenSelected();
            };
            this.contextMenu = function (event) {
                if (event.which === 3) {
                    var elem = $(event.currentTarget);
                    _this.updateLastSelectedItem(elem, event.shiftKey);
                    _this.applyContextMenuSelection(elem);
                    setTimeout(function () {
                        $(".context-menu-list").attr("tabindex", -1).focus();
                    }, 0);
                }
            };
            this.keyDown = function (event) {
                var isUpArrowKey = (!event.altKey && event.keyCode === KeyCodes_1.default.UpArrow), isDownArrowKey = (!event.altKey && event.keyCode === KeyCodes_1.default.DownArrow), handled = false;
                if (isUpArrowKey || isDownArrowKey) {
                    var lastSelectedItem = _this._blobListViewModel.lastSelectedItem;
                    var dataTableRows = $(StorageExplorerConstants.htmlSelectors.dataTableAllRowsSelector);
                    var maximumIndex = dataTableRows.length - 1;
                    // If can't find an index for lastSelectedItem, then either no item is previously selected or it goes across page.
                    // Simply select the first item in this case.
                    var lastSelectedItemIndex = lastSelectedItem
                        ? _this._blobListViewModel.getItemIndexFromCurrentPage(_this._blobListViewModel.getFlobKeys(lastSelectedItem.FullName, lastSelectedItem.ContentType, lastSelectedItem.Blob ? lastSelectedItem.Blob.Snapshot : undefined))
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
            this.keyUp = function (event) {
                var handled = false;
                if (_this._keyDownTarget === event.target) {
                    switch (event.keyCode) {
                        case KeyCodes_1.default.Enter:
                            if (_this._blobListViewModel.selected().length > 0) {
                                _this._blobExplorerViewModel.OpenSelected();
                                handled = true;
                            }
                            break;
                        case KeyCodes_1.default.Delete:
                            handled = _this.tryHandleDeleteSelected();
                            break;
                        case KeyCodes_1.default.F2:
                            handled = _this.tryHandleRenameSelected();
                            break;
                    }
                }
                return !handled;
            };
            this.itemDropped = function (event) {
                var handled = false;
                var items = event.originalEvent.dataTransfer.items;
                var filePaths = [];
                var folderPaths = [];
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
                        filePaths.push(item.getAsFile().path);
                    }
                    else if (entry.isDirectory) {
                        folderPaths.push(item.getAsFile().path);
                    }
                }
                if (filePaths.length > 0 || folderPaths.length > 0) {
                    _this._blobExplorerViewModel.handleUploadDrop({ filePaths: filePaths, folderPaths: folderPaths });
                    handled = true;
                }
                return !handled;
            };
            this._dataTable = table;
            this._blobListViewModel = viewModel;
            this._blobCommands = blobExplorerViewModel.blobCommands;
            this._blobExplorerViewModel = blobExplorerViewModel;
        }
        DataTableOperationManager.prototype.tryHandleDeleteSelected = function () {
            var selectedBlobs = this._blobListViewModel.selected();
            var handled = false;
            if (selectedBlobs && selectedBlobs.length) {
                this._blobCommands.startDeleteBlobsTask(this._blobListViewModel);
                handled = true;
            }
            return handled;
        };
        DataTableOperationManager.prototype.selectDoubleClickedItem = function (elem) {
            var contentType = $(elem).attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr);
            var name = $(elem).attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr);
            var snapshot = $(elem).attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
            return this._blobListViewModel.getItemFromCurrentPage(this._blobListViewModel.getFlobKeys(name, contentType, snapshot));
        };
        DataTableOperationManager.prototype.updateLastSelectedItem = function (element, isShiftSelect) {
            var name = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr);
            var contentType = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr);
            var snapshot = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
            var blob = this._blobListViewModel.getItemFromCurrentPage(this._blobListViewModel.getFlobKeys(name, contentType, snapshot));
            this._blobListViewModel.lastSelectedItem = blob;
            if (!isShiftSelect) {
                this._blobListViewModel.lastSelectedAnchorItem = blob;
            }
        };
        DataTableOperationManager.prototype.applySingleSelection = function (element) {
            if (element) {
                var name = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr), contentType = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr), snapshot = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
                this._blobListViewModel.selected.removeAll();
                this.addToSelection(name, contentType, snapshot);
            }
        };
        DataTableOperationManager.prototype.applySelectAll = function () {
            this._blobListViewModel.selected.removeAll();
            ko.utils.arrayPushAll(this._blobListViewModel.selected, this._blobListViewModel.getAllItemsInCurrentPage());
        };
        DataTableOperationManager.prototype.applyCtrlSelection = function (element) {
            var koSelected = this._blobListViewModel ? this._blobListViewModel.selected : null;
            if (koSelected) {
                var name = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr), contentType = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr), snapshot = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
                if (!this._blobListViewModel.isItemSelected(this._blobListViewModel.getFlobKeys(name, contentType, snapshot))) {
                    // Adding item not previously in selection
                    this.addToSelection(name, contentType, snapshot);
                }
                else {
                    koSelected.remove(function (item) {
                        return item.FullName === name && item.ContentType === contentType;
                    });
                }
            }
        };
        DataTableOperationManager.prototype.applyShiftSelection = function (element) {
            var anchorItem = this._blobListViewModel.lastSelectedAnchorItem;
            // If anchor item doesn't exist, use the first available item of current page instead
            if (!anchorItem && this._blobListViewModel.items().length > 0) {
                anchorItem = this._blobListViewModel.items()[0];
            }
            if (anchorItem) {
                var elementName = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr);
                var elementContentType = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr);
                var elementSnapshot = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
                var elementIndex = this._blobListViewModel.getItemIndexFromAllPages(this._blobListViewModel.getFlobKeys(elementName, elementContentType, elementSnapshot));
                var anchorIndex = this._blobListViewModel.getItemIndexFromAllPages(this._blobListViewModel.getFlobKeys(anchorItem.FullName, anchorItem.ContentType, anchorItem.Blob ? anchorItem.Blob.Snapshot : ""));
                var startIndex = Math.min(elementIndex, anchorIndex);
                var endIndex = Math.max(elementIndex, anchorIndex);
                this._blobListViewModel.selected.removeAll();
                ko.utils.arrayPushAll(this._blobListViewModel.selected, this._blobListViewModel.getItemsFromAllPagesWithinRange(startIndex, endIndex + 1));
            }
        };
        DataTableOperationManager.prototype.applyContextMenuSelection = function (element) {
            var name = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr);
            var contentType = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr);
            var snapshot = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
            if (!this._blobListViewModel.isItemSelected(this._blobListViewModel.getFlobKeys(name, contentType, snapshot))) {
                if (this._blobListViewModel.selected().length) {
                    this._blobListViewModel.selected.removeAll();
                }
                this.addToSelection(name, contentType, snapshot);
            }
        };
        DataTableOperationManager.prototype.addToSelection = function (name, contentType, snapshot) {
            var selectedBlob = this._blobListViewModel.getItemFromCurrentPage(this._blobListViewModel.getFlobKeys(name, contentType, snapshot));
            if (selectedBlob != null) {
                this._blobListViewModel.selected.push(selectedBlob);
            }
        };
        // Selecting first row if the selection is empty.
        DataTableOperationManager.prototype.selectFirstIfNeeded = function () {
            var koSelected = this._blobListViewModel ? this._blobListViewModel.selected : null, koBlobs = this._blobListViewModel ? this._blobListViewModel.items : null;
            if (!koSelected().length && koBlobs().length) {
                var firstBlob = koBlobs()[0];
                // Clear last selection: lastSelectedItem and lastSelectedAnchorItem
                this._blobListViewModel.clearLastSelected();
                this.addToSelection(firstBlob.FullName, firstBlob.ContentType, firstBlob.Blob ? firstBlob.Blob.Snapshot : undefined);
                // Update last selection
                this._blobListViewModel.lastSelectedItem = firstBlob;
                // Finally, make sure first row is visible
                DataTableOperations.scrollToTopIfNeeded();
            }
        };
        DataTableOperationManager.prototype.tryHandleRenameSelected = function () {
            var selectedBlobs = this._blobListViewModel.selected();
            var handled = false;
            if (this._blobCommands.canRename(selectedBlobs)) {
                this._blobCommands.startRenameTask(this._blobListViewModel);
                handled = true;
            }
            return handled;
        };
        DataTableOperationManager.prototype.focusTable = function () {
            this._dataTable.focus();
        };
        DataTableOperationManager.prototype.bind = function () {
            var _this = this;
            $(document).on("keydown", function (event) {
                _this._keyDownTarget = event.target;
            });
            this._dataTable.on("click", "tr", this.click);
            this._dataTable.on("dblclick", "tr", this.doubleClick);
            this._dataTable.on("contextmenu", "tr", this.contextMenu);
            this._dataTable.on("keydown", this.keyDown);
            this._dataTable.on("keyup", this.keyUp);
            // Keyboard navigation - selecting first row if the selection is empty when the table gains focus.
            this._dataTable.on("focus", function () {
                _this.selectFirstIfNeeded();
                return true;
            });
            // Bind copy & paste behavior
            $("body").on("copy", function () {
                var handled = false;
                if (_this._dataTable.is(":focus")) {
                    var blobListViewModel = _this._blobListViewModel;
                    var selectedItems = blobListViewModel.selected ? blobListViewModel.selected() : null;
                    if (blobListViewModel && _this._blobCommands.canCopy(selectedItems)) {
                        if ($.isArray(selectedItems) && selectedItems.length) {
                            _this._blobCommands.copyBlobsToClipboard(selectedItems, blobListViewModel.currentFolderPath()).then(function () {
                                _this.focusTable();
                            });
                            handled = true;
                        }
                    }
                }
                return !handled;
            });
            $("body").on("paste", function () {
                var handled = false;
                var blobListViewModel = _this._blobListViewModel;
                if (blobListViewModel) {
                    if (_this._blobCommands.canPaste()) {
                        _this._blobCommands.startBlobPasteTask(blobListViewModel.currentFolderPath(), blobListViewModel).then(function () {
                            _this.focusTable();
                        });
                        handled = true;
                    }
                }
                return !handled;
            });
            $("body").on("drop", this.itemDropped);
        };
        return DataTableOperationManager;
    }());
    return DataTableOperationManager;
});
