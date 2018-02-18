/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Loaders/AttributeLoaderHelper"], function (require, exports, AttributeLoaderHelper) {
    "use strict";
    /**
     * Contains the query actions that return Azure Resource properties.
     */
    var AzureRedisAttributeLoader = (function () {
        function AzureRedisAttributeLoader(azureConnection) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureRedisAttributeLoader.getAllAttributesNamespace, _this.getAttributes);
            };
            /**
             * Gets properties for Azure Redis Node
             */
            this.getAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args)
                    .then(function (resource) {
                    var attributes = [
                        {
                            name: "url",
                            value: "http://" + resource.properties.hostName
                        },
                        {
                            name: "sslPort",
                            value: resource.properties.sslPort
                        },
                        {
                            name: "nonSslPort",
                            value: resource.properties.port
                        },
                        {
                            name: "redisVersion",
                            value: resource.properties.redisVersion
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        return AzureRedisAttributeLoader;
    }());
    AzureRedisAttributeLoader.getAllAttributesNamespace = "Azure.Attributes.Redis.GetAttributes";
    return AzureRedisAttributeLoader;
});
