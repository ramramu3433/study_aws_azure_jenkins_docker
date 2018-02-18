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
define(["require", "exports", "knockout", "../../Common/Constants", "./ContextualPaneBase", "../../Common/ErrorParserUtility", "../../Shared/Constants"], function (require, exports, ko, Constants, ContextualPaneBase_1, ErrorParserUtility, SharedConstants) {
    "use strict";
    var AddCollectionPane = (function (_super) {
        __extends(AddCollectionPane, _super);
        function AddCollectionPane(options) {
            var _this = _super.call(this, options) || this;
            _this.isFixedDatabaseId = ko.observable(!!options.databaseId);
            _this._databaseSelfLink = options.databaseSelfLink;
            _this.isPreferredApiTable = options.isPreferredApiTable;
            _this._container = options.container;
            _this.databaseId = ko.observable();
            _this.collectionId = ko.observable();
            _this.databasesIds = ko.observableArray();
            _this.partitionKey = ko.observable();
            _this.rupm = ko.observable(Constants.RUPMStates.off);
            _this.storage = ko.observable();
            _this.throughputSinglePartition = ko.observable();
            _this.throughputMultiPartition = ko.observable();
            _this.collectionIdTitle = ko.observable();
            _this.resetData();
            _this.databaseId(options.databaseId);
            return _this;
        }
        AddCollectionPane.prototype.submit = function () {
            var _this = this;
            if (!this._isValid()) {
                return;
            }
            if (this.isPreferredApiTable()) {
                // Table require fixed Database: TablesDB, and fixed Partition Key: /'$pk'
                this.databaseId("TablesDB");
                this.partitionKey("/'$pk'");
            }
            var databaseId = this.databaseId();
            var collectionId = this.collectionId();
            var offerThroughput = (this.storage() === Constants.BackendDefaults.singlePartitionStorageInGb) ? this.throughputSinglePartition() : this.throughputMultiPartition();
            var partitionKey = (this.partitionKey().trim()) ? { paths: [this.partitionKey()], kind: Constants.BackendDefaults.partitionKeyKind } : null;
            var rupm = this.rupm() === Constants.RUPMStates.on;
            this.formErrors("");
            this.documentClientUtility.getOrCreateDatabaseAndCollection(databaseId, collectionId, offerThroughput, rupm, partitionKey, null /*options*/)
                .then(function (collection) {
                _this.close();
                if (!_this.isRunningOnDaytona) {
                    _this._container.refreshAllDatabases();
                }
                else {
                    _this.daytonaContext.telemetry.sendEvent("StorageExplorer.Collection.Create");
                    _this.daytonaContext.hostProxy.executeProviderOperation("Azure.Actions.DocumentDB.refreshNode", {
                        selfLink: _this._databaseSelfLink,
                        nodeType: "Azure.DocumentDB.Database"
                    });
                }
                _this.resetData();
            }, function (reason) {
                var message = ErrorParserUtility.parse(reason);
                _this.formErrors(message[0].message);
                _this.formErrorsDetails(message[0].message);
            });
        };
        AddCollectionPane.prototype.resetData = function () {
            this.collectionId("");
            this.databaseId("");
            this.partitionKey("");
            this.storage(Constants.BackendDefaults.singlePartitionStorageInGb);
            this.throughputSinglePartition(Constants.BackendDefaults.singlePartitionMinThroughput);
            this.throughputMultiPartition(Constants.BackendDefaults.multiplePartitionMinThroughput);
            _super.prototype.resetData.call(this);
        };
        AddCollectionPane.prototype.onStorageOptionsKeyDown = function (source, event) {
            if (event.key === "ArrowRight") {
                this.storage("100");
                return false;
            }
            if (event.key === "ArrowLeft") {
                this.storage("10");
                return false;
            }
            return true;
        };
        AddCollectionPane.prototype.onRupmOptionsKeyDown = function (source, event) {
            if (event.key === "ArrowRight") {
                this.rupm("off");
                return false;
            }
            if (event.key === "ArrowLeft") {
                this.rupm("on");
                return false;
            }
            return true;
        };
        AddCollectionPane.prototype._isValid = function () {
            // TODO add feature flag that disables validation for customers with custom accounts
            var throughput = (this.storage() === Constants.BackendDefaults.singlePartitionStorageInGb) ? this.throughputSinglePartition() : this.throughputMultiPartition();
            var maxThroughputWithRUPM = SharedConstants.CollectionCreation.MaxRUPMPerPartition * this._calculateNumberOfPartitions();
            if (this.rupm() === Constants.RUPMStates.on && throughput > maxThroughputWithRUPM) {
                this.formErrors("The maximum supported provisioned throughput with RU/m enabled is " + maxThroughputWithRUPM + " RU/s. Please turn off RU/m to incease thoughput above " + maxThroughputWithRUPM + " RU/s.");
                return false;
            }
            return true;
        };
        AddCollectionPane.prototype._calculateNumberOfPartitions = function () {
            // Note: this will not validate properly on accounts that have been set up for custom partitioning,
            // but there is no way to know the number of partitions for that case.
            return (this.storage() === Constants.BackendDefaults.singlePartitionStorageInGb) ? SharedConstants.CollectionCreation.NumberOfPartitionsInFixedCollection : SharedConstants.CollectionCreation.NumberOfPartitionsInUnlimitedCollection;
        };
        return AddCollectionPane;
    }(ContextualPaneBase_1.ContextualPaneBase));
    return AddCollectionPane;
});
