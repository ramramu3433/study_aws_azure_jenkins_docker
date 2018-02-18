/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "URIjs/URITemplate", "Providers/Azure/Loaders/AttributeLoaderHelper"], function (require, exports, URITemplate, AttributeLoaderHelper) {
    "use strict";
    /**
     * Contains the query actions that return Azure Resource entitites.
     */
    var AzureSearchServiceAttributeLoader = (function () {
        function AzureSearchServiceAttributeLoader(azureConnection) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureSearchServiceAttributeLoader.getAllAttributesNamespace, _this.getAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureSearchServiceAttributeLoader.getKeysAttributes, _this.getKeys);
            };
            /**
             * Gets properties for Search Node
             */
            this.getAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args)
                    .then(function (resource) {
                    var attributes = [
                        {
                            name: "url",
                            value: "https://" + resource.name + ".search.windows.net"
                        },
                        {
                            name: "pricingTier",
                            value: resource.properties.sku.name
                        },
                        {
                            name: "status",
                            value: resource.properties.status
                        }
                    ];
                    return { results: attributes };
                });
            };
            /**
             * Gets keys for Search Node
             */
            this.getKeys = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.postRequest(AzureSearchServiceAttributeLoader._listAdminKeysUriTemplate, args)
                    .then(function (keys) {
                    var attributes = [
                        {
                            name: "primaryKey",
                            value: keys.primaryKey
                        },
                        {
                            name: "secondaryKey",
                            value: keys.secondaryKey
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        return AzureSearchServiceAttributeLoader;
    }());
    AzureSearchServiceAttributeLoader.getAllAttributesNamespace = "Azure.Attributes.SearchServices.GetAttributes";
    AzureSearchServiceAttributeLoader.getKeysAttributes = "Azure.Attributes.SearchServices.GetKeys";
    AzureSearchServiceAttributeLoader._listAdminKeysUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/listAdminKeys?api-version={+apiVersion}");
    return AzureSearchServiceAttributeLoader;
});
