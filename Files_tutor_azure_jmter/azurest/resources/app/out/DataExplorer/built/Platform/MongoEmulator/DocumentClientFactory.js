define(["require", "exports", "../../Common/Constants", "../../Common/Request", "./Authorization"], function (require, exports, Constants, request, Authorization) {
    "use strict";
    var DocumentDB = window.DocumentDB;
    var DocumentClientFactory = (function () {
        function DocumentClientFactory() {
        }
        DocumentClientFactory.prototype.createDocumentClient = function (options) {
            return DocumentClientFactory._createDocumentClientEmulator(options.endpoint, options.requestTimeoutMs);
        };
        DocumentClientFactory.prototype.setExplorer = function (explorer) {
            this._explorer = explorer;
        };
        DocumentClientFactory._createDocumentClientEmulator = function (endpoint, requestTimeoutMs) {
            endpoint = endpoint || Constants.Referrers.emulatorLocalhost + location.port;
            requestTimeoutMs = requestTimeoutMs || Constants.ClientDefaults.requestTimeoutMs;
            DocumentDB.AuthHandler.getAuthorizationHeader = function (documentClient, verb, path, resourceId, resourceType, headers) {
                var authorization = Authorization.AuthHeadersUtil.getAuthorizationHeader(verb, path, resourceId, resourceType, headers) || "";
                return authorization;
            };
            DocumentDB.RequestHandler._createXmlHttpRequest = function () {
                return new request.HttpRequest();
            };
            DocumentDB.RequestHandler._preProcessUrl = DocumentClientFactory._preProcessUrl;
            var connectionPolicy = {
                RequestTimeout: requestTimeoutMs
            };
            return DocumentDB.createClient(endpoint, { masterKey: "-" }, connectionPolicy);
        };
        DocumentClientFactory._preProcessUrl = function (url, path, queryParams) {
            path = path || "";
            queryParams = queryParams
                ? "?" + queryParams
                : "";
            if (DocumentClientFactory._isForMongo(path)) {
                var resourceUrl = encodeURIComponent(DocumentClientFactory._createUri("localhost", path));
                var pathParts = DocumentClientFactory._parsePath(path) || {};
                var rid = (pathParts.objectBody && pathParts.objectBody.id) ? encodeURIComponent(pathParts.objectBody.id) : "";
                var rtype = (pathParts.type) ? encodeURIComponent(pathParts.type) : "";
                return "https://localhost:44331/explorer/api/RuntimeProxy?resourceUrl=" + resourceUrl + "&rid=" + rid + "&rtype=" + rtype + "&sid=1234&rg=&dba=localhost&" + queryParams;
            }
            return url + path + queryParams;
        };
        /** Only certain operations are handled by the Mongo Proxy */
        DocumentClientFactory._isForMongo = function (path) {
            if (path.indexOf('/docs') > -1) {
                return true;
            }
            return false;
        };
        DocumentClientFactory._parsePath = function (resourcePath) {
            if (typeof resourcePath !== "string") {
                return {};
            }
            if (resourcePath.length === 0) {
                return {};
            }
            if (resourcePath[resourcePath.length - 1] !== "/") {
                resourcePath = resourcePath + "/";
            }
            if (resourcePath[0] !== "/") {
                resourcePath = "/" + resourcePath;
            }
            var id;
            var type;
            var pathParts = resourcePath.split("/");
            if (pathParts.length % 2 === 0) {
                id = pathParts[pathParts.length - 2];
                type = pathParts[pathParts.length - 3];
            }
            else {
                id = pathParts[pathParts.length - 3];
                type = pathParts[pathParts.length - 2];
            }
            var result = {
                type: type,
                objectBody: {
                    id: id,
                    self: resourcePath
                }
            };
            return result;
        };
        DocumentClientFactory._createUri = function (baseUri, relativeUri) {
            if (!baseUri) {
                throw new Error("baseUri is null or empty");
            }
            var slashAtEndOfUriRegex = /\/$/, slashAtStartOfUriRegEx = /^\//;
            var normalizedBaseUri = baseUri.replace(slashAtEndOfUriRegex, "") + "/", normalizedRelativeUri = relativeUri && relativeUri.replace(slashAtStartOfUriRegEx, "") || "";
            return normalizedBaseUri + normalizedRelativeUri;
        };
        return DocumentClientFactory;
    }());
    return DocumentClientFactory;
});
