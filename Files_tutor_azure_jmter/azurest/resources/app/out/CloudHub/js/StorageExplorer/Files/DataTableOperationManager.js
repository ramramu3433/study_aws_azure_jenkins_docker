/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "Common/Utilities", "StorageExplorer/Common/FlobDataTableOperationManager", "StorageExplorer/Common/DataTableOperations", "StorageExplorer/KeyCodes", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Common/StorageExplorerUtilities"], function (require, exports, ko, Utilities, FlobDataTableOperationManager_1, DataTableOperations, KeyCodes_1, StorageExplorerConstants, StorageExplorerUtilities) {
    "use strict";
    /*
     * Base class for file editor table operations e.g. row selection.
     */
    var DataTableOperationManager = (function (_super) {
        __extends(DataTableOperationManager, _super);
        function DataTableOperationManager(table, viewModel, fileCommands) {
            var _this = _super.call(this, table, viewModel, fileCommands) || this;
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
                var selectedItem = _this.selectDoubleClickedItem(event.currentTarget);
                if (!selectedItem) {
                    return;
                }
                if (selectedItem.ContentType === StorageExplorerConstants.ContentTypes.Folder) {
                    _this.fileListViewModel.navigateToFolder(selectedItem.FullName);
                }
                else {
                    _this.fileCommands.openSingleFile(selectedItem);
                }
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
                    var lastSelectedItem = _this.fileListViewModel.lastSelectedItem;
                    var dataTableRows = $(StorageExplorerConstants.htmlSelectors.dataTableAllRowsSelector);
                    var maximumIndex = dataTableRows.length - 1;
                    // If can't find an index for lastSelectedItem, then either no item is previously selected or it goes across page.
                    // Simply select the first item in this case.
                    var lastSelectedItemIndex = lastSelectedItem
                        ? _this.fileListViewModel.getItemIndexFromCurrentPage(_this.fileListViewModel.getFlobKeys(lastSelectedItem.FullName, lastSelectedItem.ContentType, lastSelectedItem.Blob ? lastSelectedItem.Blob.Snapshot : undefined))
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
                            handled = _this.fileCommands.openSelected(_this.fileListViewModel);
                            if (!handled) {
                                handled = _this.tryHandleDownloadSelected();
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
            _this.fileListViewModel = viewModel;
            _this.fileCommands = fileCommands;
            return _this;
        }
        DataTableOperationManager.prototype.tryHandleDownloadSelected = function () {
            var selectedItems = this.fileListViewModel.selected();
            var handled = false;
            if (selectedItems && selectedItems.length) {
                this.fileCommands.showDownloadDialog(selectedItems, this.fileListViewModel.currentFolderPath());
                handled = true;
            }
            return handled;
        };
        DataTableOperationManager.prototype.tryHandleDeleteSelected = function () {
            var selectedItems = this.fileListViewModel.selected();
            var handled = false;
            if (selectedItems && selectedItems.length) {
                this.fileCommands.startDeleteItemsTask(this.fileListViewModel);
                handled = true;
            }
            return handled;
        };
        DataTableOperationManager.prototype.selectDoubleClickedItem = function (elem) {
            var contentType = $(elem).attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr);
            var name = $(elem).attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr);
            var snapshot = $(elem).attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
            return this.fileListViewModel.getItemFromCurrentPage(this.fileListViewModel.getFlobKeys(name, contentType, snapshot));
        };
        DataTableOperationManager.prototype.updateLastSelectedItem = function (element, isShiftSelect) {
            var name = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr);
            var contentType = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr);
            var snapshot = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
            var item = this.fileListViewModel.getItemFromCurrentPage(this.fileListViewModel.getFlobKeys(name, contentType, snapshot));
            this.fileListViewModel.lastSelectedItem = item;
            if (!isShiftSelect) {
                this.fileListViewModel.lastSelectedAnchorItem = item;
            }
        };
        DataTableOperationManager.prototype.applySingleSelection = function (element) {
            if (element) {
                var name = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr), contentType = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr), snapshot = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
                this.fileListViewModel.selected.removeAll();
                this.addToSelection(name, contentType, snapshot);
            }
        };
        DataTableOperationManager.prototype.applySelectAll = function () {
            this.fileListViewModel.selected.removeAll();
            ko.utils.arrayPushAll(this.fileListViewModel.selected, this.fileListViewModel.getAllItemsInCurrentPage());
        };
        DataTableOperationManager.prototype.applyCtrlSelection = function (element) {
            var koSelected = this.fileListViewModel ? this.fileListViewModel.selected : null;
            if (koSelected) {
                var name = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr), contentType = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr), snapshot = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
                if (!this.fileListViewModel.isItemSelected(this.fileListViewModel.getFlobKeys(name, contentType, snapshot))) {
                    // Adding item not previously in selection
                    this.addToSelection(name, contentType, snapshot);
                }
                else {
                    koSelected.remove(function (item) {
                        return ((item.FullName === name) && (item.ContentType === contentType));
                    });
                }
            }
        };
        DataTableOperationManager.prototype.applyShiftSelection = function (element) {
            var anchorItem = this.fileListViewModel.lastSelectedAnchorItem;
            // If anchor item doesn't exist, use the first available item of current page instead
            if (!anchorItem && this.fileListViewModel.items().length > 0) {
                anchorItem = this.fileListViewModel.items()[0];
            }
            if (anchorItem) {
                var elementName = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr);
                var elementContentType = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr);
                var elementSnapshot = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
                var elementIndex = this.fileListViewModel.getItemIndexFromAllPages(this.fileListViewModel.getFlobKeys(elementName, elementContentType, elementSnapshot));
                var anchorIndex = this.fileListViewModel.getItemIndexFromAllPages(this.fileListViewModel.getFlobKeys(anchorItem.FullName, anchorItem.ContentType, elementSnapshot));
                var startIndex = Math.min(elementIndex, anchorIndex);
                var endIndex = Math.max(elementIndex, anchorIndex);
                this.fileListViewModel.selected.removeAll();
                ko.utils.arrayPushAll(this.fileListViewModel.selected, this.fileListViewModel.getItemsFromAllPagesWithinRange(startIndex, endIndex + 1));
            }
        };
        DataTableOperationManager.prototype.applyContextMenuSelection = function (element) {
            var name = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr);
            var contentType = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr);
            var snapshot = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
            if (!this.fileListViewModel.isItemSelected(this.fileListViewModel.getFlobKeys(name, contentType, snapshot))) {
                if (this.fileListViewModel.selected().length) {
                    this.fileListViewModel.selected.removeAll();
                }
                this.addToSelection(name, contentType, snapshot);
            }
        };
        DataTableOperationManager.prototype.addToSelection = function (name, contentType, snapshot) {
            var selectedItem = this.fileListViewModel.getItemFromCurrentPage(this.fileListViewModel.getFlobKeys(name, contentType, snapshot));
            if (selectedItem != null) {
                this.fileListViewModel.selected.push(selectedItem);
            }
        };
        // Selecting first row if the selection is empty.
        DataTableOperationManager.prototype.selectFirstIfNeeded = function () {
            var koSelected = this.fileListViewModel ? this.fileListViewModel.selected : null, koItems = this.fileListViewModel ? this.fileListViewModel.items : null;
            if (!koSelected().length && koItems().length) {
                var firstItem = koItems()[0];
                // Clear last selection: lastSelectedItem and lastSelectedAnchorItem
                this.fileListViewModel.clearLastSelected();
                this.addToSelection(firstItem.FullName, firstItem.ContentType, firstItem.Blob ? firstItem.Blob.Snapshot : undefined);
                // Update last selection
                this.fileListViewModel.lastSelectedItem = firstItem;
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
            // Bind copy & paste behavior
            $("body").on("copy", function () {
                var handled = false;
                if (_this.dataTable.is(":focus")) {
                    var fileListViewModel = _this.fileListViewModel;
                    var selectedItems = fileListViewModel.selected ? fileListViewModel.selected() : null;
                    if (fileListViewModel && _this.fileCommands.canCopy(selectedItems)) {
                        if ($.isArray(selectedItems) && selectedItems.length) {
                            _this.fileCommands.copyItemsToClipboard(selectedItems, fileListViewModel.currentFolderPath()).then(function () {
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
                var fileListViewModel = _this.fileListViewModel;
                if (fileListViewModel) {
                    if (_this.fileCommands.canPaste()) {
                        _this.fileCommands.startFilePasteTask(fileListViewModel.currentFolderPath(), fileListViewModel).then(function () {
                            _this.focusTable();
                        });
                        handled = true;
                    }
                }
                return !handled;
            });
        };
        /**
         * @override
         */
        DataTableOperationManager.prototype.tryHandleUploadDroppedFiles = function (files) {
            var converted = StorageExplorerUtilities.convertToRelativeFilePaths(files);
            var sourceFileFolder = converted.commonFileFolder;
            var relativeFilePaths = converted.relativeFilePaths;
            // upload a file indicating that the blob type should be interpreted by file extension
            return this.fileCommands.startUploadFilesTask(sourceFileFolder, this.fileListViewModel.currentFolderPath(), this.fileListViewModel, relativeFilePaths);
        };
        /**
         * @override
         */
        DataTableOperationManager.prototype.uploadDroppedFolder = function (sourceFileFolder) {
            var uploadFolder = Utilities.appendPathSeparator(this.fileListViewModel.currentFolderPath());
            uploadFolder = Utilities.join("", uploadFolder, Utilities.getFileNameFromPath(sourceFileFolder));
            // upload a folder indicating that the blob type should be interpreted by file extension
            return this.fileCommands.startUploadFolderTask(sourceFileFolder, uploadFolder, this.fileListViewModel);
        };
        return DataTableOperationManager;
    }(FlobDataTableOperationManager_1.default));
    return DataTableOperationManager;
});
