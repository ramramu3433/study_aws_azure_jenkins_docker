/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "underscore.string", "StorageExplorer/Dialogs/EntityPropertyValueValidator", "ActivityLog/StorageExplorer/ExtendedStatus", "ActivityLog/StorageExplorer/RetryableActivity", "StorageExplorer/Common/StorageExplorerUtilities", "Providers/StorageExplorer/ProviderWrappers/TablePW", "Common/Utilities", "./CsvParser", "es6-promise", "StorageExplorer/StorageExplorerConstants"], function (require, exports, ko, underscore_string_1, EntityPropertyValueValidator, ExtendedStatus, RetryableActivity, StorageExplorerUtilities, TablePW_1, Utilities, CsvParser_1, es6_promise_1, StorageExplorerConstants_1) {
    "use strict";
    /**
     * Represents a handle in the Activity Log to an Azure table import operation.
     *
     * An import operation expects a CSV file whose first record contains valid property names for table entities.
     * Optionally, the column names can declare type annotations.
     *
     * Example:
     *
     *    PartitionKey,RowKey,Value,Value@type
     *    0,0,1,Edm.Int32
     *
     * The values in column `Value@type` will contain type annotations for the values in column `Value`.
     * In this case, the value "1" is declared to be an `Edm.Int32`.
     */
    // CONSIDER: This should inherit from ActionBasedActivity
    var TableImportActivity = (function (_super) {
        __extends(TableImportActivity, _super);
        function TableImportActivity(host, telemetry, filePath, connectionString, tableName, schema) {
            var _this = _super.call(this, "Importing file...") || this;
            _this._retryable = ko.observable();
            _this._columnNames = [];
            _this._entityValidator = new EntityPropertyValueValidator(false);
            _this._entitiesImported = ko.observable(0);
            _this._entitiesToImport = ko.observable(0);
            _this._updateProgress = function (newValue) {
                if (_this._entitiesImported() === 1) {
                    _this.progressMessage(_this._entitiesImported() + " entity imported"); // Localize
                }
                else {
                    _this.progressMessage(_this._entitiesImported() + " entities imported"); // Localize
                }
            };
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
            _this._connectionString = connectionString;
            _this._tableName = tableName;
            _this._schema = schema;
            _this._entitiesImported.subscribe(_this._updateProgress);
            _this._entitiesToImport.subscribe(_this._updateProgress);
            _this._insertOperation = _this._schema ? _this._schema.insertOperation : "replace";
            _this._csvParser = new CsvParser_1.default(host, filePath);
            return _this;
        }
        /**
         * Starts the activity
         */
        TableImportActivity.prototype.start = function (accountName) {
            var _this = this;
            this.extendedStatus(ExtendedStatus.InProgress);
            this.title(this.getInProgressTitle(accountName));
            return this._importEntities()
                .then(function () {
                _this.title(_this.getFinishedTitle(accountName));
                _this.extendedStatus(ExtendedStatus.Success);
            })
                .catch(function (error) {
                _this._handleError(error);
            });
        };
        /**
         * @override
         */
        TableImportActivity.prototype._canCancelCore = function () {
            // Disable cancel until the whole experience is working properly.
            return false; // return super._canCancelCore() && this._cancelable();
        };
        /**
         * @override
         */
        TableImportActivity.prototype._canRetryCore = function () {
            // Disable retry until the whole experience is working properly.
            return false; // return super._canRetryCore() && this._retryable();
        };
        TableImportActivity.prototype.getInProgressTitle = function (accountName) {
            return "Importing '" + this._filePath + "' into table '" + accountName + "/" + this._tableName + "'"; // Localize
        };
        TableImportActivity.prototype.getFinishedTitle = function (accountName) {
            return "Imported '" + this._filePath + "' into table '" + accountName + "/" + this._tableName + "'"; // Localize
        };
        TableImportActivity.prototype._importEntities = function () {
            var _this = this;
            // The first line contains property names and types. Missing data types will be filled in from the schema.
            return this._csvParser.read(1)
                .then(function (columns) {
                _this._columnNames = columns && columns.length ? columns[0] : [];
                return _this._createAndSendNextBatch();
            });
        };
        /**
         * Creates a batch of entities from a CSV file and sends them to Azure.
         */
        TableImportActivity.prototype._createAndSendNextBatch = function () {
            var _this = this;
            var batchSize = 100;
            // Read in the next batch of records from the file.
            return this._csvParser.read(batchSize)
                .then(function (records) {
                var entities = [];
                _this._entitiesToImport(_this._entitiesToImport() + records.length);
                records.forEach(function (record, index) {
                    // Make sure each row has the expected number of values.
                    if (_this._columnNames.length !== record.length) {
                        // Localize
                        throw new Error("A CSV record has " + record.length + " values, " +
                            ("but " + _this._columnNames.length + " values were expected."));
                    }
                    if (_this._schema) {
                        entities.push(_this._createEntityFromSchema(record));
                    }
                    else {
                        entities.push(_this._createEntity(record));
                    }
                });
                return _this._sendBatch(entities);
            })
                .then(function () {
                // If there is more data to read, we need to create another batch.
                if (!_this._csvParser.end()) {
                    return _this._createAndSendNextBatch();
                }
            });
        };
        /**
         * Sends a batch of entities to Azure.
         */
        TableImportActivity.prototype._sendBatch = function (entities) {
            var _this = this;
            if (!entities.length) {
                es6_promise_1.Promise.resolve();
            }
            return this._tablePW.addEntities(this._connectionString, this._tableName, entities, this._insertOperation)
                .then(function () { return _this._entitiesImported(_this._entitiesImported() + entities.length); }, function (error) {
                if (entities.length === 1) {
                    // Only one entity was in the batch, so the error may be because of an invalid value.
                    throw _this._processAzureError(entities[0], error);
                }
                return _this._resendBatch(entities);
            });
        };
        /**
         * Resends a failed batch of entities to Azure.
         *
         * The batch is divided into two halves, and each half is sent back to Azure.
         * If the error was because of an invalid property, splitting the batch in half will quickly hone in on the bad
         * entity.
         *
         * Transient errors, such as a network issue, may get resolved automatically by resending, and
         * the import operation will continue without issue.
         */
        TableImportActivity.prototype._resendBatch = function (entities) {
            var _this = this;
            var split = Math.floor(entities.length / 2);
            var firstHalf = entities.slice(0, split);
            var secondHalf = entities.slice(split);
            return this._sendBatch(firstHalf).then(function () { return _this._sendBatch(secondHalf); });
        };
        /**
         * Handles an error case showing the error message and retry if necessary.
         */
        TableImportActivity.prototype._handleError = function (error, retryStep) {
            var _this = this;
            this.extendedStatus(ExtendedStatus.Error);
            this.mainMessage("Failed: " + Utilities.getErrorMessage(error));
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
        /**
         * Validates an entity's properties when an Azure error occurs.
         *
         * If a property is invalid, the original error is modified to include information about the entity and returned.
         * Othewise, the original error is returned unchanged.
         */
        TableImportActivity.prototype._processAzureError = function (entity, error) {
            // Identify the first invalid property (if any) and add it to the error message.
            // This will help the user identify problems in the CSV file.
            for (var propertyName in entity) {
                var value = entity[propertyName]._;
                var type = entity[propertyName].$;
                var result = this._entityValidator.validate(value, StorageExplorerUtilities.getDisplayedNameFromEdmTypeName(type));
                if (result.isInvalid) {
                    error.message = "The value '" + value + "' is not a valid " + type + " in the entity with " +
                        ("partition key '" + entity.PartitionKey._ + "' and row key '" + entity.RowKey._ + "'. ") +
                        ("Original Error: " + error.message);
                    break;
                }
            }
            this._telemetry.sendError({ name: "StorageExplorer.Table.importEntitiesFailed", error: error });
            return error;
        };
        /**
         * Creates an entity from values parsed from a CSV file and datatypes from a user-defined schema.
         */
        TableImportActivity.prototype._createEntityFromSchema = function (data) {
            var _this = this;
            var result = { PartitionKey: null, RowKey: null };
            this._columnNames.forEach(function (columnName, index) {
                var schemaProperty = _this._schema.properties[columnName];
                var propertyName = schemaProperty.newName || schemaProperty.name;
                var value = data[index];
                if (_this._shouldSkip(schemaProperty, value)) {
                    return;
                }
                _this._validateProperty(propertyName, value);
                result[propertyName] = { _: data[index], $: schemaProperty.type };
            });
            return result;
        };
        /**
         * Creates an entity from values and datatypes parsed from a CSV file.
         */
        TableImportActivity.prototype._createEntity = function (data) {
            var result = { PartitionKey: null, RowKey: null };
            // First combine values and datatypes into an entity.
            this._columnNames.forEach(function (column, index) {
                var isTypeAnnotation = StorageExplorerUtilities.isTableTypeAnnotation(column);
                var value = isTypeAnnotation ? null : data[index];
                var type = isTypeAnnotation ? data[index] : null;
                var propertyName = isTypeAnnotation ?
                    StorageExplorerUtilities.getTablePropertyNameFromAnnotation(column) :
                    column;
                if (result[propertyName]) {
                    result[propertyName]._ = result[propertyName]._ === null ? value : result[propertyName]._;
                    result[propertyName].$ = result[propertyName].$ === null ? type : result[propertyName].$;
                }
                else {
                    result[propertyName] = { _: value, $: type };
                }
            });
            // Then validate data and remove unwanted properties.
            for (var propertyName in result) {
                var value = result[propertyName]._;
                var type = result[propertyName].$;
                if (!StorageExplorerUtilities.isTableKeyProperty(propertyName) && !value && !type) {
                    // If neither the value nor the type are defined, this is a "null" property.
                    // Key properties should not be removed.
                    delete result[propertyName];
                    continue;
                }
                else if (!type) {
                    // If no type is defined for the value, default to Edm.String.
                    result[propertyName].$ = StorageExplorerConstants_1.EdmType.String;
                }
                // The Azure client library will convert null or undefined values to strings with values of "null" or "undefined".
                if (!value && type === StorageExplorerConstants_1.EdmType.String) {
                    result[propertyName]._ = "";
                }
                this._validateProperty(propertyName, value);
            }
            ;
            return result;
        };
        /**
         * Determines whether a CSV value should not be added to an entity object
         * for importing.
         */
        TableImportActivity.prototype._shouldSkip = function (property, value) {
            if (StorageExplorerUtilities.isTableKeyProperty(property.newName || property.name)) {
                // PartitionKey and RowKey values are required, so we should never skip these.
                return false;
            }
            else if (!!property.skip) {
                return true;
            }
            else if (underscore_string_1.isBlank(value) && property.type !== StorageExplorerConstants_1.EdmType.String) {
                // Blank values are invalid for datatypes other than Edm.String, so we should always skip these.
                return true;
            }
            else if (!value && this._schema.treatEmptyAsNull) {
                // Empty values should be skipped if the schema is treating empty values as null, regardless of type.
                return true;
            }
            return false;
        };
        /**
         * Validates property values.
         * Ensures that partition and row key values have no illegal characters.
         */
        TableImportActivity.prototype._validateProperty = function (name, value) {
            if (name === "PartitionKey" && this._entityValidator.validate(value, "Key").isInvalid) {
                throw new Error("The partition key '" + value + "' contains invalid characters"); // Localize
            }
            if (name === "RowKey" && this._entityValidator.validate(value, "Key").isInvalid) {
                throw new Error("The row key '" + value + "' contains invalid characters"); // Localize
            }
        };
        return TableImportActivity;
    }(RetryableActivity));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TableImportActivity;
});
