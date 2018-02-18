define(["require", "exports", "../../Common/Constants", "../../Common/UrlUtility"], function (require, exports, Constants, UrlUtility) {
    "use strict";
    var DocumentDB = window.DocumentDB;
    var DocumentClientFactory = (function () {
        function DocumentClientFactory() {
        }
        DocumentClientFactory.prototype.createDocumentClient = function (options) {
            var endpoint = options.endpoint || Constants.Referrers.emulatorLocalhost + location.port;
            var requestTimeoutMs = options.requestTimeoutMs || Constants.ClientDefaults.requestTimeoutMs;
            DocumentDB.RequestHandler._preProcessUrl = DocumentClientFactory._preProcessUrl;
            var connectionPolicy = {
                RequestTimeout: requestTimeoutMs
            };
            return DocumentDB.createClient(endpoint, undefined, connectionPolicy);
        };
        DocumentClientFactory.prototype.setExplorer = function (explorer) {
            this._explorer = explorer;
        };
        DocumentClientFactory._preProcessUrl = function (url, path, queryParams) {
            var resourceUrl = encodeURIComponent(UrlUtility.createUri("https://localhost:8081", path));
            var pathParts = UrlUtility.parseDocumentsPath(path) || {};
            var rid = (pathParts.objectBody && pathParts.objectBody.id) ? encodeURIComponent(pathParts.objectBody.id) : "";
            var rtype = (pathParts.type) ? encodeURIComponent(pathParts.type) : "";
            var preProcessedUrl = "https://localhost:44361/api/RuntimeProxy?resourceUrl=" + resourceUrl + "&rid=" + rid + "&rtype=" + rtype + "&" + queryParams;
            return preProcessedUrl;
        };
        return DocumentClientFactory;
    }());
    return DocumentClientFactory;
});
