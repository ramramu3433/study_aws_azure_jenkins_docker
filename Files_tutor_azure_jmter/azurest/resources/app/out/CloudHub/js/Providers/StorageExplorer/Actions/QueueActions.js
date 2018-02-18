/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Common/AzureStorageConstants", "Providers/StorageExplorer/Actions/BaseContainerActions", "Providers/StorageExplorer/Actions/StorageActionsHelper", "Common/UIActions"], function (require, exports, AzureConstants, AzureStorageConstants, BaseContainerActions_1, StorageActionsHelper, UIActions) {
    "use strict";
    var QueueActions = (function (_super) {
        __extends(QueueActions, _super);
        function QueueActions(azureConnection, host, activityLogManager, telemetry) {
            var _this = _super.call(this, host) || this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            _this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(QueueActions.generateQueueSharedAccessSignatureNamespace, _this.generateSharedAccessSignature);
                actionBindingManager.addActionBinding(QueueActions.manageAccessControlListNamespace, _this.manageAccessControlList);
                actionBindingManager.addActionBinding(QueueActions.configureCORSNamespace, _this.configureCORS);
            };
            /**
             * Action to list messages in the given queue.
             */
            _this.peekQueueMessages = function (queueReference, downloadSize) {
                return _this._host.executeOperation("AzureQueues.peekQueueMessages", [queueReference, downloadSize]).catch(function (error) {
                    StorageActionsHelper.showError(_this._host, error);
                });
            };
            /**
             * Retrieve approximate number of messages in the queue
             */
            _this.retrieveApproximateMessageCount = function (queueReference) {
                return _this._host.executeOperation("AzureQueues.retrieveApproximateMessageCount", [queueReference]).catch(function (error) {
                    StorageActionsHelper.showError(_this._host, error);
                });
            };
            /**
             * Action to generate a shared access signature for a queue.
             */
            _this.generateSharedAccessSignature = function (args) {
                var connectionString = args.connectionString;
                var name = args.name;
                return QueueActions.openGenerateSharedAccessSignatureDialog(_this._host, connectionString, name).catch(function (error) {
                    StorageActionsHelper.showError(_this._host, error);
                });
            };
            _this.manageAccessControlList = function (args) {
                var connectionString = args.connectionString;
                var queueName = args.name;
                return QueueActions.openManageAccessControlListDialog(_this._host, connectionString, queueName).catch(function (error) {
                    StorageActionsHelper.showError(_this._host, error);
                });
            };
            _this.configureCORS = function (args) {
                return _this._host.executeOperation("AzureQueues.getCorsRule", [args.connectionString])
                    .then(function (response) {
                    return _this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                        id: AzureConstants.registeredDialogs.corsSettings,
                        parameters: {
                            corsRules: response
                        }
                    });
                })
                    .then(function (newCorsRule) {
                    if (newCorsRule) {
                        return _this._host.executeOperation("AzureQueues.setCorsRule", [args.connectionString, newCorsRule]);
                    }
                    else {
                        _this._telemetry.sendEvent("StorageExplorer.Queue.configureCorsRuleCancelled");
                    }
                })
                    .catch(function (error) {
                    StorageActionsHelper.showError(_this._host, error);
                });
            };
            _this._azureConnection = azureConnection;
            _this._uiActions = new UIActions(_this._host);
            _this._activityLogManager = activityLogManager;
            _this._telemetry = telemetry;
            return _this;
        }
        QueueActions.openGenerateSharedAccessSignatureDialog = function (host, connectionString, queueName) {
            return host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.generateQueueSas,
                parameters: {
                    connectionString: connectionString,
                    queueName: queueName,
                    resourceType: AzureStorageConstants.sasResourceTypes.queue
                }
            }).catch(function (error) {
                StorageActionsHelper.showError(host, error);
            });
        };
        QueueActions.openManageAccessControlListDialog = function (host, connectionString, queueName) {
            return host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.manageQueueAcl,
                parameters: { connectionString: connectionString, queueName: queueName, resourceType: AzureStorageConstants.sasResourceTypes.queue }
            }).catch(function (error) {
                StorageActionsHelper.showError(host, error);
            });
        };
        return QueueActions;
    }(BaseContainerActions_1.default));
    QueueActions.generateQueueSharedAccessSignatureNamespace = "Azure.Actions.Storage.Queue.generateSharedAccessSignature";
    QueueActions.manageAccessControlListNamespace = "Azure.Actions.Storage.Queue.manageAccessControlList";
    QueueActions.configureCORSNamespace = "Azure.Actions.Storage.Queue.configureCORS";
    return QueueActions;
});
