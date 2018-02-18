define(["require", "exports", "../../Common/Constants", "q"], function (require, exports, Constants, Q) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var resourceTypes = {
        databases: "dbs",
        collections: "colls",
        documents: "docs",
        sprocs: "sprocs",
        udfs: "udfs",
        triggers: "triggers",
        users: "users",
        permissions: "permissions",
        attachments: "attachments",
        media: "media",
        conflicts: "conflicts",
        pkranges: "pkranges",
        offers: "offers"
    };
    var AuthHeadersUtil = (function () {
        function AuthHeadersUtil() {
        }
        AuthHeadersUtil.getAuthorizationHeader = function (verb, path, resourceId, resourceType, headers) {
            var tokenId = AuthHeadersUtil.getTokensCacheId(verb, resourceId, resourceType);
            var authorizationHeaders = AuthHeadersUtil.tokensCache[tokenId];
            if (!authorizationHeaders) {
                //console.log(`Missing authorization header for ${tokenId}`);
                //return "";
                return "type%3dmaster%26ver%3d1.0%26sig%3d2bRltC2bjOPqwfH95TKNtkXOaizQC7kquoojpI3gxss%3d";
            }
            // override date set by SDK
            headers[Constants.HttpHeaders.msDate] = authorizationHeaders["x-ms-date"];
            return authorizationHeaders.authorization;
        };
        AuthHeadersUtil.getTokensCacheId = function (verb, resourceId, resourceType) {
            return (verb && verb.toLowerCase() || "") + "," + (resourceType && resourceType.toLowerCase() || "") + "," + (resourceId && resourceId.toLowerCase() || "");
        };
        AuthHeadersUtil.getForReadDatabases = function () {
            return AuthHeadersUtil._getAuthorizationHeaders("get", resourceTypes.databases, "");
        };
        AuthHeadersUtil.getForQueryDatabases = function () {
            return AuthHeadersUtil._getAuthorizationHeaders("post", resourceTypes.databases, "");
        };
        AuthHeadersUtil.getForCreateDatabases = function () {
            return AuthHeadersUtil._getAuthorizationHeaders("post", resourceTypes.databases, "");
        };
        AuthHeadersUtil.getForDeleteDocument = function (documentRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("delete", resourceTypes.documents, documentRid);
        };
        AuthHeadersUtil.getForDeleteStoredProcedure = function (storedProcedureRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("delete", resourceTypes.sprocs, storedProcedureRid);
        };
        AuthHeadersUtil.getForDeleteUserDefinedFunction = function (userDefinedFunctionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("delete", resourceTypes.udfs, userDefinedFunctionRid);
        };
        AuthHeadersUtil.getForDeleteTrigger = function (triggerRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("delete", resourceTypes.triggers, triggerRid);
        };
        AuthHeadersUtil.getForCreateStoredProcedure = function (collectionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("post", resourceTypes.sprocs, collectionRid);
        };
        AuthHeadersUtil.getForCreateUserDefinedFunction = function (collectionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("post", resourceTypes.udfs, collectionRid);
        };
        AuthHeadersUtil.getForCreateTrigger = function (collectionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("post", resourceTypes.triggers, collectionRid);
        };
        AuthHeadersUtil.getForSaveDocument = function (collectionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("post", resourceTypes.documents, collectionRid);
        };
        AuthHeadersUtil.getForReadCollections = function (databaseRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("get", resourceTypes.collections, databaseRid);
        };
        AuthHeadersUtil.getForReadCollection = function (collectionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("get", resourceTypes.collections, collectionRid);
        };
        AuthHeadersUtil.getForReadOffers = function () {
            return AuthHeadersUtil._getAuthorizationHeaders("get", resourceTypes.offers, "");
        };
        AuthHeadersUtil.getForQueryCollections = function (databaseRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("post", resourceTypes.collections, databaseRid);
        };
        AuthHeadersUtil.getForCreateCollections = function (databaseRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("post", resourceTypes.collections, databaseRid);
        };
        AuthHeadersUtil.getForDeleteCollection = function (collectionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("delete", resourceTypes.collections, collectionRid);
        };
        AuthHeadersUtil.getForDeleteDatabase = function (databaseRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("delete", resourceTypes.databases, databaseRid);
        };
        AuthHeadersUtil.getForQueryDocuments = function (collectionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("get", resourceTypes.pkranges, collectionRid).then(function () { return AuthHeadersUtil._getAuthorizationHeaders("post", resourceTypes.documents, collectionRid); });
        };
        AuthHeadersUtil.getForReadDocument = function (documentRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("get", resourceTypes.documents, documentRid);
        };
        AuthHeadersUtil.getForReadStoredProcedures = function (collectionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("get", resourceTypes.sprocs, collectionRid);
        };
        AuthHeadersUtil.getForReadUserDefinedFunctions = function (collectionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("get", resourceTypes.udfs, collectionRid);
        };
        AuthHeadersUtil.getForReadTriggers = function (collectionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("get", resourceTypes.triggers, collectionRid);
        };
        AuthHeadersUtil.getForUpdateCollection = function (collectionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("put", resourceTypes.collections, collectionRid);
        };
        AuthHeadersUtil.getForUpdateDocument = function (documentRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("put", resourceTypes.documents, documentRid);
        };
        AuthHeadersUtil.getForUpdateOffer = function (offerRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("put", resourceTypes.offers, offerRid);
        };
        AuthHeadersUtil.getForUpdateStoredProcedure = function (storedProcedureRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("put", resourceTypes.sprocs, storedProcedureRid);
        };
        AuthHeadersUtil.getForUpdateUserDefinedFunction = function (userDefinedFunctionRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("put", resourceTypes.udfs, userDefinedFunctionRid);
        };
        AuthHeadersUtil.getForUpdateTrigger = function (triggerRid) {
            return AuthHeadersUtil._getAuthorizationHeaders("put", resourceTypes.triggers, triggerRid);
        };
        AuthHeadersUtil._getAuthorizationHeaders = function (verb, resourceType, resourceId) {
            var deferred = Q.defer();
            var date = new Date().toUTCString();
            Q($.ajax({
                type: 'GET',
                url: "/_explorer/authorization/" + verb + "/" + resourceType + "/" + resourceId,
                headers: {
                    "x-ms-date": date,
                    "authorization": "...."
                }
            }).done(function (data) {
                var result = {
                    "x-ms-date": date,
                    "authorization": data.Token
                };
                var tokenId = AuthHeadersUtil.getTokensCacheId(verb, resourceId, resourceType);
                AuthHeadersUtil.tokensCache[tokenId] = result;
                deferred.resolve(result);
            }).fail(function (reason) {
                deferred.reject(reason);
            }));
            return deferred.promise;
        };
        return AuthHeadersUtil;
    }());
    AuthHeadersUtil.tokensCache = {};
    exports.AuthHeadersUtil = AuthHeadersUtil;
});
