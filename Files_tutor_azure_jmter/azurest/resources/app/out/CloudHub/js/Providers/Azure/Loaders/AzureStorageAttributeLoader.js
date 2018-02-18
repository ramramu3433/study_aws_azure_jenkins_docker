/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Common/Debug", "es6-promise", "Providers/StorageExplorer/ProviderWrappers/StoragePW"], function (require, exports, AzureConstants, Debug, es6_promise_1, StoragePW) {
    "use strict";
    var AzureStorageAttributeLoader = (function () {
        function AzureStorageAttributeLoader(azureConnection, host) {
            var _this = this;
            this.registerBindings = function (loaderBindingManager) {
                loaderBindingManager.addAttributeLoaderBinding(AzureStorageAttributeLoader.getConnectionTypeAttributes, _this.getConnectionTypeAttributes);
                loaderBindingManager.addAttributeLoaderBinding(AzureStorageAttributeLoader.getBlobContainerAttributes, _this.getBlobContainerAttributes);
                loaderBindingManager.addAttributeLoaderBinding(AzureStorageAttributeLoader.getFileShareAttributes, _this.getFileShareAttributes);
                loaderBindingManager.addAttributeLoaderBinding(AzureStorageAttributeLoader.getQueueAttributes, _this.getQueueAttributes);
                loaderBindingManager.addAttributeLoaderBinding(AzureStorageAttributeLoader.getTableAttributes, _this.getTableAttributes);
            };
            /**
             * Uses the connectionType to determine the values of individual attributes that can be used in binding expressions
             */
            this.getConnectionTypeAttributes = function (args) {
                if (args === void 0) { args = null; }
                var connectionType = args.connectionType;
                var hasServiceSas = false;
                var hasAccountSas = false;
                var hasKey = false;
                var isDevelopment = false;
                var isExternalWithKey = false;
                var hasSubscription = false;
                switch (connectionType) {
                    case 5 /* development */:
                        hasKey = true;
                        isDevelopment = true;
                        break;
                    case 3 /* key */:
                        isExternalWithKey = true;
                        hasKey = true;
                        break;
                    case 2 /* subscription */:
                        hasKey = true;
                        hasSubscription = true;
                        break;
                    case 1 /* sasAttachedAccount */:
                        hasAccountSas = true;
                        break;
                    case 4 /* sasAttachedService */:
                        hasServiceSas = true;
                        break;
                    default:
                        Debug.fail("Unexpected connectionType");
                        break;
                }
                var attributes = [
                    { name: "hasServiceSas", value: hasServiceSas },
                    { name: "hasAccountSas", value: hasAccountSas },
                    { name: "hasAccountKey", value: hasKey },
                    { name: "isDevelopment", value: isDevelopment },
                    { name: "isExternalWithKey", value: isExternalWithKey },
                    { name: "hasSubscription", value: hasSubscription }
                ];
                return es6_promise_1.Promise.resolve({ results: attributes });
            };
            this.getBlobContainerAttributes = function (args) {
                if (args === void 0) { args = null; }
                var attributesObject = {
                    lastModified: null,
                    leaseState: null,
                    leaseStatus: null,
                    leaseStatusDisplay: null,
                    publicReadAccess: null
                };
                var blobContainerPromise = _this._host.executeOperation("Azure.Actions.Storage.getBlobContainer", [{ connectionString: args.connectionString, containerName: args.containerName }])
                    .then(function (value) {
                    value.attributes.forEach(function (attribute) { return attributesObject[attribute.name] = attribute; });
                    // Add attribute for leaseStatusDisplay, which is displayed in parentheses after the container name
                    var leaseStatusAttribute = attributesObject.leaseStatus;
                    if (leaseStatusAttribute) {
                        var locked = leaseStatusAttribute.value === AzureConstants.leaseStatuses.locked;
                        var leaseStatusDisplay = locked ? "Leased" : null; // Localize
                        attributesObject.leaseStatusDisplay = { name: "leaseStatusDisplay", value: leaseStatusDisplay };
                    }
                }).catch(function (error) {
                    // Might not have access (e.g. SAS blob container) - ignore
                    Debug.warn(error);
                });
                // Add publicReadAccess if we can access it
                var publicAccessPromise = StoragePW.getBlobContainerPublicAccessLevel(_this._host, args.connectionString, args.containerName)
                    .then(function (accessLevel) {
                    attributesObject.publicReadAccess = { name: "publicReadAccess", value: accessLevel };
                })
                    .catch(function (error) {
                    // Might not have access (e.g. SAS blob container) - ignore
                    Debug.warn(error);
                });
                return es6_promise_1.Promise.all([blobContainerPromise, publicAccessPromise]).then(function () {
                    var attributes = [];
                    for (var key in attributesObject) {
                        // Always return an attribute for everything we promised, even if we couldn't retrieve an actual value
                        attributes.push(attributesObject[key] || { name: key, value: null });
                    }
                    return { results: attributes };
                });
            };
            this.getFileShareAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.Storage.getFileShare", [{ connectionString: args.connectionString, shareName: args.shareName }])
                    .then(function (value) {
                    return {
                        results: value.attributes
                    };
                });
            };
            this.getQueueAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.Storage.getQueue", [{ connectionString: args.connectionString, queueName: args.queueName }])
                    .then(function (value) {
                    return {
                        results: value.attributes
                    };
                });
            };
            this.getTableAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.Storage.getTable", [{ connectionString: args.connectionString, tableName: args.tableName }])
                    .then(function (value) {
                    return {
                        results: value.attributes
                    };
                });
            };
            this._azureConnection = azureConnection;
            this._host = host;
        }
        return AzureStorageAttributeLoader;
    }());
    AzureStorageAttributeLoader.getConnectionTypeAttributes = "Azure.Attributes.Storage.GetConnectionTypeAttributes";
    AzureStorageAttributeLoader.getBlobContainerAttributes = "Azure.Attributes.Storage.GetBlobContainerAttributes";
    AzureStorageAttributeLoader.getFileShareAttributes = "Azure.Attributes.Storage.GetFileShareAttributes";
    AzureStorageAttributeLoader.getQueueAttributes = "Azure.Attributes.Storage.GetQueueAttributes";
    AzureStorageAttributeLoader.getTableAttributes = "Azure.Attributes.Storage.GetTableAttributes";
    return AzureStorageAttributeLoader;
});
