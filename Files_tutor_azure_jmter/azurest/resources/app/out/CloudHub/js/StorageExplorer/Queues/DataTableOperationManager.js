/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "StorageExplorer/Common/BaseDataTableOperationManager", "StorageExplorer/KeyCodes", "StorageExplorer/Queues/QueueCommands", "StorageExplorer/Common/DataTableOperations", "StorageExplorer/StorageExplorerConstants", "Common/Utilities"], function (require, exports, ko, BaseDataTableOperationManager_1, KeyCodes_1, QueueCommands_1, DataTableOperations, StorageExplorerConstants, Utilities) {
    "use strict";
    /*
     * Base class for data table row selection.
     */
    var DataTableOperationManager = (function (_super) {
        __extends(DataTableOperationManager, _super);
        function DataTableOperationManager(table, viewModel, queueCommands, telemetry) {
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
                var selectedItem = _this.selectDoubleClickedItem(event.currentTarget);
                if (selectedItem) {
                    _this._queueCommands.viewMessageCommand(selectedItem);
                    _this._telemetry.sendEvent("StorageExplorer.Queue.OnDoubleClick", { Action: "viewMessage" });
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
                    var lastSelectedItem = _this._queueListViewModel.lastSelectedItem;
                    var dataTableRows = $(StorageExplorerConstants.htmlSelectors.dataTableAllRowsSelector);
                    var maximumIndex = dataTableRows.length - 1;
                    // If can't find an index for lastSelectedItem, then either no item is previously selected or it goes across page.
                    // Simply select the first item in this case.
                    var lastSelectedItemIndex = lastSelectedItem
                        ? _this._queueListViewModel.getItemIndexFromCurrentPage(_this._queueListViewModel.getMessageKey(lastSelectedItem.MessageId))
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
                            handled = _this.tryViewMessage();
                            if (handled) {
                                _this._telemetry.sendEvent("StorageExplorer.Queue.OnEnterKeyUp", { Action: "viewMessage" });
                            }
                            break;
                        case KeyCodes_1.default.Delete:
                            // We don't support deleting anything but the first item in the queue
                            // handled = this.tryHandleDeleteSelected();
                            break;
                    }
                }
                return !handled;
            };
            _this.dataTable = table;
            _this._queueListViewModel = viewModel;
            _this._queueCommands = queueCommands;
            _this._telemetry = telemetry;
            _this.bind();
            _this._queueListViewModel.bind(_this);
            return _this;
        }
        DataTableOperationManager.prototype.tryViewMessage = function () {
            var canViewMessage = this._queueCommands.isEnabled(QueueCommands_1.default.viewMessageCommandName, this._queueListViewModel.selected());
            if (canViewMessage) {
                this._queueCommands.viewMessageCommand(this._queueListViewModel.selected()[0]);
            }
            return canViewMessage;
        };
        DataTableOperationManager.prototype.selectDoubleClickedItem = function (elem) {
            var messageId = $(elem).attr(StorageExplorerConstants.htmlAttributeNames.dataTableMessageIdAttr);
            return this._queueListViewModel.getItemFromCurrentPage(this._queueListViewModel.getMessageKey(messageId));
        };
        DataTableOperationManager.prototype.updateLastSelectedItem = function (element, isShiftSelect) {
            var messageId = $(element).attr(StorageExplorerConstants.htmlAttributeNames.dataTableMessageIdAttr);
            var message = this._queueListViewModel.getItemFromCurrentPage(this._queueListViewModel.getMessageKey(messageId));
            this._queueListViewModel.lastSelectedItem = message;
            if (!isShiftSelect) {
                this._queueListViewModel.lastSelectedAnchorItem = message;
            }
        };
        DataTableOperationManager.prototype.applySingleSelection = function (element) {
            if (element) {
                var messageId = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableMessageIdAttr);
                this._queueListViewModel.clearSelection();
                this.addToSelection(messageId);
            }
        };
        DataTableOperationManager.prototype.applySelectAll = function () {
            this._queueListViewModel.clearSelection();
            ko.utils.arrayPushAll(this._queueListViewModel.selected, this._queueListViewModel.getAllItemsInCurrentPage());
        };
        DataTableOperationManager.prototype.applyCtrlSelection = function (element) {
            var koSelected = this._queueListViewModel ? this._queueListViewModel.selected : null;
            if (koSelected) {
                var messageId = element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableMessageIdAttr);
                if (!this._queueListViewModel.isItemSelected(this._queueListViewModel.getMessageKey(messageId))) {
                    // Adding item not previously in selection
                    this.addToSelection(messageId);
                }
                else {
                    koSelected.remove(function (item) {
                        return messageId === item.MessageId;
                    });
                }
            }
        };
        DataTableOperationManager.prototype.applyShiftSelection = function ($element) {
            var anchorItem = this._queueListViewModel.lastSelectedAnchorItem;
            // If anchor item doesn't exist, use the first available item of current page instead
            if (!anchorItem && this._queueListViewModel.items().length > 0) {
                anchorItem = this._queueListViewModel.items()[0];
            }
            if (anchorItem) {
                var messageId = $element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableMessageIdAttr);
                var elementIndex = this._queueListViewModel.getItemIndexFromAllPages(this._queueListViewModel.getMessageKey(messageId));
                var anchorIndex = this._queueListViewModel.getItemIndexFromAllPages(this._queueListViewModel.getMessageKey(anchorItem.MessageId));
                var startIndex = Math.min(elementIndex, anchorIndex);
                var endIndex = Math.max(elementIndex, anchorIndex);
                this._queueListViewModel.clearSelection();
                ko.utils.arrayPushAll(this._queueListViewModel.selected, this._queueListViewModel.getItemsFromAllPagesWithinRange(startIndex, endIndex + 1));
            }
        };
        DataTableOperationManager.prototype.applyContextMenuSelection = function ($element) {
            var messageId = $element.attr(StorageExplorerConstants.htmlAttributeNames.dataTableMessageIdAttr);
            if (!this._queueListViewModel.isItemSelected(this._queueListViewModel.getMessageKey(messageId))) {
                if (this._queueListViewModel.selected().length) {
                    this._queueListViewModel.clearSelection();
                }
                this.addToSelection(messageId);
            }
        };
        DataTableOperationManager.prototype.addToSelection = function (messageId) {
            var selectedMessage = this._queueListViewModel.getItemFromCurrentPage(this._queueListViewModel.getMessageKey(messageId));
            if (selectedMessage != null) {
                this._queueListViewModel.selected.push(selectedMessage);
            }
        };
        // Selecting first row if the selection is empty.
        DataTableOperationManager.prototype.selectFirstIfNeeded = function () {
            var koSelected = this._queueListViewModel ? this._queueListViewModel.selected : null, koBlobs = this._queueListViewModel ? this._queueListViewModel.items : null;
            if (!koSelected().length && koBlobs().length) {
                var firstMessage = koBlobs()[0];
                // Clear last selection: lastSelectedItem and lastSelectedAnchorItem
                this._queueListViewModel.clearLastSelected();
                this.addToSelection(firstMessage.MessageId);
                // Update last selection
                this._queueListViewModel.lastSelectedItem = firstMessage;
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
        };
        return DataTableOperationManager;
    }(BaseDataTableOperationManager_1.default));
    return DataTableOperationManager;
});
