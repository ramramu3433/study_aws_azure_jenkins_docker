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
            return url + path + queryParams;
        };
        return DocumentClientFactory;
    }());
    return DocumentClientFactory;
});
