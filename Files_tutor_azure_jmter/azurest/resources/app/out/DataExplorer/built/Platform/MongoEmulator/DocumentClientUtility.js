var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "q", "./Authorization", "../../Common/DocumentClientUtilityBase"], function (require, exports, Q, Authorization, DocumentClientUtilityBase) {
    "use strict";
    var DocumentDB = window.DocumentDB;
    var DocumentClientUtility = (function (_super) {
        __extends(DocumentClientUtility, _super);
        function DocumentClientUtility(documentClientFactory) {
            return _super.call(this, documentClientFactory) || this;
        }
        DocumentClientUtility.prototype.queryDocuments = function (collection, query, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForQueryDocuments(collection.rid)
                .then(function (authHeaders) {
                return _super.prototype.queryDocuments.call(_this, collection, query, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.readStoredProcedures = function (collection, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForReadStoredProcedures(collection.rid)
                .then(function () {
                return _super.prototype.readStoredProcedures.call(_this, collection, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.readUserDefinedFunctions = function (collection, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForReadUserDefinedFunctions(collection.rid)
                .then(function (authHeaders) {
                return _super.prototype.readUserDefinedFunctions.call(_this, collection, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.readTriggers = function (collection, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForReadTriggers(collection.rid)
                .then(function (authHeaders) {
                return _super.prototype.readTriggers.call(_this, collection, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.queryDocumentsPage = function (collection, query, continuationToken, firstItemIndex, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForQueryDocuments(collection.rid)
                .then(function (authHeaders) {
                return _super.prototype.queryDocumentsPage.call(_this, collection, query, continuationToken, firstItemIndex, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.readDocument = function (documentId, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForReadDocument(documentId.rid)
                .then(function (authHeaders) {
                return _super.prototype.readDocument.call(_this, documentId, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.readCollectionQuotaInfo = function (collection, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForReadCollection(collection._rid)
                .then(function (authHeaders) {
                return _super.prototype.readCollectionQuotaInfo.call(_this, collection, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.readOffer = function (collection, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForReadOffers()
                .then(function (authHeaders) {
                return _super.prototype.readOffer.call(_this, collection, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.getOrCreateDatabaseAndCollection = function (databaseId, collectionId, offerThroughput, rupm, partitionKey, options) {
            var _this = this;
            return Q.all([
                Authorization.AuthHeadersUtil.getForReadDatabases(),
                Authorization.AuthHeadersUtil.getForCreateDatabases()
            ])
                .then(function () {
                var afterGetOrCreateDatabase = function (database) {
                    if (!database) {
                        return Q(database);
                    }
                    return Q.all([
                        Authorization.AuthHeadersUtil.getForReadCollections(database._rid),
                        Authorization.AuthHeadersUtil.getForCreateCollections(database._rid)
                    ]).then(function () {
                        return Q(database);
                    });
                };
                return _super.prototype.getOrCreateDatabaseAndCollection.call(_this, databaseId, collectionId, offerThroughput, rupm, partitionKey, options, afterGetOrCreateDatabase);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.updateDocument = function (documentId, newDocument, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForUpdateDocument(documentId.rid)
                .then(function (authHeaders) {
                return _super.prototype.updateDocument.call(_this, documentId, newDocument, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.createDocument = function (collection, newDocument, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForSaveDocument(collection.rid)
                .then(function (authHeaders) {
                return _super.prototype.createDocument.call(_this, collection, newDocument, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.deleteDocument = function (documentId, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForDeleteDocument(documentId.rid)
                .then(function (authHeaders) {
                return _super.prototype.deleteDocument.call(_this, documentId, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.deleteCollection = function (collection, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForDeleteCollection(collection.rid)
                .then(function (authHeaders) {
                return _super.prototype.deleteCollection.call(_this, collection, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.deleteDatabase = function (database, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForDeleteDatabase(database.rid)
                .then(function (authHeaders) {
                return _super.prototype.deleteDatabase.call(_this, database, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.deleteStoredProcedure = function (storedProcedure, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForDeleteStoredProcedure(storedProcedure._rid)
                .then(function (authHeaders) {
                return _super.prototype.deleteStoredProcedure.call(_this, storedProcedure, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.deleteUserDefinedFunction = function (userDefinedFunction, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForDeleteUserDefinedFunction(userDefinedFunction._rid)
                .then(function (authHeaders) {
                return _super.prototype.deleteUserDefinedFunction.call(_this, userDefinedFunction, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.deleteTrigger = function (trigger, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForDeleteTrigger(trigger._rid)
                .then(function (authHeaders) {
                return _super.prototype.deleteTrigger.call(_this, trigger, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.readCollections = function (database, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForReadCollections(database.rid)
                .then(function (authHeaders) {
                return _super.prototype.readCollections.call(_this, database, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.readDatabases = function (options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForReadDatabases()
                .then(function (authHeaders) {
                return _super.prototype.readDatabases.call(_this, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.updateCollection = function (collection, newCollection, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForUpdateCollection(collection.rid)
                .then(function (authHeaders) {
                return _super.prototype.updateCollection.call(_this, collection, newCollection, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.updateOffer = function (offer, newOffer) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForUpdateOffer(offer._rid)
                .then(function (authHeaders) {
                return _super.prototype.updateOffer.call(_this, offer, newOffer);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.updateStoredProcedure = function (storedProcedure, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForUpdateStoredProcedure(storedProcedure._rid)
                .then(function (authHeaders) {
                return _super.prototype.updateStoredProcedure.call(_this, storedProcedure, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.updateUserDefinedFunction = function (userDefinedFunction, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForUpdateUserDefinedFunction(userDefinedFunction._rid)
                .then(function (authHeaders) {
                return _super.prototype.updateUserDefinedFunction.call(_this, userDefinedFunction, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.updateTrigger = function (trigger, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForUpdateTrigger(trigger._rid)
                .then(function (authHeaders) {
                return _super.prototype.updateTrigger.call(_this, trigger, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.createStoredProcedure = function (collection, newStoredProcedure, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForCreateStoredProcedure(collection.rid)
                .then(function (authHeaders) {
                return _super.prototype.createStoredProcedure.call(_this, collection, newStoredProcedure, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.createUserDefinedFunction = function (collection, newUserDefinedFunction, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForCreateUserDefinedFunction(collection.rid)
                .then(function (authHeaders) {
                return _super.prototype.createUserDefinedFunction.call(_this, collection, newUserDefinedFunction, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        DocumentClientUtility.prototype.createTrigger = function (collection, newTrigger, options) {
            var _this = this;
            return Authorization.AuthHeadersUtil.getForCreateTrigger(collection.rid)
                .then(function (authHeaders) {
                return _super.prototype.createTrigger.call(_this, collection, newTrigger, options);
            }, function (reason) {
                return Q.reject(reason);
            });
        };
        return DocumentClientUtility;
    }(DocumentClientUtilityBase));
    return DocumentClientUtility;
});
