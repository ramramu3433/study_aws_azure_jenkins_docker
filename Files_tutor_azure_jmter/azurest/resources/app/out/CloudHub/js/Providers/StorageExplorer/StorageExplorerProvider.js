/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "es6-promise", "Providers/Common/AzureStorageConstants", "Common/AzureStorageUtilities", "Common/ActivityLogManager", "Providers/Common/AzureConnection", "../Common/AzureConstants", "Providers/Common/BaseProvider", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Common/ConnectionString", "Common/SASResourceType", "Common/SASUri", "Common/TelemetryActions", "Common/UIActions", "Providers/StorageExplorer/Actions/BlobActions", "Providers/StorageExplorer/Actions/FileActions", "Providers/StorageExplorer/Actions/QueueActions", "Providers/StorageExplorer/Actions/TableActions", "Providers/StorageExplorer/Actions/AttachedStorageActions", "Providers/StorageExplorer/Actions/StorageAccountActions", "Providers/StorageExplorer/Actions/QuickAccessActions", "Providers/StorageExplorer/Producers/QuickAccessProducer"], function (require, exports, es6_promise_1, AzureStorageConstants, AzureStorageUtilities, ActivityLogManager, AzureConnection, AzureConstants, BaseProvider, CloudExplorerActions, ConnectionString_1, SASResourceType_1, SASUri_1, TelemetryActions, UIActions, BlobActions, FileActions, QueueActions, TableActions, AttachedStorageActions_1, StorageAccountActions_1, QuickAccessActions_1, QuickAccessProducer_1) {
    "use strict";
    /**
     * A provider for all Storage Explorer functionality inside the Cloud Explorer pane
     * (e.g., creating blob containers, copying/pasting blob containers)
     */
    var StorageExplorerProvider = (function (_super) {
        __extends(StorageExplorerProvider, _super);
        function StorageExplorerProvider() {
            var _this = _super.call(this, "StorageExplorer.Storage") || this;
            _this._uiActions = new UIActions(_this.host);
            _this._telemetryActions = new TelemetryActions(_this.host);
            var activityLogManager = new ActivityLogManager(_this.host, _this._telemetryActions);
            _this._azureConnection = new AzureConnection(_this.host);
            new BlobActions(_this._azureConnection, _this.host, activityLogManager, _this._telemetryActions).registerBindings(_this);
            new FileActions(_this._azureConnection, _this.host, activityLogManager, _this._telemetryActions).registerBindings(_this);
            new TableActions(_this._azureConnection, _this.host, activityLogManager, _this._telemetryActions).registerBindings(_this);
            new QueueActions(_this._azureConnection, _this.host, activityLogManager, _this._telemetryActions).registerBindings(_this);
            new StorageAccountActions_1.default(_this.host, _this._telemetryActions).registerBindings(_this);
            new QuickAccessActions_1.default(_this.host, _this._telemetryActions).registerBindings(_this);
            _this._attachedStorageActions = new AttachedStorageActions_1.default(_this._azureConnection, _this.host, activityLogManager, _this._telemetryActions);
            _this._attachedStorageActions.registerBindings(_this);
            _this.addActionBinding("StorageExplorer.OpenConnectDialog", _this._openConnectDialog);
            new QuickAccessProducer_1.default(_this.host, _this._telemetryActions).registerBindings(_this);
            return _this;
        }
        StorageExplorerProvider.prototype._openConnectDialog = function (args) {
            var _this = this;
            var startPage = (args && args.startPage) || "default-panel";
            var chainSignInPromise = (args && !!args.chainSignInPromise);
            this._telemetryActions.sendEvent("StorageExplorer.ConnectDialog.open", { "startPage": startPage });
            return this.host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.connect,
                parameters: { startPage: startPage }
            }).then(function (parameters) {
                var promise;
                var connectionType;
                if (!parameters) {
                    // The user canceled.
                    promise = es6_promise_1.Promise.resolve();
                    connectionType = "canceled";
                }
                else if (parameters.accountAdded !== undefined && parameters.accountAdded !== null) {
                    // if this is the result of a sign in attempt
                    if (parameters.accountAdded) {
                        // sign in was successful
                        if (chainSignInPromise) {
                            // Only chain the sign-in promise if the call is from the "first run" connect dialog.
                            promise = _this.host.executeOperation("Azure.UserAccounts.getUserAccounts")
                                .then(function (accounts) {
                                // If the user signed in successfully from the "first run" connect dialog, we expect exactly one account.
                                if (accounts && accounts.length === 1) {
                                    return _this._azureConnection.getSubscriptions(accounts[0]);
                                }
                                return es6_promise_1.Promise.resolve([]);
                            })
                                .then(function (subscriptions) {
                                // If any subscriptions found, select them.
                                if (subscriptions.length !== 0) {
                                    return _this.host.executeOperation("Azure.setSelectedSubscriptions", [{ subscriptions: subscriptions }]);
                                }
                            })
                                .then(function () { return _this.host.executeOperation("CloudExplorer.Actions.refreshPanel"); });
                        }
                        else {
                            // If not chaining the promise, then go to the account filter panel
                            promise = _this.host.executeOperation("CloudExplorer.Actions.openPanel", [{
                                    panelInfo: {
                                        displayName: {
                                            value: "Settings"
                                        },
                                        name: "Settings",
                                        panelNamespace: "azureFilterPanel",
                                        providerNamespace: "Azure.FilterPanel"
                                    }
                                }]);
                        }
                    }
                    else if (!!parameters.error) {
                        _this.host.executeOperation(CloudExplorerActions.showInfobarMessageNamespace, [{ message: "Unable to sign in: " + parameters.error }]);
                    }
                    connectionType = "signIn";
                }
                else if (parameters.connectionType === 3 /* key */ ||
                    parameters.connectionType === 1 /* sasAttachedAccount */) {
                    // The user wants to connect to a Storage Account using key or sas
                    promise = _this._addStorageAccount(parameters.connectionString, parameters.accountName, parameters.connectionType);
                    connectionType = parameters.connectionType === 3 /* key */ ?
                        "accountKey" :
                        "accountSAS";
                }
                else if (parameters.connectionType === 4 /* sasAttachedService */) {
                    // The user wants to connect to a Storage Service using SAS
                    promise = _this._addServiceSAS(parameters.sasUri);
                    connectionType = "serviceSAS";
                }
                else {
                    // Not expected parameters
                    promise = es6_promise_1.Promise.reject(new Error("Unnexpected connection type from Connect Dialog."));
                }
                _this._telemetryActions.sendEvent("StorageExplorer.ConnectDialog.closed", { "connectionType": connectionType });
                return promise;
            });
        };
        StorageExplorerProvider.prototype._addServiceSAS = function (sasUri) {
            var _this = this;
            var parsedConnectionString = ConnectionString_1.default.createFromSASUri(sasUri);
            var parsedSASUri = new SASUri_1.default(sasUri);
            var resourceType = SASResourceType_1.default.fromString(parsedSASUri.resourceType);
            var nodeType;
            var editorNamespace;
            switch (resourceType) {
                case SASResourceType_1.default.blob:
                    nodeType = AzureStorageConstants.nodeTypes.sasBlobContainerGroup;
                    editorNamespace = AzureStorageConstants.editorNamespace.blobContainer;
                    break;
                case SASResourceType_1.default.file:
                    nodeType = AzureStorageConstants.nodeTypes.sasFileShareGroup;
                    editorNamespace = AzureStorageConstants.editorNamespace.fileShare;
                    break;
                case SASResourceType_1.default.queue:
                    nodeType = AzureStorageConstants.nodeTypes.sasQueueGroup;
                    editorNamespace = AzureStorageConstants.editorNamespace.queue;
                    break;
                case SASResourceType_1.default.table:
                    nodeType = AzureStorageConstants.nodeTypes.sasTableGroup;
                    editorNamespace = AzureStorageConstants.editorNamespace.table;
                    break;
            }
            var nodeQuery = [{ name: "nodeType", value: nodeType }];
            var serviceSasStorageNodeQuery = [{ name: "nodeType", value: AzureConstants.resourceTypes.SASStorage }];
            // Save the service to our backend, then tell the appropriate parent node
            // to load it by finding the account's node's ID and then adding it
            var serviceNodeUid = "";
            var connectionType = 4 /* sasAttachedService */;
            return AzureStorageUtilities.saveStorageSASToken(this.host, resourceType, parsedSASUri.resourceName, parsedSASUri.accountUri, parsedSASUri.sasToken.token)
                .then(function () {
                // Expand "(Local and Attached)"
                return _this._uiActions.expand([{ name: "id", value: StorageExplorerProvider.ExternalSubscriptionId }]);
            })
                .then(function () {
                // Expand "Storage Accounts"
                return _this._uiActions.expand([{ name: "type", value: StorageExplorerProvider.ExternalStorageAccountParentNodeType }]);
            })
                .then(function () {
                // Expand "(SAS-Attached Services)"
                return _this._uiActions.expand(serviceSasStorageNodeQuery);
            }).then(function () {
                // now that the parent node is visible, we can look for the account child
                return _this._uiActions.findChildByName(nodeQuery, parsedSASUri.resourceName);
            })
                .then(function (result) {
                // save that child's UID and expand the parent node
                serviceNodeUid = result[0].uids[0];
                return _this._uiActions.expand(nodeQuery);
            }).then(function (_) {
                // tell the parent node to add the node corresponding to the uid we got back
                return _this._uiActions.addChildByUid(nodeQuery, serviceNodeUid);
            }).then(function (_) {
                return _this.host.executeOperation("Azure.Actions.Storage.showEditor", [{
                        editorNamespace: editorNamespace,
                        connectionString: parsedConnectionString.toString(),
                        name: parsedSASUri.resourceName,
                        connectionType: connectionType
                    }]);
            });
        };
        StorageExplorerProvider.prototype._addStorageAccount = function (connectionString, accountName, connectionType) {
            var _this = this;
            var parsedConnectionString = new ConnectionString_1.default(connectionString);
            var account = {
                accountName: accountName,
                connectionType: connectionType,
                endpointsDomain: parsedConnectionString.getEndpointsDomain(),
                useHttp: parsedConnectionString.getDefaultEndpointsProtocol() === "http"
            };
            if (connectionType === 3 /* key */) {
                account.accountKey = parsedConnectionString.values[AzureStorageConstants.connectionStringKeys.accountKey];
            }
            else if (connectionType === 1 /* sasAttachedAccount */) {
                account.connectionString = connectionString;
            }
            // Save the storage account to our backend, then tell the Storage Accounts node
            // to load it by finding the account's node's ID and then adding it
            var storageAccountNodeUid = "";
            return AzureStorageUtilities.saveStorageAccount(this.host, account)
                .then(function () {
                // expand the "(Local and Attached)" node
                return _this._uiActions.expand([{ name: "id", value: StorageExplorerProvider.ExternalSubscriptionId }]);
            })
                .then(function () {
                // now that the "Storage Accounts" node is visible, we can look for the account child
                return _this._uiActions.findChildByName([{ name: "type", value: StorageExplorerProvider.ExternalStorageAccountParentNodeType }], account.accountName);
            })
                .then(function (result) {
                // save that child's UID and expand the "Storage Accounts" node
                storageAccountNodeUid = result[0].uids[0];
                return _this._uiActions.expand([{ name: "type", value: StorageExplorerProvider.ExternalStorageAccountParentNodeType }]);
            })
                .then(function () {
                // tell the "Storage Accounts" node to add the node corresponding to the uid we got back
                return _this._uiActions.addChildByUid([{ name: "type", value: StorageExplorerProvider.ExternalStorageAccountParentNodeType }], storageAccountNodeUid);
            });
        };
        return StorageExplorerProvider;
    }(BaseProvider));
    StorageExplorerProvider.ExternalStorageAccountParentNodeType = "ResourceTypeGroupNode-ResourceType:External/Microsoft.Storage/storageAccounts";
    StorageExplorerProvider.ExternalSubscriptionId = "Azure.ExternalSubscription";
    return StorageExplorerProvider;
});
