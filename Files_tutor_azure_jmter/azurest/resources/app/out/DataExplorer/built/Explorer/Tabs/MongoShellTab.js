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
define(["require", "exports", "../../Common/EnvironmentUtility", "../../Common/Constants", "knockout", "../../Contracts/ViewModels", "./TabsBase"], function (require, exports, EnvironmentUtility, Constants, ko, ViewModels, TabsBase) {
    "use strict";
    var DocumentDB = window.DocumentDB;
    var MongoShellTab = (function (_super) {
        __extends(MongoShellTab, _super);
        function MongoShellTab(options) {
            var _this = _super.call(this, options) || this;
            _this.container = options.collection.container;
            _this.url = ko.computed(function () {
                var account = DocumentDB.RequestHandler && DocumentDB.RequestHandler._databaseAccount && DocumentDB.RequestHandler._databaseAccount() || {};
                var resourceId = account && account.resourceId;
                var accountName = account && account.name;
                var mongoEndpoint = account && account.documentEndpoint;
                var authorization = DocumentDB.RequestHandler._authorizationToken && DocumentDB.RequestHandler._authorizationToken() || "";
                var baseUrl = '/content/mongoshell/dist/';
                if (_this.container.serverId() === "localhost") {
                    baseUrl = '/content/mongoshell/';
                }
                return baseUrl + "index.html?resourceId=" + resourceId + "&accountName=" + accountName + "&mongoEndpoint=" + mongoEndpoint;
            });
            window.addEventListener("message", _this.handleMessage.bind(_this), false);
            return _this;
        }
        MongoShellTab.prototype.setContentFocus = function (event) {
            if (event.type === "load") {
                var activeShell_1 = event.target.contentWindow.mongo.shells[0];
                setTimeout(function () {
                    activeShell_1.focus();
                }, 2000);
            }
        };
        MongoShellTab.prototype.onTabClick = function () {
            var _this = this;
            return _super.prototype.onTabClick.call(this).then(function () {
                _this.collection.selectedSubnodeKind(ViewModels.CollectionTabKind.Documents);
            });
        };
        MongoShellTab.prototype.handleMessage = function (event) {
            var shellIframe = document.getElementById(this.tabId);
            if (!shellIframe)
                return;
            if (typeof event.data !== "object" || event.data["signature"] !== "mongoshell")
                return;
            if (typeof event.data !== "object" || !("data" in event.data))
                return;
            if (typeof event.data["data"] !== "string")
                return;
            if (event.data.data !== "ready")
                return;
            var authorization = DocumentDB.RequestHandler._authorizationToken && DocumentDB.RequestHandler._authorizationToken() || "";
            var resourceId = this.container.databaseAccount().resourceId;
            var accountName = this.container.databaseAccount().name;
            var documentEndpoint = this.container.databaseAccount().documentEndpoint;
            var mongoEndpoint = documentEndpoint.substr(Constants.MongoDBAccounts.protocol.length + 3, documentEndpoint.length - (Constants.MongoDBAccounts.protocol.length + 2 + Constants.MongoDBAccounts.defaultPort.length)) + Constants.MongoDBAccounts.defaultPort.toString();
            var databaseId = this.collection.database.id();
            var collectionId = this.collection.id();
            var apiEndpoint = EnvironmentUtility.getMongoBackendEndpoint(this.container, DocumentDB.RequestHandler && DocumentDB.RequestHandler._databaseAccount && DocumentDB.RequestHandler._databaseAccount().location).replace('/api/mongo/explorer', '');
            shellIframe.contentWindow.postMessage({
                signature: "dataexplorer",
                data: {
                    resourceId: resourceId,
                    accountName: accountName,
                    mongoEndpoint: mongoEndpoint,
                    authorization: authorization,
                    databaseId: databaseId,
                    collectionId: collectionId,
                    apiEndpoint: apiEndpoint
                }
            }, shellIframe.contentDocument.referrer);
        };
        return MongoShellTab;
    }(TabsBase));
    return MongoShellTab;
});
