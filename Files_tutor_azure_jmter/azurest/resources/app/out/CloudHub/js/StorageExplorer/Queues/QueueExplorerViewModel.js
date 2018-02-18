/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "StorageExplorer/Queues/QueueCommands", "StorageExplorer/Queues/QueueExplorerContext", "StorageExplorer/Configurable/Toolbar/Toolbar", "StorageExplorer/Configurable/ContextMenu", "StorageExplorer/Queues/QueueListViewModel", "StorageExplorer/StorageExplorerConstants", "../../CloudExplorer/DaytonaTabMessengerProxy"], function (require, exports, ko, QueueCommands_1, QueueExplorerContext_1, Toolbar_1, ContextMenu_1, QueueListViewModel_1, StorageExplorerConstants, DaytonaTabMessengerProxy_1) {
    "use strict";
    /**
     * View model for the entire Storage Explorer document window for tables
     */
    var QueueExplorerViewModel = (function () {
        function QueueExplorerViewModel() {
            var _this = this;
            /* Observables */
            this.queueListViewModel = ko.observable();
            this.toolbarViewModel = ko.observable();
            this._setFocus = function () {
                _this.toolbarViewModel().focus();
            };
            this.canView = ko.pureComputed(function () { return _this.queueCommands.isEnabled(QueueCommands_1.default.viewMessageCommandName, _this.queueListViewModel().selected()); });
            this.canDequeue = ko.pureComputed(function () { return _this.queueCommands.isEnabled(QueueCommands_1.default.dequeueMessageCommandName, _this.queueListViewModel().items()); });
            this.canClearQueue = ko.pureComputed(function () { return _this.queueCommands.isEnabled(QueueCommands_1.default.clearQueueCommandName, _this.queueListViewModel().items()); });
            this.viewMessage = function () {
                // The command can only be triggered when there is one and only one item selected.
                var promise = _this.queueCommands.viewMessageCommand(_this.queueListViewModel().selected()[0]);
                promise.then(function () {
                    // Showing the dialog loses the focus, giving it to the data table when we return from the dialog.
                    _this.queueListViewModel().focusDataTable();
                });
            };
            this.addMessage = function () {
                return _this.queueCommands.addMessageCommand(_this.queueListViewModel())
                    .then(function () {
                    // Showing the dialog loses the focus, giving it to the data table when we return from the dialog.
                    _this.queueListViewModel().focusDataTable();
                });
            };
            this.refresh = function () {
                _this.queueListViewModel().reloadTable();
            };
            this.dequeueMessage = function () {
                _this.queueCommands.dequeueMessageCommand(_this.queueListViewModel());
            };
            this.clearQueue = function () {
                _this.queueCommands.clearQueueCommand(_this.queueListViewModel());
            };
            this._viewMessageActionConfig = {
                type: "action",
                title: "View Message",
                displayName: "View Message",
                id: StorageExplorerConstants.buttonIds.viewMessage,
                action: this.viewMessage,
                enabled: this.canView,
                icon: "images/StorageExplorer/ASX_Open.svg"
            };
            this._contextMenuActionsConfig = [
                this._viewMessageActionConfig
            ];
            this._toolbarActionsConfig = [
                this._viewMessageActionConfig,
                {
                    type: "action",
                    title: "Add Message",
                    displayName: "Add Message",
                    id: StorageExplorerConstants.buttonIds.addMessage,
                    action: this.addMessage,
                    enabled: ko.observable(true),
                    icon: "images/StorageExplorer/ASX_Add.svg"
                },
                {
                    type: "action",
                    title: "Dequeue",
                    displayName: "Dequeue Message",
                    id: StorageExplorerConstants.buttonIds.dequeueFirstMessage,
                    action: this.dequeueMessage,
                    enabled: this.canDequeue,
                    icon: "images/StorageExplorer/ASX_Remove.svg"
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Clear Queue",
                    displayName: "Clear Queue",
                    id: StorageExplorerConstants.buttonIds.clearQueue,
                    action: this.clearQueue,
                    enabled: this.canClearQueue,
                    icon: "images/StorageExplorer/ASX_CheckboxClearAll.svg"
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Refresh",
                    displayName: "Refresh",
                    id: StorageExplorerConstants.buttonIds.refresh,
                    action: this.refresh,
                    enabled: ko.observable(true),
                    icon: "images/StorageExplorer/ASX_Refresh.svg"
                }
            ];
            this.queueExplorerContext = new QueueExplorerContext_1.default();
            window.host = this.queueExplorerContext.hostProxy;
            this.queueCommands = new QueueCommands_1.default(this.queueExplorerContext);
            this.queueListViewModel(new QueueListViewModel_1.default(this.queueExplorerContext, this.queueExplorerContext.telemetry));
            // Enable Context menu for the data table.
            this.toolbarViewModel(new Toolbar_1.default(this._toolbarActionsConfig, function (id) {
                _this.queueExplorerContext.telemetry.sendEvent("StorageExplorer.Queue.Toolbar", {
                    "Action": id
                });
            }));
            new ContextMenu_1.default(this._contextMenuActionsConfig, [".dataTable tr td", ".dataTable tr td *"], function (id) {
                _this.queueExplorerContext.telemetry.sendEvent("StorageExplorer.Queue.contextMenu", {
                    "Action": id
                });
            }, ".selected:last");
            DaytonaTabMessengerProxy_1.default.on("tab-active", function () {
                _this._setFocus();
            });
        }
        return QueueExplorerViewModel;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueueExplorerViewModel;
});
