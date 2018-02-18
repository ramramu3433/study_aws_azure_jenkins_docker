/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "underscore", "es6-promise", "Common/Continuator", "ActivityLog/StorageExplorer/ExtendedStatus", "ActivityLog/StorageExplorer/RetryableActivity", "StorageExplorer/Common/StorageExplorerUtilities", "Providers/StorageExplorer/ProviderWrappers/TablePW", "Common/Utilities"], function (require, exports, ko, _, es6_promise_1, Continuator, ExtendedStatus, RetryableActivity, StorageExplorerUtilities, TablePW_1, Utilities) {
    "use strict";
    /**
     * Represents a handle in the Activity Log to a table export operation.
     */
    // CONSIDER: This should inherit from ActionBasedActivity
    var TableExportActivity = (function (_super) {
        __extends(TableExportActivity, _super);
        function TableExportActivity(host, telemetry, filePath, shouldExportTypeAnnotations, tableReference, query) {
            if (query === void 0) { query = {}; }
            var _this = _super.call(this, "Exporting entities...") || this;
            _this._retryable = ko.observable();
            /**
             * @override
             */
            _this.retry = function () {
                _this.extendedStatus(ExtendedStatus.InProgress);
                _this._retryable(false);
                _this._retry();
            };
            _this._host = host;
            _this._tablePW = new TablePW_1.default(host);
            _this._telemetry = telemetry;
            _this._filePath = filePath;
            _this._tableReference = tableReference;
            _this._query = query;
            _this._properties = [];
            _this._entitiesExported = 0;
            _this._entitiesToExport = 0;
            _this._shouldExportTypeAnnotations = shouldExportTypeAnnotations;
            return _this;
        }
        /**
         * Starts the activity
         */
        TableExportActivity.prototype.start = function (accountName) {
            var _this = this;
            this.extendedStatus(ExtendedStatus.InProgress);
            this.title(this.getInProgressTitle(accountName));
            return this._getPropertyNames()
                .then(function () { return _this._writePropertiesToFile(); })
                .then(function () { return _this._exportEntities(); })
                .then(function () {
                _this.extendedStatus(ExtendedStatus.Success);
                _this.title(_this.getFinishedTitle(accountName)); // Localize
                _this.mainMessage("");
                _this.progressMessage(_this._entitiesExported + " of " + _this._entitiesToExport + " entities exported"); // Localize
                _this._addOrRemoveAction(TableExportActivity.openInFolderAction, function () { return _this._host.executeOperation("Environment.showItemInFolder", [_this._filePath]); }, 
                /*add*/ true);
            })
                .catch(function (error) {
                _this._handleError(error);
            });
        };
        TableExportActivity.prototype.getInProgressTitle = function (accountName) {
            return "Exporting entities in table '" + accountName + "/" + this._tableReference.tableName + "' to '" + this._filePath + "'"; // Localize
        };
        TableExportActivity.prototype.getFinishedTitle = function (accountName) {
            return "Exported entities in table '" + accountName + "/" + this._tableReference.tableName + "' to '" + this._filePath + "'"; // Localize
        };
        /**
         * @override
         */
        TableExportActivity.prototype._canCancelCore = function () {
            // Disable cancel until the whole experience is working properly.
            return false; // return super._canCancelCore() && this._cancelable();
        };
        /**
         * @override
         */
        TableExportActivity.prototype._canRetryCore = function () {
            // Disable retry until the whole experience is working properly.
            return false; // return super._canRetryCore() && this._retryable();
        };
        Object.defineProperty(TableExportActivity.prototype, "progressPercentage", {
            get: function () {
                if (this._entitiesToExport === 0) {
                    return 1;
                }
                else {
                    return this._entitiesExported / this._entitiesToExport;
                }
            },
            enumerable: true,
            configurable: true
        });
        TableExportActivity.prototype._getPropertyNames = function (continuationToken) {
            var _this = this;
            if (continuationToken === void 0) { continuationToken = null; }
            this.mainMessage("Exporting entities..."); // Localize
            // Scan the table for property names.
            // We need to know the names of all the properties in the table before we can start writing to the file.
            // To get all the property names, we have to read every single entity from the table.
            // Because of that, we will have to read the entire table a second time to get the property values.
            return Continuator.runAllContinuations(function (continuationToken) {
                return _this._getPropertyNameBatch(continuationToken).then(function (results) {
                    _this._entitiesToExport += results.count;
                    _this.progressMessage(_this._entitiesToExport + " discovered"); // Localize
                    return results.continuationToken;
                });
            });
        };
        /**
         * Gets a single batch of property names and adds them to this._properties.
         * @returns Number of entities discovered in this batch
         */
        TableExportActivity.prototype._getPropertyNameBatch = function (continuationToken) {
            var _this = this;
            return this._tablePW.listEntitiesSegmented(this._tableReference.connectionString, this._tableReference.tableName, continuationToken, TableExportActivity.batchSize, this._query)
                .then(function (result) {
                result.Results.forEach(function (entity) {
                    for (var propertyName in entity) {
                        if (propertyName === ".metadata") {
                            continue;
                        }
                        if (!_this._properties.some(function (value) { return value.name === propertyName; })) {
                            _this._properties.push({ name: propertyName, isTypeAnnotation: false });
                            if (_this._shouldExportTypeAnnotations &&
                                StorageExplorerUtilities.isTableCustomProperty(propertyName)) {
                                _this._properties.push({ name: propertyName, isTypeAnnotation: true });
                            }
                        }
                    }
                });
                return {
                    continuationToken: result.ContinuationToken,
                    count: result.Results.length
                };
            });
        };
        // Writes the header of property names to the file
        TableExportActivity.prototype._writePropertiesToFile = function () {
            var columnNames = this._properties.map(function (property) { return property.isTypeAnnotation ?
                StorageExplorerUtilities.getTableTypeAnnotation(property.name) :
                property.name; });
            return this._host.executeOperation("Environment.writeCsvToFile", [this._filePath, [columnNames]]);
        };
        TableExportActivity.prototype._exportEntities = function () {
            var _this = this;
            this.mainMessage("Exporting entities...");
            return Continuator.runAllContinuations(function (continuationToken) {
                return _this._exportEntityBatch(continuationToken).then(function (results) {
                    _this._entitiesExported += results.count;
                    _this.progress(_this.progressPercentage);
                    _this.progressMessage(_this._entitiesExported + " of " + _this._entitiesToExport + " entities exported"); // Localize
                    return results.continuationToken;
                });
            });
        };
        /**
         * Exports a batch of entities and returns the count of entities in the batch
         */
        TableExportActivity.prototype._exportEntityBatch = function (continuationToken) {
            var _this = this;
            return this._tablePW.listEntitiesSegmented(this._tableReference.connectionString, this._tableReference.tableName, continuationToken, TableExportActivity.batchSize, this._query)
                .then(function (result) {
                var data = result.Results.map(function (entity) { return _this._convertEntityToArray(entity); });
                return {
                    continuationToken: result.ContinuationToken,
                    data: data
                };
            })
                .then(function (result) {
                return _this._host.executeOperation("Environment.appendCsvToFile", [_this._filePath, result.data])
                    .then(function () {
                    return {
                        continuationToken: result.continuationToken,
                        count: result.data.length
                    };
                });
            });
        };
        /**
         * Handles an error case showing the error message and retry if necessary.
         */
        TableExportActivity.prototype._handleError = function (error, retryStep) {
            var _this = this;
            this.extendedStatus(ExtendedStatus.Error);
            this.mainMessage("Failed: " + Utilities.getErrorMessage(error)); // Localize
            this._telemetry.sendError({
                name: "StorageExplorer.Table.importEntitiesFailed",
                error: error
            });
            if (retryStep) {
                this._retryable(true);
                return new es6_promise_1.Promise(function (resolve, reject) {
                    _this._retry = function () {
                        retryStep().then(resolve, reject);
                    };
                });
            }
        };
        TableExportActivity.prototype._convertEntityToArray = function (entity) {
            var result = [];
            this._properties.forEach(function (property) {
                if (property.isTypeAnnotation) {
                    // Include the type of corresponding property value in the result.
                    // Use an empty string if the entity has no corresponding property.
                    result.push(entity[property.name] && !_.isUndefined(entity[property.name].$) ?
                        entity[property.name].$ :
                        "");
                }
                else {
                    // Include the property value in the result.
                    // Use an empty string to represent a null value (undefined is not safe).
                    result.push(entity[property.name] && !_.isNull(entity[property.name]._) ?
                        String(entity[property.name]._) :
                        "");
                }
            });
            return result;
        };
        return TableExportActivity;
    }(RetryableActivity));
    TableExportActivity.batchSize = 1000;
    TableExportActivity.openInFolderAction = "Show in folder"; // Localize
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TableExportActivity;
});
