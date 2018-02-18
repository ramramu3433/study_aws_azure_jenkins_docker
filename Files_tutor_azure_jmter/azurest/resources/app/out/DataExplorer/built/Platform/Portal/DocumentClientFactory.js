define(["require", "exports", "../../Common/EnvironmentUtility", "knockout", "../../Common/Request", "../../Contracts/ViewModels", "../../Common/UrlUtility", "../../Common/Constants"], function (require, exports, EnvironmentUtility, ko, request, ViewModels, UrlUtility, Constants) {
    "use strict";
    var DocumentDB = window.DocumentDB;
    var DocumentClientFactory = (function () {
        function DocumentClientFactory() {
            DocumentDB.RequestHandler._databaseAccount = ko.observable(null);
            DocumentDB.RequestHandler._authorizationToken = ko.observable("");
            DocumentDB.RequestHandler._createXmlHttpRequest = function () { return new request.HttpRequest(); };
            DocumentDB.RequestHandler._preProcessUrl = this._preProcessUrl.bind(this);
            DocumentDB.RequestHandler._addRequestHeaders = this._addRequestHeaders.bind(this);
        }
        DocumentClientFactory.prototype.setExplorer = function (explorer) {
            this._explorer = explorer;
        };
        DocumentClientFactory.prototype.createDocumentClient = function (options) {
            var endpoint = DocumentDB.RequestHandler._databaseAccount && DocumentDB.RequestHandler._databaseAccount() && DocumentDB.RequestHandler._databaseAccount().documentEndpoint || "";
            var requestTimeoutMs = options.requestTimeoutMs || 5000;
            var connectionPolicy = {
                RequestTimeout: requestTimeoutMs
            };
            return DocumentDB.createClient(endpoint, undefined /*auth*/, connectionPolicy);
        };
        DocumentClientFactory.prototype._addRequestHeaders = function (xhr, headers) {
            if (headers) {
                for (var name in headers) {
                    if (name.toLowerCase() !== "user-agent") {
                        xhr.setRequestHeader(name, headers[name]);
                    }
                }
            }
            var authorization = DocumentDB.RequestHandler._authorizationToken && DocumentDB.RequestHandler._authorizationToken() || "";
            xhr.setRequestHeader("authorization", authorization);
        };
        DocumentClientFactory.prototype._preProcessUrl = function (url, path, queryParams) {
            var account = DocumentDB.RequestHandler._databaseAccount && DocumentDB.RequestHandler._databaseAccount();
            if (!account) {
                return "";
            }
            if (!this._mongoEndpoint) {
                this._mongoEndpoint = EnvironmentUtility.getMongoBackendEndpoint(this._explorer, account.location);
            }
            var accountEndpoint = account.documentEndpoint || "";
            var sid = account.subscriptionId || "";
            var rg = account.resourceGroupName || "";
            var dba = account.name || "";
            var resourceUrl = encodeURIComponent(UrlUtility.createUri(accountEndpoint, path));
            var pathParts = UrlUtility.parseDocumentsPath(path) || {};
            var rid = (pathParts.objectBody && pathParts.objectBody.id) ? encodeURIComponent(pathParts.objectBody.id) : "";
            var rtype = (pathParts.type) ? encodeURIComponent(pathParts.type) : "";
            if (account.kind === Constants.AccountKind.MongoDB && this._isForMongo(path)) {
                /* TODO: Review Mongo Document tab design and requirements */
                var currentTab = this._getCurrentTab();
                if (!!currentTab) {
                    var endpoint = this._mongoEndpoint;
                    if (this._isMongoResourceList(path, currentTab.tabKind)) {
                        endpoint += '/resourcelist';
                    }
                    return endpoint + "?db=" + currentTab.collection.database.id() + "&coll=" + currentTab.collection.id() + "&resourceUrl=" + resourceUrl + "&rid=" + rid + "&rtype=" + rtype + "&sid=" + sid + "&rg=" + rg + "&dba=" + dba + "&pk=" + (currentTab.collection.partitionKeyProperty || '');
                }
            }
            var preProcessedUrl = "/api/RuntimeProxy?resourceUrl=" + resourceUrl + "&rid=" + rid + "&rtype=" + rtype + "&sid=" + sid + "&rg=" + rg + "&dba=" + dba + "&" + queryParams;
            return preProcessedUrl;
        };
        DocumentClientFactory.prototype._getCurrentTab = function () {
            var activeTabs = this._getActiveTabs();
            return activeTabs.length > 0 && activeTabs[0];
        };
        DocumentClientFactory.prototype._getActiveTabs = function () {
            if (!this._explorer) {
                return [];
            }
            if (!this._explorer.openedTabs) {
                return [];
            }
            var openedTabs = this._explorer.openedTabs();
            if (!openedTabs) {
                return [];
            }
            if (openedTabs.length <= 0) {
                return [];
            }
            return openedTabs.filter(function (tab) { return tab && tab.isActive && tab.isActive(); }) || [];
        };
        DocumentClientFactory.prototype._isForMongo = function (path) {
            if (path.indexOf('/docs') > -1) {
                return true;
            }
            return false;
        };
        DocumentClientFactory.prototype._pathEndsWith = function (path, searchString) {
            var position = path.length - searchString.length;
            var lastIndex = path.lastIndexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
        DocumentClientFactory.prototype._isMongoResourceList = function (path, tabKind) {
            return tabKind === ViewModels.CollectionTabKind.Documents && this._pathEndsWith(path, 'docs/');
        };
        return DocumentClientFactory;
    }());
    return DocumentClientFactory;
});
