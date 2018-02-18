/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "URIjs/URITemplate", "Providers/Azure/Loaders/AttributeLoaderHelper", "Providers/Common/AzureConstants"], function (require, exports, rsvp, URITemplate, AttributeLoaderHelper, AzureConstants) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Contains the query actions that return Azure Resource entitites.
     */
    var AzureStorageAccountAttributeLoader = (function () {
        function AzureStorageAccountAttributeLoader(azureConnection, host) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureStorageAccountAttributeLoader.getAttributes, _this.getAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureStorageAccountAttributeLoader.getKeysAttributes, _this.getKeys);
                loaderBindingManger.addAttributeLoaderBinding(AzureStorageAccountAttributeLoader.getV2Attributes, _this.getAttributesV2);
                loaderBindingManger.addAttributeLoaderBinding(AzureStorageAccountAttributeLoader.getKeysV2Attributes, _this.getKeysV2);
                loaderBindingManger.addAttributeLoaderBinding(AzureStorageAccountAttributeLoader.getConnectionStringAttributeNamespace, _this.getConnectionString);
            };
            /**
             * Gets the properties for the StorageAccount Node
             */
            this.getAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args)
                    .then(function (resource) {
                    var endpoints = "";
                    var blobEndpoint = resource.properties.endpoints.filter(function (s, i, a) { return (/\.blob\./i).test(s); })[0];
                    if (!!blobEndpoint) {
                        endpoints += "BlobEndpoint=" + blobEndpoint + ";";
                    }
                    var queueEndpoint = resource.properties.endpoints.filter(function (s, i, a) { return (/\.queue\./i).test(s); })[0];
                    if (!!queueEndpoint) {
                        endpoints += "QueueEndpoint=" + queueEndpoint + ";";
                    }
                    var tableEndpoint = resource.properties.endpoints.filter(function (s, i, a) { return (/\.table\./i).test(s); })[0];
                    if (!!tableEndpoint) {
                        endpoints += "TableEndpoint=" + tableEndpoint + ";";
                    }
                    var fileShareEndpoint = resource.properties.endpoints.filter(function (s, i, a) { return (/\.file\./i).test(s); })[0];
                    if (!!fileShareEndpoint) {
                        endpoints += "FileEndpoint=" + fileShareEndpoint + ";";
                    }
                    var attributes = [
                        {
                            name: "supportsBlobs",
                            value: !!blobEndpoint
                        },
                        {
                            name: "supportsQueues",
                            value: !!queueEndpoint
                        },
                        {
                            name: "supportsTables",
                            value: !!tableEndpoint
                        },
                        {
                            name: "supportsFiles",
                            value: !!fileShareEndpoint
                        },
                        {
                            name: "searchQuery",
                            value: null
                        },
                        {
                            name: "shouldPreExpandNodes",
                            value: false
                        }
                    ];
                    attributes.push({
                        name: "endpoints",
                        value: endpoints
                    });
                    return { results: attributes };
                }, _this._attributeLoaderHelper.handleRequestError)
                    .then(null, function (error) {
                    return {
                        results: [],
                        error: new Error(AzureStorageAccountAttributeLoader._storageAccountPropertyErrorMessage)
                    };
                });
            };
            /**
             * Gets the properties for the StorageAccount Node (v2)
             */
            this.getAttributesV2 = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args)
                    .then(function (resource) {
                    var isBlobStorage = resource.kind === AzureConstants.resourceKinds.BlobStorage;
                    var isPremiumStorage = resource.sku.tier === AzureConstants.resourceKinds.PremiumStorage;
                    var endpoints = "";
                    if (!!resource.properties.primaryEndpoints.blob) {
                        endpoints += "BlobEndpoint=" + resource.properties.primaryEndpoints.blob + ";";
                    }
                    if (!isBlobStorage && !isPremiumStorage && !!resource.properties.primaryEndpoints.queue) {
                        endpoints += "QueueEndpoint=" + resource.properties.primaryEndpoints.queue + ";";
                    }
                    if (!isBlobStorage && !isPremiumStorage && !!resource.properties.primaryEndpoints.table) {
                        endpoints += "TableEndpoint=" + resource.properties.primaryEndpoints.table + ";";
                    }
                    if (!isBlobStorage && !!resource.properties.primaryEndpoints.file) {
                        endpoints += "FileEndpoint=" + resource.properties.primaryEndpoints.file + ";";
                    }
                    var attributes = [
                        {
                            name: "supportsBlobs",
                            value: !!resource.properties.primaryEndpoints.blob
                        },
                        {
                            name: "supportsQueues",
                            value: !isBlobStorage && !isPremiumStorage && !!resource.properties.primaryEndpoints.queue
                        },
                        {
                            name: "supportsTables",
                            value: !isBlobStorage && !isPremiumStorage && !!resource.properties.primaryEndpoints.table
                        },
                        {
                            name: "supportsFiles",
                            value: !isBlobStorage && !!resource.properties.primaryEndpoints.file
                        }
                    ];
                    if (isBlobStorage) {
                        attributes.push({ name: "accessTier", value: resource.properties.accessTier });
                    }
                    else if (isPremiumStorage) {
                        attributes.push({ name: "tier", value: resource.sku.tier });
                    }
                    attributes.push({
                        name: "endpoints",
                        value: endpoints
                    });
                    return { results: attributes };
                });
            };
            /**
             * Gets the storage keys for the StorageAccount Node
             */
            this.getKeys = function (args) {
                if (args === void 0) { args = null; }
                return _this.getAccountKeys(args);
            };
            /**
             * Gets the storage keys for the StorageAccount Node v2
             */
            this.getKeysV2 = function (args) {
                if (args === void 0) { args = null; }
                return _this.getAccountKeys(args);
            };
            this.getConnectionString = function (args) {
                if (args === void 0) { args = null; }
                if (args.storageAccountName) {
                    var connectionStringAttribute = args.connectionStringAttribute;
                    var storageAccountName = args.storageAccountName;
                    var subscription = JSON.parse(args.subscription);
                    var url = AzureStorageAccountAttributeLoader._findStorageAccountUriTemplate.expand({
                        accountName: storageAccountName,
                        managementEndpoint: subscription.managementEndpoint,
                        subscriptionId: subscription.id
                    });
                    return _this._azureConnection.webRequest(url.toString(), subscription, "GET")
                        .then(function (response) {
                        var parsedResponse = JSON.parse(response);
                        if (parsedResponse.value && parsedResponse.value.length === 1) {
                            var getKeyRequestArgs = {
                                id: parsedResponse.value[0].id,
                                subscription: args.subscription,
                                apiVersion: "2014-06-01"
                            };
                            var storageAccountType = parsedResponse.value[0].type;
                            var storageKeyPropertyName;
                            if (storageAccountType === AzureConstants.resourceTypes.StorageAccountsClassic) {
                                getKeyRequestArgs.apiVersion = "2014-06-01";
                                storageKeyPropertyName = "primaryKey";
                            }
                            else {
                                getKeyRequestArgs.apiVersion = "2015-05-01-preview";
                                storageKeyPropertyName = "key1";
                            }
                            return _this._attributeLoaderHelper.postRequest(AzureStorageAccountAttributeLoader._getStorageAccountKeysTemplate, getKeyRequestArgs)
                                .then(function (keys) {
                                var key = keys[storageKeyPropertyName];
                                var attributes = [
                                    {
                                        name: connectionStringAttribute,
                                        value: "DefaultEndpointsProtocol=https;AccountName=" + storageAccountName + ";AccountKey=" + key
                                    }
                                ];
                                return { results: attributes };
                            });
                        }
                        else {
                            return {
                                results: [],
                                error: new Error("Could not find storage account: " + storageAccountName
                                    + " in subscription: " + subscription.name + ".")
                            };
                        }
                    });
                }
                return Promise.resolve(null);
            };
            this._azureConnection = azureConnection;
            this._host = host;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        AzureStorageAccountAttributeLoader.prototype.getAccountKeys = function (args) {
            if (args === void 0) { args = null; }
            return this._attributeLoaderHelper.postRequest(AzureStorageAccountAttributeLoader._getStorageAccountKeysTemplate, args)
                .then(function (keys) {
                return {
                    results: [
                        { name: "primaryKey", value: keys.key1 || keys.primaryKey },
                        { name: "secondaryKey", value: keys.key2 || keys.secondaryKey }
                    ]
                };
            });
        };
        return AzureStorageAccountAttributeLoader;
    }());
    AzureStorageAccountAttributeLoader.getAttributes = "Azure.Attributes.StorageAccount.GetAttributes";
    AzureStorageAccountAttributeLoader.getKeysAttributes = "Azure.Attributes.StorageAccount.GetKeys";
    AzureStorageAccountAttributeLoader.getV2Attributes = "Azure.Attributes.StorageAccountV2.GetAttributes";
    AzureStorageAccountAttributeLoader.getKeysV2Attributes = "Azure.Attributes.StorageAccountV2.GetKeys";
    AzureStorageAccountAttributeLoader.getConnectionStringAttributeNamespace = "Azure.Attributes.StorageAccount.GetConnectionString";
    AzureStorageAccountAttributeLoader.getBlobContainerGroupAttributes = "Azure.Attributes.StorageAccount.GetBlobContainerGroupAttributes";
    AzureStorageAccountAttributeLoader._storageAccountPropertyErrorMessage = "Could not obtain keys for Storage Account." +
        " Please check that you have the correct permissions.";
    AzureStorageAccountAttributeLoader._findStorageAccountUriTemplate = URITemplate("{+managementEndpoint}/" +
        "subscriptions/{+subscriptionId}/resources?api-version=2014-04-01&" +
        "$filter=name eq '{+accountName}' and " +
        "(resourceType eq 'Microsoft.Storage/storageAccounts' or resourceType eq 'Microsoft.ClassicStorage/storageAccounts')");
    AzureStorageAccountAttributeLoader._getStorageAccountKeysTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/listKeys?api-version={+apiVersion}");
    return AzureStorageAccountAttributeLoader;
});
