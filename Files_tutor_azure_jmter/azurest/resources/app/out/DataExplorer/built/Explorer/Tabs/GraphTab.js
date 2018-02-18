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
define(["require", "exports", "knockout", "../../Contracts/ViewModels", "../../Common/EnvironmentUtility", "./TabsBase"], function (require, exports, ko, ViewModels, EnvironmentUtility, TabsBase) {
    "use strict";
    var DocumentDB = window.DocumentDB;
    var GraphTab = (function (_super) {
        __extends(GraphTab, _super);
        function GraphTab(options) {
            var _this = _super.call(this, options) || this;
            var account = DocumentDB.RequestHandler._databaseAccount && DocumentDB.RequestHandler._databaseAccount() || {};
            _this.resourceId = ko.observable(account.resourceId);
            _this.endpoint = ko.observable(account.documentEndpoint);
            _this.masterKey = ko.observable(account.masterKey);
            _this.graphBackendEndpoint = ko.observable(EnvironmentUtility.getGraphEndpointByLocation(account.location));
            _this.databaseId = ko.observable(options.collection.database.id());
            _this.collection = options.collection;
            return _this;
        }
        GraphTab.prototype.onTabClick = function () {
            var _this = this;
            return _super.prototype.onTabClick.call(this).then(function () {
                _this.collection.selectedSubnodeKind(ViewModels.CollectionTabKind.Documents);
            });
        };
        return GraphTab;
    }(TabsBase));
    return GraphTab;
});
