/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var DocumentDB = window.DocumentDB;
    var DocumentClientFactory = (function () {
        function DocumentClientFactory() {
            DocumentDB.RequestHandler._preProcessUrl = this._preProcessUrl.bind(this);
            DocumentDB.RequestHandler._addRequestHeaders = this._addRequestHeaders.bind(this);
        }
        DocumentClientFactory.prototype.createDocumentClient = function (options) {
            var _this = this;
            var connectionPolicy = {
                RequestTimeout: options.requestTimeoutMs
            };
            DocumentDB.AuthHandler.getAuthorizationTokenUsingMasterKey = function (verb, resourceId, resourceType, headers, masterKey) {
                var text = (verb || "").toLowerCase() + "\n" +
                    (resourceType || "").toLowerCase() + "\n" +
                    (resourceId || "") + "\n" +
                    (headers["x-ms-date"] || "").toLowerCase() + "\n" +
                    (headers["date"] || "").toLowerCase() + "\n";
                return _this._host.executeProviderOperation("Azure.Actions.DocumentDB.getTokenFromMasterKey", {
                    masterKey: masterKey,
                    text: text
                });
            };
            return DocumentDB.createClient(options.endpoint, { masterKey: options.masterKey }, connectionPolicy);
        };
        DocumentClientFactory.prototype.setExplorer = function (explorer) {
            this._explorer = explorer;
        };
        DocumentClientFactory.prototype.setHost = function (host) {
            this._host = host;
        };
        DocumentClientFactory.prototype._addRequestHeaders = function (xhr, headers) {
            if (headers) {
                for (var name in headers) {
                    if (name.toLowerCase() !== "user-agent") {
                        xhr.setRequestHeader(name, headers[name]);
                    }
                }
            }
        };
        DocumentClientFactory.prototype._preProcessUrl = function (url, path, queryParams) {
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
