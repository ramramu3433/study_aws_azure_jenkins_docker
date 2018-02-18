/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore", "Providers/Common/AzureConstants", "StorageExplorer/Common/BaseStorageCommands", "StorageExplorer/Common/DataTableUtilities", "Common/Utilities"], function (require, exports, _, AzureConstants, BaseStorageCommands_1, DataTableUtilities, Utilities) {
    "use strict";
    var QueueCommands = (function (_super) {
        __extends(QueueCommands, _super);
        function QueueCommands(queueExplorerContext) {
            var _this = _super.call(this, queueExplorerContext.hostProxy, queueExplorerContext.telemetry) || this;
            _this._queueReference = queueExplorerContext.queueReference;
            return _this;
        }
        QueueCommands.prototype.isEnabled = function (commandName, messages) {
            var singleItemSeleted = DataTableUtilities.containSingleItem(messages);
            var existAtLeastOneItem = messages.length > 0;
            switch (commandName) {
                case QueueCommands.viewMessageCommandName:
                    return singleItemSeleted;
                case QueueCommands.dequeueMessageCommandName:
                case QueueCommands.clearQueueCommandName:
                    return existAtLeastOneItem;
                default:
                    return false;
            }
        };
        /**
         * View the selected message.
         */
        QueueCommands.prototype.viewMessageCommand = function (message) {
            var _this = this;
            var messageToView = _.clone(message);
            messageToView.MessageText = Utilities.htmlEncode(messageToView.MessageText);
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.viewMessage,
                parameters: messageToView
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Queue.viewMessageCommand");
            });
        };
        /**
         * Add message to the end of the queue
         */
        QueueCommands.prototype.addMessageCommand = function (viewModel) {
            var _this = this;
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.addMessage
            }).then(function (message) {
                if (message) {
                    return _this._host.executeOperation("AzureQueues.addMessage", [_this._queueReference, message]).then(function () {
                        _this._telemetry.sendEvent("StorageExplorer.Queue.addMessage");
                        viewModel.reloadTable();
                    });
                }
                else {
                    _this._telemetry.sendEvent("StorageExplorer.Queue.addMessageCancelled");
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Queue.addMessageCommand");
            });
        };
        /**
         * Dequeue the first message from the queue
         */
        QueueCommands.prototype.dequeueMessageCommand = function (queueListViewModel) {
            var _this = this;
            return this._host.executeOperation("Environment.promptYesNo", ["Are you sure you want to dequeue the first message in the queue?", "critical"]).
                then(function (deleteConfirmed) {
                if (deleteConfirmed) {
                    return _this._host.executeOperation("AzureQueues.dequeueMessage", [_this._queueReference, queueListViewModel.topMessageId]).
                        then(function (result) {
                        if (result) {
                            _this._telemetry.sendEvent("StorageExplorer.Queue.dequeueMessageExecuted");
                            queueListViewModel.reloadTable();
                        }
                        else {
                            var message = "The message you are trying to dequeue has been removed or modified by someone else. Please refresh."; // localize
                            return _this._host.executeOperation("Environment.showMessageBox", ["Microsoft Azure Storage Explorer", message, "warning"]).
                                then(function () {
                                _this._telemetry.sendEvent("StorageExplorer.Queue.dequeueMessageTopMessageChanged");
                            });
                        }
                    });
                }
                else {
                    _this._telemetry.sendEvent("StorageExplorer.Queue.dequeueMessageCancelled");
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Queue.dequeueMessageCommand");
            });
        };
        /**
         * Clear all messages from the queue
         */
        QueueCommands.prototype.clearQueueCommand = function (viewModel) {
            var _this = this;
            return this._host.executeOperation("Environment.promptYesNo", ["Are you sure you want to clear the entire contents of your queue?", "critical"]).
                then(function (result) {
                if (result) {
                    return _this._host.executeOperation("AzureQueues.clearQueue", [_this._queueReference]).then(function () {
                        _this._telemetry.sendEvent("StorageExplorer.Queue.clearQueueExecuted");
                        viewModel.reloadTable();
                    });
                }
                else {
                    _this._telemetry.sendEvent("StorageExplorer.Queue.clearQueueCancelled");
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Queue.clearQueueCommand");
            });
        };
        return QueueCommands;
    }(BaseStorageCommands_1.default));
    // Command Ids
    QueueCommands.viewMessageCommandName = "view";
    QueueCommands.dequeueMessageCommandName = "dequeue";
    QueueCommands.clearQueueCommandName = "clear";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueueCommands;
});
