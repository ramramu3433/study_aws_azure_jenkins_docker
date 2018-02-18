/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Provider wrapper for tables
     */
    var TablePW = (function () {
        function TablePW(host) {
            this.host = host;
        }
        TablePW.prototype.doesTableExist = function (connectionString, tableName) {
            return this.host.executeProviderOperation("Azure.Storage.Table.doesTableExist", {
                connectionString: connectionString,
                tableName: tableName
            });
        };
        TablePW.prototype.createTable = function (connectionString, tableName, doNotOpenInEditor) {
            return this.host.executeOperation("Azure.Actions.Storage.createTable", [{
                    connectionString: connectionString,
                    tableName: tableName,
                    doNotOpenInEditor: doNotOpenInEditor
                }]);
        };
        // TODO: Can we infer accountId and connectionType?
        TablePW.prototype.createTableAndInsertIntoTree = function (connectionString, accountId, accountConnectionType, parentNodeType, // Group node type
            tableName) {
            return this.host.executeOperation("Azure.Actions.Storage.safeCreateTable", [{
                    connectionString: connectionString,
                    id: accountId,
                    connectionType: accountConnectionType,
                    nodeType: parentNodeType,
                    tableName: tableName
                }]);
        };
        TablePW.prototype.deleteTable = function (connectionString, tableName) {
            return this.host.executeOperation("Azure.Actions.Storage.deleteTable", [{
                    connectionString: connectionString,
                    tableName: tableName
                }]);
        };
        TablePW.prototype.deleteTableAndRemoveFromTree = function (connectionString, tableName, tableNodeType, prompt) {
            return this.host.executeOperation("Azure.Actions.Storage.safeDeleteTable", [{
                    connectionString: connectionString,
                    nodeType: tableNodeType,
                    name: tableName,
                    skipPrompt: !prompt
                }]);
        };
        TablePW.prototype.listEntitiesSegmented = function (connectionString, tableName, continuationToken, downloadSize, tableQuery) {
            return this.host.executeProviderOperation("Azure.Storage.Table.listTableEntitiesSegmented", {
                tableReference: {
                    connectionString: connectionString,
                    tableName: tableName
                },
                continuationToken: continuationToken,
                numResults: downloadSize,
                tableQuery: tableQuery
            });
        };
        ;
        TablePW.prototype.isTableEmpty = function (connectionString, tableName) {
            var _this = this;
            var containsAtLeastOneItem = function (continuationToken) {
                return _this.listEntitiesSegmented(connectionString, tableName, continuationToken, 1, {
                    top: 1,
                    filter: "",
                    select: ["PartitionKey", "RowKey"]
                })
                    .then(function (result) {
                    if (result.Results && result.Results.length) {
                        return true;
                    }
                    else if (result.ContinuationToken) {
                        return containsAtLeastOneItem(result.ContinuationToken); // TODO: use Continuator
                    }
                    else {
                        return false;
                    }
                });
            };
            return containsAtLeastOneItem(null)
                .then(function (notEmpty) {
                return !notEmpty;
            });
        };
        TablePW.prototype.addEntities = function (connectionString, tableName, entities, operation) {
            if (operation === void 0) { operation = "insert"; }
            return this.host.executeProviderOperation("Azure.Storage.Table.addEntities", {
                connectionString: connectionString,
                tableName: tableName,
                newEntities: entities,
                operation: operation
            });
        };
        TablePW.prototype.addEntity = function (connectionString, tableName, entity, operation) {
            if (operation === void 0) { operation = "insert"; }
            return this.host.executeProviderOperation("Azure.Storage.Table.addEntity", {
                connectionString: connectionString,
                tableName: tableName,
                newEntity: entity,
                operation: operation
            });
        };
        TablePW.prototype.updateEntity = function (connectionString, tableName, entity, operation) {
            if (operation === void 0) { operation = "insert"; }
            return this.host.executeProviderOperation("Azure.Storage.Table.updateEntity", {
                connectionString: connectionString,
                tableName: tableName,
                newEntity: entity,
                operation: operation
            });
        };
        TablePW.prototype.deleteEntities = function (connectionString, tableName, entities) {
            return this.host.executeProviderOperation("Azure.Storage.Table.deleteEntities", {
                connectionString: connectionString,
                tableName: tableName,
                entities: entities
            });
        };
        TablePW.prototype.getCorsRules = function (connectionString) {
            return this.host.executeProviderOperation("Azure.Storage.Table.getCorsRules", {
                connectionString: connectionString
            });
        };
        TablePW.prototype.setCorsRules = function (connectionString, rules) {
            return this.host.executeProviderOperation("Azure.Storage.Table.setCorsRules", {
                connectionString: connectionString,
                rules: rules
            });
        };
        TablePW.prototype.parseFromCsv = function (lines) {
            return this.host.executeProviderOperation("Azure.Storage.Table.parseFromCsv", {
                lines: lines
            });
        };
        return TablePW;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TablePW;
});
