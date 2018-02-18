/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "es6-promise", "Providers/Common/AzureStorageConstants", "Common/ConnectionString", "ActivityLog/StorageExplorer/CopyType", "ActivityLog/StorageExplorer/ExtendedStatus", "ActivityLog/StorageExplorer/RetryableActivity", "Providers/StorageExplorer/Actions/StorageActionsHelper", "Providers/StorageExplorer/ProviderWrappers/TablePW", "Common/TelemetryActions", "../../Common/Utilities"], function (require, exports, ko, rsvp, AzureStorageConstants, ConnectionString_1, CopyType_1, ExtendedStatus, RetryableActivity, StorageActionsHelper, TablePW_1, TelemetryActions, Utilities) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Class to handle the Activity Log lifecycle of table copy operation
     */
    // CONSIDER: This should inherit from ActionBasedActivity
    var TableCopyActivity = (function (_super) {
        __extends(TableCopyActivity, _super);
        function TableCopyActivity(copyType, host, uiActions, tableActions) {
            var _this = 
            // Localize
            _super.call(this, copyType === CopyType_1.default.Copy ? "Copying table..." : "Renaming table...") || this;
            _this._entitiesCopiedCount = 0;
            _this._retryable = ko.observable();
            /**
             * Copies the entities from a table to another in the specified chunk limit.
             */
            _this._copyChunk = function (origTable, destTable, chunkLimit, continuationToken) {
                var entitiesCopied = 0;
                return _this._tableActions.listTableEntitiesSegmented(origTable, continuationToken, chunkLimit, "")
                    .then(function (result) {
                    continuationToken = result.ContinuationToken;
                    entitiesCopied = (result && result.Results) ? result.Results.length : 0;
                    return _this._copyOrMoveEntities(origTable, destTable, result.Results);
                }).then(function () {
                    _this._entitiesCopiedCount += entitiesCopied;
                    // Localize
                    _this.mainMessage(_this._entitiesCopiedCount + " entities completed...");
                    if (continuationToken) {
                        return _this._copyChunk(origTable, destTable, chunkLimit, continuationToken);
                    }
                }).catch(function (err) {
                    // Save the continuation token in the error so we can retry from the chunk
                    // that failed to be copied.
                    err = err || {};
                    err.continuationToken = continuationToken;
                    throw err;
                });
            };
            /**
             * Execute the steps that copies the entities from one table to another.
             */
            _this._executeCopyEntitiesStep = function (sourceTableName, origConnectionString, destTableName, destConnectionString) {
                // Localize
                _this.mainMessage(_this._copyType === CopyType_1.default.Copy ?
                    "Copying entities..." :
                    "Moving entities...");
                var origTable = {
                    connectionString: origConnectionString,
                    tableName: sourceTableName
                };
                var destTable = {
                    connectionString: destConnectionString,
                    tableName: destTableName
                };
                return _this._copyChunk(origTable, destTable, TableCopyActivity.chunkLimit)
                    .then(null, function (err) {
                    return _this._handleStepError(err, function () { return _this._copyChunk(origTable, destTable, TableCopyActivity.chunkLimit, err && err.continuationToken); });
                });
            };
            /**
             * Execute the step that deletes the destination table (if specified)
             */
            _this._executeDeleteSourceTableStep = function (tableName, sourceTableNodeType, connectionString) {
                return _this._tablePW.isTableEmpty(connectionString, tableName)
                    .then(function (isEmpty) {
                    if (!isEmpty) {
                        throw new Error("Could not delete the source table '" + tableName + "' because it is not empty."); // Localize
                    }
                    return _this._tablePW.deleteTableAndRemoveFromTree(connectionString, tableName, sourceTableNodeType);
                })
                    .catch(function (err) {
                    return _this._handleStepError(err, function () { return _this._executeDeleteSourceTableStep(tableName, sourceTableNodeType, connectionString); });
                });
            };
            /**
             * Execute the step that creates the destination table.
             */
            _this._executeCreateTableStep = function (sourceConnectionString, sourceTableName, destConnectionString, destTableName) {
                _this.mainMessage("Creating table...");
                // Close the editor (we can't easily determine if it's open
                //   to the source table, due to the connection string in the clipboard
                //   being different).
                StorageActionsHelper.closeStorageEditor(_this._host, new TelemetryActions(_this._host));
                return _this._tablePW.createTable(destConnectionString, destTableName, false // doNotOpenInEditor
                )
                    .then(function () {
                    // Refresh parent group node
                    // TODO: use _tablePW.createTableAndInsertIntoTree(). If there are lots of tables, refreshing is not the right thing to do
                    var nodeQuery = [
                        { name: "connectionString", value: destConnectionString },
                        { name: "nodeType", value: TableCopyActivity.groupNodeType }
                    ];
                    _this._uiActions.refreshNodeChildren(nodeQuery);
                }, function (err) {
                    return _this._handleStepError(err, function () { return _this._executeCreateTableStep(sourceConnectionString, sourceTableName, destConnectionString, destTableName); });
                });
            };
            /**
             * Handles an error case showing the error message and retry if necessary.
             */
            _this._handleStepError = function (err, retryStep) {
                // Localize
                _this.extendedStatus(ExtendedStatus.Error);
                _this.mainMessage(Utilities.getErrorMessage(err));
                // TODO: telemetry
                if (retryStep) {
                    return new Promise(function (resolve, reject) {
                        _this._retryable(true);
                        _this._retryStep = function () {
                            retryStep().then(resolve, reject);
                        };
                    });
                }
            };
            /**
             * Overrides same function from inheriting class. This will
             * be executed when user clicks on retry link.
             */
            _this.retry = function () {
                _this.extendedStatus(ExtendedStatus.InProgress);
                _this._retryable(false);
                _this._retryStep();
            };
            /**
             * Starts the activity
             */
            _this.start = function (sourceConnectionString, sourceFriendlyAccountName, sourceTableName, sourceTableNodeType, destConnectionString, destTableName) {
                var destFriendlyAccountName = new ConnectionString_1.default(destConnectionString).getFriendlyAccountName();
                _this.extendedStatus(ExtendedStatus.InProgress);
                var sourceDisplayPath = sourceFriendlyAccountName + "/" + sourceTableName;
                var destDisplayPath = destFriendlyAccountName + "/" + destTableName;
                // Localize
                _this.title(_this._copyType === CopyType_1.default.Copy ?
                    "Copying table from '" + sourceDisplayPath + "' to '" + destDisplayPath + "'" :
                    "Renaming table from '" + sourceDisplayPath + "' to '" + destDisplayPath + "'");
                return _this._executeCreateTableStep(sourceConnectionString, sourceTableName, destConnectionString, destTableName)
                    .then(function () {
                    return _this._executeCopyEntitiesStep(sourceTableName, sourceConnectionString, destTableName, destConnectionString);
                }).then(function () {
                    if (_this._deleteTableAfterCopy) {
                        return _this._executeDeleteSourceTableStep(sourceTableName, sourceTableNodeType, sourceConnectionString);
                    }
                }).then(function () {
                    // Localize
                    _this.title(_this._copyType === CopyType_1.default.Copy ?
                        "Copied table from '" + sourceDisplayPath + "' to '" + destDisplayPath + "'" :
                        "Renamed table from '" + sourceDisplayPath + "' to '" + destDisplayPath + "'");
                    _this.mainMessage(_this._entitiesCopiedCount + " entities completed.");
                    _this.extendedStatus(ExtendedStatus.Success);
                }, _this._handleStepError);
            };
            _this._host = host;
            _this._tablePW = new TablePW_1.default(_this._host);
            _this._copyType = copyType;
            _this._deleteTableAfterCopy = (copyType === CopyType_1.default.Rename);
            _this._uiActions = uiActions;
            _this._tableActions = tableActions;
            return _this;
        }
        TableCopyActivity.prototype._copyOrMoveEntities = function (sourceTable, destTable, entities) {
            var _this = this;
            return this._tablePW.addEntities(destTable.connectionString, destTable.tableName, entities)
                .then(function () {
                if (_this._copyType === CopyType_1.default.Rename) {
                    // Delete from the source table
                    return _this._tablePW.deleteEntities(sourceTable.connectionString, sourceTable.tableName, entities);
                }
            });
        };
        TableCopyActivity.prototype._canCancelCore = function () {
            // Disable cancel until the whole experience is working properly.
            // return super._canCancelCore() && this._cancelable();
            return false;
        };
        /**
         * Overrides same function from inheriting class. This will
         * return true when the activity can be retryable.
         */
        TableCopyActivity.prototype._canRetryCore = function () {
            // Disable retry until the whole experience is working properly
            // return super._canRetryCore() && this._retryable();
            return false;
        };
        return TableCopyActivity;
    }(RetryableActivity));
    TableCopyActivity.chunkLimit = 1000;
    TableCopyActivity.groupNodeType = AzureStorageConstants.nodeTypes.tableGroup;
    return TableCopyActivity;
});
