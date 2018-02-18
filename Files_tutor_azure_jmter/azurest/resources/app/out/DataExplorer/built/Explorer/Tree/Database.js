define(["require", "exports", "knockout", "q", "./Collection", "../Menus/ContextMenu"], function (require, exports, ko, Q, Collection, ContextMenu) {
    "use strict";
    var Database = (function () {
        function Database(container, data) {
            var _this = this;
            this.onKeyPress = function (source, event) {
                if (event.key === " " || event.key === "Enter") {
                    _this.expandCollapseDatabase();
                    return false;
                }
                return true;
            };
            this.onKeyDown = function (source, event) {
                if (event.key === "Delete") {
                    _this.onDeleteDatabaseContextMenuClick(source, event);
                    return false;
                }
                if (event.key === "ArrowRight") {
                    _this.expandDatabase();
                    return false;
                }
                if (event.key === "ArrowLeft") {
                    _this.collapseDatabase();
                    return false;
                }
                return true;
            };
            this.nodeKind = "Database";
            this.container = container;
            this.self = data._self;
            this.rid = data._rid;
            this.id = ko.observable(data.id);
            this.collections = ko.observableArray();
            this.isDatabaseExpanded = ko.observable(false);
            this.contextMenu = new ContextMenu(this.container, this.rid);
        }
        Database.prototype.onDeleteDatabaseContextMenuClick = function (source, event) {
            source.container.selectedNode(source);
            source.contextMenu.hide(source, event);
            this.container.deleteDatabaseConfirmationPane.open();
        };
        Database.prototype.selectDatabase = function () {
            this.container.selectedNode(this);
        };
        Database.prototype.expandCollapseDatabase = function () {
            if (this.isDatabaseExpanded()) {
                this.collapseDatabase();
            }
            else {
                this.expandDatabase();
            }
        };
        Database.prototype.expandDatabase = function () {
            if (this.isDatabaseExpanded()) {
                return;
            }
            this.isDatabaseExpanded(true);
            this.loadCollections();
        };
        Database.prototype.collapseDatabase = function () {
            if (!this.isDatabaseExpanded()) {
                return;
            }
            this.isDatabaseExpanded(false);
        };
        Database.prototype.loadCollections = function () {
            var _this = this;
            // TODO: merge array
            var collectionVMs = [];
            this.container.documentClientUtility.readCollections(this, null /*options*/)
                .then(function (collections) {
                var collectionVMPromises = [];
                collections.forEach(function (collection) {
                    var quotaInfoPromise = _this.container.documentClientUtility.readCollectionQuotaInfo(collection, null /*options*/);
                    var offerPromise = _this.container.documentClientUtility.readOffer(collection, null /*options*/);
                    var collectionVMPromise = Q.all([quotaInfoPromise, offerPromise]).then(function () {
                        var collectionVM = new Collection(_this.container, _this, collection, quotaInfoPromise.valueOf(), offerPromise.valueOf());
                        collectionVMs.push(collectionVM);
                        return collectionVM;
                    });
                    collectionVMPromises.push(collectionVMPromise);
                });
                Q.all(collectionVMPromises).then(function (collectionVMs) {
                    _this.collections(collectionVMs);
                });
            });
        };
        Database.prototype.openAddCollection = function (database, event) {
            database.contextMenu.hide(database, event);
            database.container.addCollectionPane.databaseId(database.id());
            database.container.addCollectionPane.open();
        };
        return Database;
    }());
    return Database;
});
