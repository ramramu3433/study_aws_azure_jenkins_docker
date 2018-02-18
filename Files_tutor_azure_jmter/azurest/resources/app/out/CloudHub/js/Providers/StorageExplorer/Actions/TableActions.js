/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Common/AzureStorageConstants", "Common/AzureStorageUtilities", "Providers/StorageExplorer/Actions/BaseContainerActions", "Common/ConnectionString", "ActivityLog/StorageExplorer/CopyType", "Common/Debug", "Providers/StorageExplorer/Actions/StorageActionsHelper", "Common/SASResourceType", "Providers/StorageExplorer/ProviderWrappers/TablePW", "Common/UIActions", "StorageExplorer/ActivityLogModels/TableCopyActivity"], function (require, exports, AzureConstants, AzureStorageConstants, AzureStorageUtilities, BaseContainerActions_1, ConnectionString_1, CopyType_1, Debug, StorageActionsHelper, SASResourceType_1, TablePW_1, UIActions, TableCopyActivity) {
    "use strict";
    var TableActions = (function (_super) {
        __extends(TableActions, _super);
        function TableActions(azureConnection, host, activityLogManager, telemetry) {
            var _this = _super.call(this, host) || this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            _this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(TableActions.copyTableToClipboardNamespace, _this.copyTableToClipboard);
                actionBindingManager.addActionBinding(TableActions.generateTableSharedAccessSignatureNamespace, _this.generateSharedAccessSignature);
                actionBindingManager.addActionBinding(TableActions.manageAccessControlListNamespace, _this.manageAccessControlList);
                actionBindingManager.addActionBinding(TableActions.pasteTableNamespace, _this.pasteTable);
                actionBindingManager.addActionBinding(TableActions.configureCORSNamespace, _this.configureCORS);
                actionBindingManager.addActionBinding(TableActions.renameTableNamespace, _this.renameTable);
            };
            /**
             * Action to list entities in the given table.
             */
            _this.listTableEntitiesSegmented = function (tableReference, continuationToken, downloadSize, tableQuery) {
                return _this._tablePW.listEntitiesSegmented(tableReference.connectionString, tableReference.tableName, continuationToken, downloadSize, tableQuery);
            };
            _this.renameTable = function (args) {
                var sourceConnectionString = args.connectionString;
                var sourceTableName = args.name;
                var sourceTableNodeType = args.nodeType;
                return _this._getNewContainerNameFromUser(sourceConnectionString, sourceTableName)
                    .then(function (newName) {
                    if (newName) {
                        var activity = new TableCopyActivity(CopyType_1.default.Rename, _this._host, _this._uiActions, _this);
                        activity.initialize();
                        activity.addToActivityLog(_this._activityLogManager);
                        return activity.start(sourceConnectionString, new ConnectionString_1.default(sourceConnectionString).getAccountName(), sourceTableName, sourceTableNodeType, sourceConnectionString, // Copy to same location
                        newName);
                    }
                }).catch(function (error) {
                    StorageActionsHelper.showError(_this._host, error);
                });
            };
            /**
             * Action to generate a shared access signature for a table.
             */
            _this.generateSharedAccessSignature = function (args) {
                var connectionString = args.connectionString;
                var name = args.name;
                return TableActions.openGenerateSharedAccessSignatureDialog(_this._host, connectionString, name);
            };
            /**
             * Copies to the clipboard the serialized necesary information
             * to copy a table. This information will be used when the paste
             * action is executed.
             */
            _this.copyTableToClipboard = function (args) {
                var tableName = args.name;
                var connectionString = args.connectionString;
                var tableUrl = args.url;
                // TODO: Paste doesn't need the SAS string to be in clipboard data because it's placed into the connection string
                return _this.getSASTokenForCopy(tableName, connectionString)
                    .then(function (sasToken) {
                    var accountUri = AzureStorageUtilities.accountUriFromContainerUri(tableUrl, tableName);
                    var resource = {
                        resourceName: tableName,
                        accountUri: accountUri,
                        sasToken: sasToken
                    };
                    var sasConnectionString = ConnectionString_1.default.createFromSAS(SASResourceType_1.default.table, resource);
                    var friendlyAccountName = new ConnectionString_1.default(connectionString).getFriendlyAccountName();
                    // Set the clipboard data
                    var clipboardData = {
                        connectionString: sasConnectionString,
                        tableName: tableName,
                        accountUri: accountUri,
                        sasToken: sasToken,
                        accountName: friendlyAccountName
                    };
                    return _this._host.executeOperation("Environment.clipboardSetData", [AzureStorageConstants.TableClipboardFormat, clipboardData]);
                });
            };
            /**
             * Pastes from table information contained in the clipboard to the table information given
             * by its parameters.
             */
            _this.pasteTable = function (args) {
                var destConnectionString = args.connectionString;
                // TODO: _canCopyContainerProperties and ask user if can copy without metadata when in SAS, like blob container/fileshare,
                // once we support copying metadata for tables
                return _this._host.executeOperation("Environment.clipboardGetData", [AzureStorageConstants.TableClipboardFormat])
                    .then(function (clipboardData) {
                    // If the result is undefined the data in the clipboard wasn't of the expected format.
                    if (!clipboardData) {
                        // Localize
                        throw "The clipboard content is invalid";
                    }
                    var sourceTableName = clipboardData.tableName;
                    var sourceConnectionString = clipboardData.connectionString;
                    var sourceFriendlyAccountName = clipboardData.accountName;
                    var activity = new TableCopyActivity(CopyType_1.default.Copy, _this._host, _this._uiActions, _this);
                    activity.initialize();
                    activity.addToActivityLog(_this._activityLogManager);
                    return activity.start(sourceConnectionString, sourceFriendlyAccountName, sourceTableName, null, // sourceTableNodeType
                    destConnectionString, sourceTableName // Paste to same table name
                    );
                });
            };
            /**
             * Gets a SAS token for a table
             */
            _this.getSASTokenForCopy = function (tableName, sourceConnectionString) {
                var connectionString = new ConnectionString_1.default(sourceConnectionString);
                if (connectionString.containsKeyAndName(true /*includeEmulator*/)) {
                    // Get a SAS token for the source container
                    var start = StorageActionsHelper.getSasStartTimeForCopy();
                    var expiry = StorageActionsHelper.getSasExpiryForCopy();
                    // Use read permissions
                    var permission = "r";
                    return _this._host.executeOperation("AzureTables.generateSharedAccessSignature", [sourceConnectionString, tableName, expiry, start, permission])
                        .then(function (result) { return result.sasToken; });
                }
                else {
                    // Use the SAS in the connection string
                    Debug.assert(function () { return connectionString.containsSAS(); }, "Connection string should contain key/name/emulator or SAS");
                    return Promise.resolve(connectionString.getSAS());
                }
            };
            _this.manageAccessControlList = function (args) {
                var connectionString = args.connectionString;
                var tableName = args.name;
                return TableActions.openManageAccessControlListDialog(_this._host, connectionString, tableName);
            };
            _this.configureCORS = function (args) {
                return _this._tablePW.getCorsRules(args.connectionString)
                    .then(function (response) {
                    return _this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                        id: AzureConstants.registeredDialogs.corsSettings,
                        parameters: {
                            corsRules: response
                        }
                    });
                })
                    .then(function (newCorsRules) {
                    if (newCorsRules) {
                        return _this._tablePW.setCorsRules(args.connectionString, newCorsRules);
                    }
                    else {
                        _this._telemetry.sendEvent("StorageExplorer.Table.configureCorsRuleCancelled");
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
            _this._tablePW = new TablePW_1.default(host);
            return _this;
        }
        TableActions.prototype._getNewContainerNameFromUser = function (connectionString, originalName) {
            var _this = this;
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.rename,
                parameters: {
                    originalName: originalName,
                    resourceType: "table",
                    isCaseSensitive: false
                }
            }).then(function (outputs) {
                if (outputs) {
                    var newName = outputs.newName;
                    if (newName === originalName) {
                        return null;
                    }
                    return _this._tablePW.doesTableExist(connectionString, newName)
                        .then(function (exists) {
                        if (exists) {
                            // Localize
                            throw new Error("A table with that name already exists.");
                        }
                        return newName;
                    });
                }
            });
        };
        TableActions.openGenerateSharedAccessSignatureDialog = function (host, connectionString, tableName) {
            return host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.generateTableSas,
                parameters: {
                    connectionString: connectionString,
                    tableName: tableName,
                    resourceType: AzureStorageConstants.sasResourceTypes.table
                }
            }).catch(function (error) {
                StorageActionsHelper.showError(host, error);
            });
        };
        TableActions.openManageAccessControlListDialog = function (host, connectionString, tableName) {
            return host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.manageTableAcl,
                parameters: { connectionString: connectionString, tableName: tableName, resourceType: AzureStorageConstants.sasResourceTypes.table }
            }).catch(function (error) {
                StorageActionsHelper.showError(host, error);
            });
        };
        return TableActions;
    }(BaseContainerActions_1.default));
    TableActions.copyTableToClipboardNamespace = "Azure.Actions.Storage.Table.copyTableToClipboard";
    TableActions.generateTableSharedAccessSignatureNamespace = "Azure.Actions.Storage.Table.generateSharedAccessSignature";
    TableActions.manageAccessControlListNamespace = "Azure.Actions.Storage.Table.manageAccessControlList";
    TableActions.pasteTableNamespace = "Azure.Actions.Storage.Table.pasteTable";
    TableActions.configureCORSNamespace = "Azure.Actions.Storage.Table.configureCORS";
    TableActions.renameTableNamespace = "Azure.Actions.Storage.Table.renameTable";
    return TableActions;
});
