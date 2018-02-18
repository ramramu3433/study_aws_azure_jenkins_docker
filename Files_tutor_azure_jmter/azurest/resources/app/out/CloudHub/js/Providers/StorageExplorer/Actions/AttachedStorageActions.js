/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "Common/AzureStorageUtilities", "Providers/Common/StorageExplorer/BaseStorageActions", "Providers/Common/AzureConstants", "Providers/Common/AzureStorageConstants", "Common/Errors", "Common/SASResourceType", "Providers/StorageExplorer/Actions/StorageActionsHelper"], function (require, exports, _string, AzureStorageUtilities, BaseStorageActions_1, AzureConstants, AzureStorageConstants, Errors, SASResourceType_1, StorageActionsHelper) {
    "use strict";
    var AttachedStorageActions = (function (_super) {
        __extends(AttachedStorageActions, _super);
        function AttachedStorageActions(azureConnection, host, activityLogManager, telemetry) {
            var _this = _super.call(this, azureConnection, host, telemetry) || this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            _this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AttachedStorageActions.detachStorageAccountNamespace, _this.detachStorageAccount);
                actionBindingManager.addActionBinding(AttachedStorageActions.detachStorageServiceSASNamespace, _this.detachStorageServiceSAS);
                actionBindingManager.addActionBinding(AttachedStorageActions.generateSharedAccessSignatureNamespace, _this.generateSharedAccessSignature);
            };
            _this.detachStorageAccount = function (args) {
                var accountName = args.storageAccountName;
                var connectionString = args.connectionString;
                var isAttachedAccount = args.isAttachedAccount;
                var endpointsDomain = args.endpointsDomain;
                var connectionType = args.connectionType;
                if (!isAttachedAccount) {
                    return;
                }
                // Localize
                var confirmation = _string.sprintf("Are you sure you want to detach the storage account \"%s\"?", accountName);
                return StorageActionsHelper.confirmDelete(_this._host, confirmation)
                    .then(function (response) {
                    if (response) {
                        var accountToDetach = {
                            accountName: accountName,
                            endpointsDomain: endpointsDomain,
                            connectionType: connectionType
                        };
                        AzureStorageUtilities.deleteStoredAccount(_this._host, accountToDetach);
                        var nodeQuery = [
                            { name: "connectionString", value: connectionString },
                            { name: "isAttachedAccount", value: isAttachedAccount },
                            { name: "name", value: accountName }
                        ];
                        _this._uiActions.deleteNode(nodeQuery);
                    }
                });
            };
            _this.detachStorageServiceSAS = function (args) {
                var resourceName = args.name;
                var connectionString = args.connectionString;
                var nodeType = args.nodeType;
                var confirmation = "Are you sure you want to detach the resource \"" + resourceName + "\"?"; // Localize
                return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: confirmation, iconType: "critical" }])
                    .then(function (response) {
                    if (response) {
                        var storageTypeToClose;
                        var sasResourceGroupToRefresh;
                        var sasResourceTypeToDelete;
                        switch (nodeType) {
                            case AzureStorageConstants.nodeTypes.sasBlobContainer:
                                storageTypeToClose = 0 /* blobContainer */;
                                sasResourceGroupToRefresh = AzureStorageConstants.nodeTypes.sasBlobContainerGroup;
                                sasResourceTypeToDelete = SASResourceType_1.default.blob;
                                break;
                            case AzureStorageConstants.nodeTypes.sasFileShare:
                                storageTypeToClose = 1 /* fileShare */;
                                sasResourceGroupToRefresh = AzureStorageConstants.nodeTypes.sasFileShareGroup;
                                sasResourceTypeToDelete = SASResourceType_1.default.file;
                                break;
                            case AzureStorageConstants.nodeTypes.sasQueue:
                                storageTypeToClose = 3 /* queue */;
                                sasResourceGroupToRefresh = AzureStorageConstants.nodeTypes.sasQueueGroup;
                                sasResourceTypeToDelete = SASResourceType_1.default.queue;
                                break;
                            case AzureStorageConstants.nodeTypes.sasTable:
                                storageTypeToClose = 2 /* table */;
                                sasResourceGroupToRefresh = AzureStorageConstants.nodeTypes.sasTableGroup;
                                sasResourceTypeToDelete = SASResourceType_1.default.table;
                                break;
                            default:
                                throw new Errors.ArgumentOutOfRangeError("nodeType");
                        }
                        AzureStorageUtilities.deleteStorageSASToken(_this._host, sasResourceTypeToDelete, resourceName);
                        StorageActionsHelper.closeTargetStorageEditor(_this._host, _this._telemetry, connectionString, storageTypeToClose, resourceName);
                        _this._uiActions.refreshNodeChildren([{ name: "nodeType", value: sasResourceGroupToRefresh }]);
                    }
                });
            };
            _this.generateSharedAccessSignature = function (args) {
                var accountName = args.name;
                var connectionString = args.connectionString;
                var accountKind = args.accountKind;
                var dialogParameters = {
                    id: AzureConstants.registeredDialogs.generateAccountSas,
                    parameters: {
                        connectionString: connectionString,
                        accountName: accountName,
                        resourceType: AzureStorageConstants.sasResourceTypes.account,
                        accountKind: accountKind
                    }
                };
                return _this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", dialogParameters)
                    .catch(function (error) {
                    StorageActionsHelper.showError(_this._host, error);
                });
            };
            _this._activityLogManager = activityLogManager;
            return _this;
        }
        return AttachedStorageActions;
    }(BaseStorageActions_1.default));
    AttachedStorageActions.detachStorageAccountNamespace = "Azure.Actions.Storage.detachStorageAccount";
    AttachedStorageActions.detachStorageServiceSASNamespace = "Azure.Actions.Storage.detachStorageServiceSAS";
    AttachedStorageActions.generateSharedAccessSignatureNamespace = "Azure.Actions.Storage.generateSharedAccessSignature";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AttachedStorageActions;
});
