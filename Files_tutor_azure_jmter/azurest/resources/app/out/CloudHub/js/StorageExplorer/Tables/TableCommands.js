/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "underscore", "underscore.string", "Providers/Common/AzureConstants", "StorageExplorer/Common/BaseStorageCommands", "Common/ConnectionString", "StorageExplorer/ActivityLogModels/CsvParser", "StorageExplorer/Common/DataTableUtilities", "StorageExplorer/Common/DataTableOperations", "Common/Debug", "Common/Errors", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Common/StorageExplorerUtilities", "StorageExplorer/ActivityLogModels/TableExportActivity", "StorageExplorer/ActivityLogModels/TableImportActivity", "StorageExplorer/ActivityLogModels/TableDeleteActivity", "ActivityLog/StorageExplorer/TableStatsActivity"], function (require, exports, _, underscore_string_1, AzureConstants, BaseStorageCommands_1, ConnectionString_1, CsvParser_1, DataTableUtilities, DataTableOperations, Debug, Errors, StorageExplorerConstants, StorageExplorerUtilities, TableExportActivity_1, TableImportActivity_1, TableDeleteActivity, TableStatsActivity_1) {
    "use strict";
    var TableCommands = (function (_super) {
        __extends(TableCommands, _super);
        function TableCommands(tableExplorerContext) {
            var _this = _super.call(this, tableExplorerContext.hostProxy, tableExplorerContext.telemetry) || this;
            _this._tableExplorerContext = tableExplorerContext;
            _this._activityLogManager = tableExplorerContext.activityLogManager;
            _this._columnSettingsManager = tableExplorerContext.columnSettingsManager;
            return _this;
        }
        TableCommands.prototype.isEnabled = function (commandName, selectedEntites) {
            var singleItemSeleted = DataTableUtilities.containSingleItem(selectedEntites);
            var atLeastOneItemSelected = DataTableUtilities.containItems(selectedEntites);
            switch (commandName) {
                case TableCommands.editEntityCommand:
                    return singleItemSeleted;
                case TableCommands.downloadEntitiesCommand:
                case TableCommands.copyEntitiesCommand:
                case TableCommands.deleteEntitiesCommand:
                case TableCommands.reorderColumnsCommand:
                    return atLeastOneItemSelected;
                case TableCommands.addEntityCommand:
                    return true;
                default:
                    break;
            }
            return false;
        };
        /**
         * Parse the updated entity to see if there are any new attributes that old headers don't have.
         * In this case, add these attributes names as new headers.
         * Remarks: adding new headers will automatically trigger table redraw.
         */
        TableCommands.prototype.tryInsertNewHeaders = function (viewModel, newEntity) {
            var newHeaders = [];
            Object.keys(newEntity).forEach(function (key) {
                if (!_.isEqual(key, StorageExplorerConstants.EntityKeyNames.Metadata) &&
                    !_.contains(viewModel.headers, key)) {
                    newHeaders.push(key);
                }
            });
            var newHeadersInserted = false;
            if (newHeaders.length) {
                viewModel.updateHeaders(viewModel.headers.concat(newHeaders), /* notifyColumnChanges */ true, /* enablePrompt */ false);
                newHeadersInserted = true;
            }
            return newHeadersInserted;
        };
        TableCommands.prototype.tryOpenEntityEditor = function (viewModel) {
            if (this.isEnabled(TableCommands.editEntityCommand, viewModel.selected())) {
                this.editEntityCommand(viewModel);
                return true;
            }
            return false;
        };
        /**
         * Add entity
         */
        TableCommands.prototype.addEntityCommand = function (viewModel) {
            var _this = this;
            var dataTypes = this.getDataTypesFromEntities(viewModel.headers, viewModel.items());
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.addEntity,
                parameters: {
                    connectionString: this._tableExplorerContext.tableReference.connectionString,
                    tableName: this._tableExplorerContext.tableReference.tableName,
                    headers: viewModel.headers,
                    dataTypes: dataTypes
                }
            })
                .then(function (entity) {
                if (entity) {
                    var numberOfProperties = 0;
                    for (var property in entity) {
                        if (property !== ".metadata") {
                            numberOfProperties++;
                        }
                    }
                    _this._telemetry.sendEvent("StorageExplorer.Table.addEntityExecuted", {
                        numberOfProperties: numberOfProperties.toString()
                    });
                    // Copy mandatory fields in display order, this is required to show them in other contexts (e.g. in Edit dialog).
                    var entityToCache = {};
                    entityToCache[StorageExplorerConstants.EntityKeyNames.PartitionKey] = entity[StorageExplorerConstants.EntityKeyNames.PartitionKey];
                    entityToCache[StorageExplorerConstants.EntityKeyNames.RowKey] = entity[StorageExplorerConstants.EntityKeyNames.RowKey];
                    entityToCache[StorageExplorerConstants.EntityKeyNames.Timestamp] = entity[StorageExplorerConstants.EntityKeyNames.Timestamp];
                    Object.keys(entity).forEach(function (key) {
                        if (entityToCache[key] === undefined) {
                            entityToCache[key] = entity[key];
                        }
                    });
                    return viewModel.addEntityToCache(entityToCache).then(function () {
                        if (!_this.tryInsertNewHeaders(viewModel, entityToCache)) {
                            viewModel.redrawTableThrottled();
                        }
                    });
                }
                else {
                    _this._telemetry.sendEvent("StorageExplorer.Table.addEntityCancelled");
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Table.addEntityCommand");
            });
        };
        /**
         * Edit entity
         */
        TableCommands.prototype.editEntityCommand = function (viewModel) {
            var _this = this;
            if (!viewModel) {
                throw new Errors.NullArgumentError(viewModel.toString());
            }
            if (!DataTableUtilities.containSingleItem(viewModel.selected())) {
                throw new Errors.InvalidOperationError(TableCommands.editEntityCommand);
            }
            var entityToUpdate = viewModel.selected()[0];
            var originalNumberOfProperties = entityToUpdate ? 0 : Object.keys(entityToUpdate).length - 1; // .metadata is always a property for etag
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.editEntity,
                parameters: {
                    connectionString: this._tableExplorerContext.tableReference.connectionString,
                    tableName: this._tableExplorerContext.tableReference.tableName,
                    entity: entityToUpdate
                }
            })
                .then(function (entity) {
                if (entity) {
                    var numberOfProperties = 0;
                    for (var property in entity) {
                        if (property !== ".metadata") {
                            numberOfProperties++;
                        }
                    }
                    var propertiesDelta = numberOfProperties - originalNumberOfProperties;
                    _this._telemetry.sendEvent("StorageExplorer.Table.editEntityExecuted", { propertiesDelta: propertiesDelta.toString(), numberOfProperties: numberOfProperties.toString() });
                    return viewModel.updateCachedEntity(entity).then(function () {
                        if (!_this.tryInsertNewHeaders(viewModel, entity)) {
                            viewModel.redrawTableThrottled();
                        }
                    }).then(function () {
                        // Selecting updated entity
                        viewModel.selected.removeAll();
                        viewModel.selected.push(entity);
                    });
                }
                else {
                    _this._telemetry.sendEvent("StorageExplorer.Table.editEntityCancelled");
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Table.editEntityCommand");
            });
        };
        TableCommands.prototype.deleteEntitiesCommand = function (viewModel) {
            var _this = this;
            if (!viewModel) {
                throw new Errors.NullArgumentError(viewModel.toString());
            }
            if (!DataTableUtilities.containItems(viewModel.selected())) {
                throw new Errors.NullArgumentError(TableCommands.deleteEntitiesCommand);
            }
            var entitiesToDelete = viewModel.selected();
            return this._host.executeOperation("Environment.promptYesNo", ["Are you sure you want to delete selected entities?", "error"])
                .then(function (result) {
                if (result) {
                    _this._telemetry.sendEvent("StorageExplorer.Table.deleteEntitiesExecuted", { numberDeleted: entitiesToDelete.length.toString() });
                    var activity = new TableDeleteActivity(_this._tableExplorerContext.tableReference.tableName, _this._tableExplorerContext.tableReference.connectionString, entitiesToDelete, _this._host, _this._telemetry);
                    var accountName = new ConnectionString_1.default(_this._tableExplorerContext.tableReference.connectionString).getAccountName();
                    activity.addToActivityLog(_this._activityLogManager);
                    return activity.start(accountName);
                }
                else {
                    _this._telemetry.sendEvent("StorageExplorer.Table.deleteEntitiesCancelled");
                }
            }).then(function (result) {
                if (result) {
                    return viewModel.removeEntitiesFromCache(entitiesToDelete).then(function () {
                        viewModel.redrawTableThrottled();
                    });
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Table.deleteEntitiesCommand");
            });
        };
        TableCommands.prototype.importEntitiesCommand = function (viewModel) {
            var _this = this;
            var filePath = "";
            return this.getCsvImportFile()
                .then(function (selectedFile) {
                if (!selectedFile) {
                    _this._telemetry.sendEvent("StorageExplorer.Table.importEntitiesCancelled", { earlyCancel: "true" });
                    return null;
                }
                else {
                    filePath = selectedFile;
                    return _this.getColumns(filePath);
                }
            })
                .then(function (columns) {
                if (columns) {
                    if (columns.some(function (column) { return StorageExplorerUtilities.isTableTypeAnnotation(column); })) {
                        return _this.importCsvWithTypeAnnotations(filePath);
                    }
                    else {
                        return _this.importCsv(filePath);
                    }
                }
            })
                .catch(function (error) {
                _this._showError(error, "StorageExplorer.Table.importEntitiesCommand");
            });
        };
        TableCommands.prototype.exportEntitiesCommand = function (viewModel) {
            return __awaiter(this, void 0, void 0, function () {
                var query, selectedFile, activity, accountName, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            query = StorageExplorerUtilities.copyTableQuery(viewModel.tableQuery);
                            return [4 /*yield*/, this.getCsvExportFile()];
                        case 1:
                            selectedFile = _a.sent();
                            if (selectedFile) {
                                activity = new TableExportActivity_1.default(this._host, this._telemetry, selectedFile, underscore_string_1.endsWith(selectedFile, TableCommands.typedCsvExtension), this._tableExplorerContext.tableReference, query);
                                accountName = new ConnectionString_1.default(this._tableExplorerContext.tableReference.connectionString).getAccountName();
                                activity.initialize();
                                activity.addToActivityLog(this._activityLogManager);
                                return [2 /*return*/, activity.start(accountName)];
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            this._showError(error_1, "StorageExplorer.Table.exportEntitiesCommand");
                            return [3 /*break*/, 3];
                        case 3:
                            ;
                            return [2 /*return*/];
                    }
                });
            });
        };
        TableCommands.prototype.customizeColumnsCommand = function (viewModel) {
            var _this = this;
            var table = viewModel.table;
            var displayedColumnNames = DataTableOperations.getDataTableHeaders(table);
            var columnsCount = displayedColumnNames.length;
            var currentOrder = DataTableOperations.getInitialOrder(columnsCount);
            Debug.assert(!!table && !!currentOrder && displayedColumnNames.length === currentOrder.length);
            var currentSettings;
            try {
                currentSettings = currentOrder.map(function (value, index) {
                    return table.column(index).visible();
                });
            }
            catch (err) {
                Debug.error(err);
                this._telemetry.sendError(err);
            }
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.customizeColumns,
                parameters: {
                    columnNames: displayedColumnNames,
                    order: currentOrder,
                    visible: currentSettings
                }
            }).then(function (newColumnSetting) {
                if (newColumnSetting) {
                    // Should reorder first as filtering always applies to the currently displayed table columns.
                    return DataTableOperations.reorderColumns(table, newColumnSetting.order).then(function () {
                        DataTableOperations.filterColumns(table, newColumnSetting.visible);
                        _this._telemetry.sendEvent("StorageExplorer.Table.customizeColumnsExecuted");
                        // Save new column settings
                        _this._columnSettingsManager.saveColumnSetting(newColumnSetting);
                    });
                }
                else {
                    _this._telemetry.sendEvent("StorageExplorer.Table.customizeColumnsCancelled");
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Table.customizeColumnsCommand");
            });
        };
        /**
         * Get blob statistics
         */
        TableCommands.prototype.getTableStats = function (viewModel) {
            try {
                var activity = new TableStatsActivity_1.default(this._host, this._telemetry, this._tableExplorerContext.tableReference, viewModel.tableQuery);
                activity.initialize();
                activity.addToActivityLog(this._activityLogManager);
                activity.start();
                return Promise.resolve(null);
            }
            catch (error) {
                this._showError(error, "StorageExplorer.Table.getTableStats");
            }
        };
        TableCommands.prototype.reorderColumnsBasedOnSelectedEntities = function (viewModel) {
            var selected = viewModel.selected();
            if (!selected || !selected.length) {
                return;
            }
            var table = viewModel.table;
            var currentColumnNames = DataTableOperations.getDataTableHeaders(viewModel.table);
            var headersCount = currentColumnNames.length;
            var headersUnion = DataTableUtilities.getPropertyIntersectionFromTableEntities(selected);
            // An array with elements representing indexes of selected entities' header union out of initial headers.
            var orderOfLeftHeaders = headersUnion.map(function (item) { return currentColumnNames.indexOf(item); });
            // An array with elements representing initial order of the table.
            var initialOrder = DataTableOperations.getInitialOrder(headersCount);
            // An array with elements representing indexes of headers not present in selected entities' header union.
            var orderOfRightHeaders = _.difference(initialOrder, orderOfLeftHeaders);
            // This will be the target order, with headers in selected entities on the left while others on the right, both in the initial order, respectively.
            var targetOrder = orderOfLeftHeaders.concat(orderOfRightHeaders);
            return DataTableOperations.reorderColumns(table, targetOrder);
        };
        TableCommands.prototype.resetColumns = function (viewModel) {
            this._columnSettingsManager.deleteColumnSetting();
            viewModel.reloadTable();
        };
        TableCommands.prototype.getCsvImportFile = function () {
            var operationArgs = {
                message: "Select file to import",
                browseForFolder: false,
                allowMultiSelect: false,
                filters: TableCommands.importExportFilters
            };
            return this._host.executeProviderOperation("Environment.Dialogs.getOpenFileDialogResult", operationArgs)
                .then(function (filePaths) {
                if (filePaths && filePaths.length) {
                    return filePaths[0];
                }
                return null;
            });
        };
        TableCommands.prototype.getCsvExportFile = function () {
            var operationArgs = {
                message: "Export to file",
                defaultName: this._tableExplorerContext.tableReference.tableName + "." + TableCommands.typedCsvExtension,
                filters: TableCommands.importExportFilters
            };
            return this._host.executeProviderOperation("Environment.Dialogs.getSaveFileDialogResult", operationArgs);
        };
        /**
         * Parses and validates the column names in a CSV file for table import.
         * The specified file must define at least the `PartitionKey` and `RowKey` columns.
         * No duplicate column names are allowed.
         */
        TableCommands.prototype.getColumns = function (filePath) {
            var csvParser = new CsvParser_1.default(this._host, filePath);
            return csvParser.read(1)
                .then(function (values) {
                var columns = values.length ? values[0] : [];
                if (columns.length === 0) {
                    throw new Error("The file '" + filePath + "' has no data."); // Localize
                }
                else if (!_.contains(columns, StorageExplorerConstants.EntityKeyNames.PartitionKey)) {
                    // Localize
                    throw new Error("An error occurred while opening the file '" + filePath + "'. " +
                        "The required property 'PartitionKey' was not specified.");
                }
                else if (!_.contains(columns, StorageExplorerConstants.EntityKeyNames.RowKey)) {
                    // Localize
                    throw new Error("An error occurred while opening the file '" + filePath + "'. " +
                        "The required property 'RowKey' was not specified.");
                }
                else if (_.unique(columns).length !== columns.length) {
                    // Localize
                    throw new Error("An error occurred while opening the file '" + filePath + "'. " +
                        "A duplicate property was found.");
                }
                return columns;
            });
        };
        /**
         * Imports a CSV file containing type annotations into an Azure table.
         *
         * CSV files with type annotations explicitly declare the EDM types for each entity property.
         * Therefore, we don't need anymore input from the user to complete the operation.
         */
        TableCommands.prototype.importCsvWithTypeAnnotations = function (filePath) {
            var _this = this;
            var csvParser = new CsvParser_1.default(this._host, filePath);
            var numRecords = 2;
            return csvParser.read(numRecords)
                .then(function (records) {
                // Verify whether the file has any entity values.
                if (records.length < 2) {
                    throw new Error("The file '" + filePath + "' contains no entity values."); // Localize
                }
                return _this.startImportActivity(filePath, null);
            });
        };
        /**
         * Imports a CSV file into an Azure table.
         *
         * Ordinary CSV files lack important details needed to import, such as datatypes. We need to get that information
         * from the user with the Import dialog.
         */
        TableCommands.prototype.importCsv = function (filePath) {
            var _this = this;
            return this.getSampleEntity(filePath)
                .then(function (sampleEntity) { return _this.getImportSchema(sampleEntity); })
                .then(function (schema) {
                if (schema) {
                    return _this.startImportActivity(filePath, schema);
                }
                else {
                    _this._telemetry.sendEvent("StorageExplorer.Table.importEntitiesCancelled", { earlyCancel: "true" });
                }
            })
                .catch(function (error) {
                _this._showError(error, "StorageExplorer.Table.importEntitiesCommand");
            });
        };
        TableCommands.prototype.getSampleEntity = function (filePath) {
            var recordsToSample = 100;
            var csvParser = new CsvParser_1.default(this._host, filePath);
            return csvParser.read(recordsToSample)
                .then(function (parsedValues) {
                if (parsedValues.length < 2) {
                    throw new Error("The file '" + filePath + "' contains no entity values."); // Localize
                }
                var sampleEntity = { PartitionKey: null, RowKey: null };
                var columns = [];
                parsedValues.forEach(function (parsedLine, index) {
                    if (index === 0) {
                        columns = parsedLine;
                    }
                    else if (columns.length !== parsedLine.length) {
                        // Make sure the lines for the sample have the same number of values as the number of property names.
                        throw new Error("A CSV record in the file '" + filePath + "' has " + parsedLine.length + " values, " +
                            ("but " + columns.length + " values were expected.")); // Localize
                    }
                    else {
                        // Construct a sample entity from the first n records.
                        parsedLine.forEach(function (value, index) {
                            var column = columns[index];
                            if (!sampleEntity[column]) {
                                // Add new property to the sample entity.
                                sampleEntity[column] = { _: value };
                            }
                            else if (!sampleEntity[column]._) {
                                // Use the first non-null, non-empty value for an existing property.
                                // This reduces the number of String types and null values in the Import dialog.
                                sampleEntity[column]._ = value;
                            }
                        });
                    }
                });
                return sampleEntity;
            });
        };
        TableCommands.prototype.getImportSchema = function (sampleEntity) {
            if (sampleEntity) {
                return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                    id: AzureConstants.registeredDialogs.importEntities,
                    parameters: { "sampleEntity": sampleEntity }
                });
            }
            return null;
        };
        TableCommands.prototype.startImportActivity = function (filePath, schema) {
            this._telemetry.sendEvent("StorageExplorer.Table.importEntitiesExecuted");
            var activity = new TableImportActivity_1.default(this._host, this._telemetry, filePath, this._tableExplorerContext.tableReference.connectionString, this._tableExplorerContext.tableReference.tableName, schema);
            var accountName = new ConnectionString_1.default(this._tableExplorerContext.tableReference.connectionString).getAccountName();
            activity.initialize();
            activity.addToActivityLog(this._activityLogManager);
            return activity.start(accountName);
        };
        /**
         * Set a data type for each header. The data type is inferred from entities.
         * Notice: Not every header will have a data type since some headers don't even exist in entities.
         */
        TableCommands.prototype.getDataTypesFromEntities = function (headers, entities) {
            var currentHeaders = _.clone(headers);
            var dataTypes = {};
            entities = entities || [];
            entities.forEach(function (entity, index) {
                if (currentHeaders.length) {
                    var keys = _.keys(entity);
                    var headersToProcess = _.intersection(currentHeaders, keys);
                    headersToProcess.forEach(function (propertyName) {
                        dataTypes[propertyName] = entity[propertyName].$ || StorageExplorerConstants.EdmType.String;
                    });
                    currentHeaders = _.difference(currentHeaders, headersToProcess);
                }
            });
            return dataTypes;
        };
        return TableCommands;
    }(BaseStorageCommands_1.default));
    // Localize
    TableCommands.typedCsvExtension = "typed.csv";
    TableCommands.importExportFilters = [
        { name: "All supported file types", extensions: [TableCommands.typedCsvExtension, "csv"] },
        { name: "CSV with type annotations (Comma delimited)", extensions: [TableCommands.typedCsvExtension] },
        { name: "CSV (Comma delimited)", extensions: ["csv"] },
        { name: "All Files", extensions: ["*"] }
    ];
    // Command Ids
    TableCommands.addEntityCommand = "add";
    TableCommands.editEntityCommand = "edit";
    TableCommands.downloadEntitiesCommand = "download";
    TableCommands.copyEntitiesCommand = "copy";
    TableCommands.deleteEntitiesCommand = "delete";
    TableCommands.reorderColumnsCommand = "reorder";
    TableCommands.resetColumnsCommand = "reset";
    TableCommands.customizeColumnsCommand = "customizeColumns";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TableCommands;
});
