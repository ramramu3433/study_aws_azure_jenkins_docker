/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Azure/DeepSearch/DeepSearchProvider", "Providers/Common/AzureConstants"], function (require, exports, DeepSearchProvider, AzureConstants) {
    "use strict";
    /**
     * The storage types available for storage accounts.
     */
    var StorageType;
    (function (StorageType) {
        StorageType[StorageType["NOT_SET"] = 0] = "NOT_SET";
        StorageType[StorageType["BLOB_CONTAINER"] = 1] = "BLOB_CONTAINER";
        StorageType[StorageType["FILE_SHARE"] = 2] = "FILE_SHARE";
        StorageType[StorageType["QUEUE"] = 3] = "QUEUE";
        StorageType[StorageType["TABLE"] = 4] = "TABLE";
    })(StorageType || (StorageType = {}));
    /**
     * Provide deep search capabilities for storage account resources.
     */
    var StorageDeepSearchProvider = (function (_super) {
        __extends(StorageDeepSearchProvider, _super);
        function StorageDeepSearchProvider(query) {
            var _this = _super.call(this, query) || this;
            _this._initialize = function () {
                // Convert to lowercase so search is case-insensitive.
                var rawQueryLowerCase = _this.rawQuery.toLowerCase();
                var segments = rawQueryLowerCase.split(DeepSearchProvider.separator);
                // If the storage identifier appears in the 3rd segment, the node is under a CloudGroup node
                if (segments[2] === StorageDeepSearchProvider.identifier) {
                    // Remove the CloudGroup segment from the query so that the other segments line up as expected
                    segments.shift();
                }
                if (segments[1] === StorageDeepSearchProvider.identifier) {
                    // Valid because this parser accepts the prefix of the raw query.
                    _this.valid = true;
                    // Initialize to not set.
                    _this._storageType = StorageType.NOT_SET;
                    // Get the account name (if it exists)
                    _this._accountName = segments[2] ? segments[2] : null;
                    if (!_this._accountName) {
                        // Don't continue parsing because account name hasn't been set.
                        return;
                    }
                    // If storage type was provided, determine which one.
                    switch (segments[3]) {
                        case StorageDeepSearchProvider.strBlobContainers:
                            _this._storageType = StorageType.BLOB_CONTAINER;
                            break;
                        case StorageDeepSearchProvider.strFileShares:
                            _this._storageType = StorageType.FILE_SHARE;
                            break;
                        case StorageDeepSearchProvider.strQueues:
                            _this._storageType = StorageType.QUEUE;
                            break;
                        case StorageDeepSearchProvider.strTables:
                            _this._storageType = StorageType.TABLE;
                            break;
                        default:
                            _this._storageType = StorageType.NOT_SET;
                            break;
                    }
                    if (_this._storageType === StorageType.NOT_SET) {
                        // Don't continue parsing because storage type was not set.
                        return;
                    }
                    // Get the deep search query
                    _this._searchQuery = segments[4] ? segments[4] : null;
                }
                else {
                    _this.valid = false;
                }
            };
            _this.getResourceName = function () {
                return _this._accountName;
            };
            _this.getSupportedResourceTypes = function () {
                return [AzureConstants.resourceTypes.StorageAccountsClassic,
                    AzureConstants.resourceTypes.StorageAccountsV2];
            };
            _this.handleResultNode = function (node) {
                if (!_this._accountName) {
                    // Don't expand child nodes if thyere was no account name provided.
                    return;
                }
                node.preExpanded = true;
                // Only pre-expand the next children if a storage type was set.
                node.attributes.push({ name: "shouldPreExpandNodes", value: _this._storageType !== StorageType.NOT_SET });
                node.attributes.push({ name: "searchQuery", value: _this._searchQuery });
                // Hide the other storage types that aren't part of this deep search.
                switch (_this._storageType) {
                    case StorageType.BLOB_CONTAINER:
                        node.attributes.push(StorageDeepSearchProvider._hideQueues);
                        node.attributes.push(StorageDeepSearchProvider._hideTables);
                        node.attributes.push(StorageDeepSearchProvider._hideFileShares);
                        break;
                    case StorageType.FILE_SHARE:
                        node.attributes.push(StorageDeepSearchProvider._hideBlobContainers);
                        node.attributes.push(StorageDeepSearchProvider._hideQueues);
                        node.attributes.push(StorageDeepSearchProvider._hideTables);
                        break;
                    case StorageType.QUEUE:
                        node.attributes.push(StorageDeepSearchProvider._hideBlobContainers);
                        node.attributes.push(StorageDeepSearchProvider._hideTables);
                        node.attributes.push(StorageDeepSearchProvider._hideFileShares);
                        break;
                    case StorageType.TABLE:
                        node.attributes.push(StorageDeepSearchProvider._hideBlobContainers);
                        node.attributes.push(StorageDeepSearchProvider._hideQueues);
                        node.attributes.push(StorageDeepSearchProvider._hideFileShares);
                        break;
                    default:
                        break;
                }
            };
            _this._initialize();
            return _this;
        }
        return StorageDeepSearchProvider;
    }(DeepSearchProvider));
    // TODO: These strings should be localized.
    // Keep all lowercase as deep search is case-insensitive.
    StorageDeepSearchProvider.identifier = "storage accounts";
    StorageDeepSearchProvider.strBlobContainers = "blob containers";
    StorageDeepSearchProvider.strFileShares = "file shares";
    StorageDeepSearchProvider.strQueues = "queues";
    StorageDeepSearchProvider.strTables = "tables";
    /* Attributes used for hiding certain storage types from deep search results. */
    StorageDeepSearchProvider._hideBlobContainers = { name: "supportsBlobs", value: false };
    StorageDeepSearchProvider._hideFileShares = { name: "supportsFiles", value: false };
    StorageDeepSearchProvider._hideQueues = { name: "supportsQueues", value: false };
    StorageDeepSearchProvider._hideTables = { name: "supportsTables", value: false };
    return StorageDeepSearchProvider;
});
