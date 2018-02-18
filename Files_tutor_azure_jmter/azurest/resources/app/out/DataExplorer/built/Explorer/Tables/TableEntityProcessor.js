define(["require", "exports", "./Constants", "./QueryBuilder/DateTimeUtilities", "./Utilities"], function (require, exports, Constants, DateTimeUtilities, Utilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DataTypes;
    (function (DataTypes) {
        DataTypes[DataTypes["Guid"] = 0] = "Guid";
        DataTypes[DataTypes["Double"] = 1] = "Double";
        DataTypes[DataTypes["String"] = 2] = "String";
        DataTypes[DataTypes["Binary"] = 5] = "Binary";
        DataTypes[DataTypes["Boolean"] = 8] = "Boolean";
        DataTypes[DataTypes["DateTime"] = 9] = "DateTime";
        DataTypes[DataTypes["Int32"] = 16] = "Int32";
        DataTypes[DataTypes["Int64"] = 18] = "Int64";
    })(DataTypes || (DataTypes = {}));
    var tablesIndexers = {
        Value: "$v",
        Type: "$t"
    };
    exports.keyProperties = {
        PartitionKey: "$pk",
        Id: "id",
        Id2: "$id",
        Timestamp: "_ts",
        resourceId: "_rid",
        self: "_self",
        etag: "_etag",
        attachments: "_attachments"
    };
    function convertDocumentsToEntities(documents) {
        var results = [];
        documents.forEach(function (document) {
            if (!document.hasOwnProperty(exports.keyProperties.PartitionKey) || !document.hasOwnProperty(exports.keyProperties.Id2)) {
                return; // The rest of the key properties should be guaranteed as DocumentDB properties
            }
            var entity = {
                PartitionKey: {
                    _: document[exports.keyProperties.PartitionKey],
                    $: Constants.EdmType.String
                },
                RowKey: {
                    _: document[exports.keyProperties.Id],
                    $: Constants.EdmType.String
                },
                Timestamp: {
                    _: DateTimeUtilities.convertUnixToJSDate(document[exports.keyProperties.Timestamp]).toUTCString(),
                    $: Constants.EdmType.DateTime
                },
                _rid: {
                    _: document[exports.keyProperties.resourceId],
                    $: Constants.EdmType.String
                },
                _self: {
                    _: document[exports.keyProperties.self],
                    $: Constants.EdmType.String
                },
                _etag: {
                    _: document[exports.keyProperties.etag],
                    $: Constants.EdmType.String
                },
                _attachments: {
                    _: document[exports.keyProperties.attachments],
                    $: Constants.EdmType.String
                }
            };
            for (var property in document) {
                if (document.hasOwnProperty(property)) {
                    if (property !== exports.keyProperties.PartitionKey
                        && property !== exports.keyProperties.Id
                        && property !== exports.keyProperties.Timestamp
                        && property !== exports.keyProperties.resourceId
                        && property !== exports.keyProperties.self
                        && property !== exports.keyProperties.etag
                        && property !== exports.keyProperties.attachments
                        && property !== exports.keyProperties.Id2) {
                        if (!document[property].hasOwnProperty("$v") || !document[property].hasOwnProperty("$t")) {
                            return; //Document property does not match the current required format for Tables, so we ignore it
                        }
                        if (DataTypes[document[property][tablesIndexers.Type]] === DataTypes[DataTypes.DateTime]) {
                            // Convert Ticks datetime to javascript date for better visualization in table
                            entity[property] = {
                                _: DateTimeUtilities.convertTicksToJSDate(document[property][tablesIndexers.Value]).toUTCString(),
                                $: Constants.EdmTypePrefix + DataTypes[document[property][tablesIndexers.Type]]
                            };
                        }
                        else {
                            entity[property] = {
                                _: document[property][tablesIndexers.Value],
                                $: Constants.EdmTypePrefix + DataTypes[document[property][tablesIndexers.Type]]
                            };
                        }
                    }
                }
            }
            results.push(entity);
        });
        return results;
    }
    exports.convertDocumentsToEntities = convertDocumentsToEntities;
    // Do not use this to create a document to send to the server, only for delete and for giving rid/self/collection to the utility methods.
    function convertEntitiesToDocuments(entities, collection) {
        var results = [];
        entities.forEach(function (entity) {
            var document = {
                "$id": entity.RowKey._,
                id: entity.RowKey._,
                ts: DateTimeUtilities.convertJSDateToUnix(entity.Timestamp._),
                rid: entity._rid._,
                self: entity._self._,
                etag: entity._etag._,
                attachments: entity._attachments._,
                collection: collection
            };
            if (collection.partitionKey) {
                document[collection.partitionKeyProperty] = entity.PartitionKey._;
                document["partitionKeyValue"] = entity.PartitionKey._;
            }
            for (var property in entity) {
                if (property !== Constants.EntityKeyNames.PartitionKey
                    && property !== Constants.EntityKeyNames.RowKey
                    && property !== Constants.EntityKeyNames.Timestamp
                    && property !== exports.keyProperties.resourceId
                    && property !== exports.keyProperties.self
                    && property !== exports.keyProperties.etag
                    && property !== exports.keyProperties.attachments
                    && property !== exports.keyProperties.Id2) {
                    if (entity[property].$ === Constants.EdmType.DateTime) {
                        // Convert javascript date back to ticks with 20 zeros padding
                        document[property] = {
                            "$t": DataTypes[Utilities.getDisplayedNameFromEdmTypeName(entity[property].$)],
                            "$v": DateTimeUtilities.convertJSDateToTicksWithPadding(entity[property]._)
                        };
                    }
                    else {
                        document[property] = {
                            "$t": DataTypes[Utilities.getDisplayedNameFromEdmTypeName(entity[property].$)],
                            "$v": entity[property]._
                        };
                    }
                }
            }
            results.push(document);
        });
        return results;
    }
    exports.convertEntitiesToDocuments = convertEntitiesToDocuments;
    function convertEntityToNewDocument(entity) {
        var document = {
            "$pk": entity.PartitionKey._,
            "$id": entity.RowKey._,
            id: entity.RowKey._
        };
        for (var property in entity) {
            if (property !== Constants.EntityKeyNames.PartitionKey
                && property !== Constants.EntityKeyNames.RowKey
                && property !== Constants.EntityKeyNames.Timestamp
                && property !== exports.keyProperties.resourceId
                && property !== exports.keyProperties.self
                && property !== exports.keyProperties.etag
                && property !== exports.keyProperties.attachments
                && property !== exports.keyProperties.Id2) {
                if (entity[property].$ === Constants.EdmType.DateTime) {
                    // Convert javascript date back to ticks with 20 zeros padding
                    document[property] = {
                        "$t": DataTypes[Utilities.getDisplayedNameFromEdmTypeName(entity[property].$)],
                        "$v": DateTimeUtilities.convertJSDateToTicksWithPadding(entity[property]._)
                    };
                }
                else {
                    document[property] = {
                        "$t": DataTypes[Utilities.getDisplayedNameFromEdmTypeName(entity[property].$)],
                        "$v": entity[property]._
                    };
                }
            }
        }
        return document;
    }
    exports.convertEntityToNewDocument = convertEntityToNewDocument;
});
