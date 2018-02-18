/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Loaders/AttributeLoaderHelper"], function (require, exports, AttributeLoaderHelper) {
    "use strict";
    /**
     * Contains the query actions that return properties for Azure API App entities.
     */
    var AzureApiAppAttributeLoader = (function () {
        function AzureApiAppAttributeLoader(azureConnection) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureApiAppAttributeLoader.getAllAttributesNamespace, _this.getAttributes);
            };
            /**
             * Gets properties for Azure API App Node
             */
            this.getAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args)
                    .then(function (resource) {
                    var attributes = [
                        {
                            name: "package",
                            value: resource.properties.package.id + "-" + resource.properties.package.version
                        },
                        {
                            name: "accessLevel",
                            value: resource.properties.accessLevel
                        },
                        {
                            name: "autoUpdatePolicy",
                            value: resource.properties.updatePolicy
                        },
                        {
                            name: "hostId",
                            value: resource.properties.host.id
                        },
                        {
                            name: "hostName",
                            value: resource.properties.host.resourceName
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        return AzureApiAppAttributeLoader;
    }());
    AzureApiAppAttributeLoader.getAllAttributesNamespace = "Azure.Attributes.ApiApp.GetAllAttributes";
    return AzureApiAppAttributeLoader;
});
