/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "URIjs/URITemplate", "Providers/Azure/Loaders/AttributeLoaderHelper"], function (require, exports, URITemplate, AttributeLoaderHelper) {
    "use strict";
    /**
     * Contains the query actions that return Azure Resource properties.
     */
    var AzureDocumentDBAttributeLoader = (function () {
        function AzureDocumentDBAttributeLoader(azureConnection) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureDocumentDBAttributeLoader.getAllAttributesNamespace, _this.getAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureDocumentDBAttributeLoader.listKeysAttributesNamespace, _this.listKeys);
            };
            /**
             * Gets properties for Azure Doc DB Node
             */
            this.getAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args)
                    .then(function (resource) {
                    var resourceId = args.id;
                    var attributes = [
                        {
                            name: "provisioningState",
                            value: resource.properties.provisioningState
                        },
                        {
                            name: "pricingTier",
                            value: resource.properties.databaseAccountOfferType
                        },
                        {
                            name: "documentEndpoint",
                            value: resource.properties.documentEndpoint
                        },
                        {
                            name: "resourceId",
                            value: resourceId
                        },
                        {
                            name: "accountId",
                            value: resource.name
                        }
                    ];
                    return { results: attributes };
                });
            };
            this.listKeys = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.postRequest(AzureDocumentDBAttributeLoader._listKeysUriTemplate, args)
                    .then(function (keys) {
                    var attributes = [
                        {
                            name: "primaryMasterKey",
                            value: keys.primaryMasterKey
                        },
                        {
                            name: "primaryReadonlyMasterKey",
                            value: keys.primaryReadonlyMasterKey
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        return AzureDocumentDBAttributeLoader;
    }());
    AzureDocumentDBAttributeLoader.getAllAttributesNamespace = "Azure.Attributes.DocumentDB.GetAttributes";
    AzureDocumentDBAttributeLoader.listKeysAttributesNamespace = "Azure.Attributes.DocumentDB.ListKeys";
    AzureDocumentDBAttributeLoader._listKeysUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/listKeys?api-version={+apiVersion}");
    return AzureDocumentDBAttributeLoader;
});
