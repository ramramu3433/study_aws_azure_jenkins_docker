/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "URIjs/URITemplate", "Providers/Azure/Loaders/AttributeLoaderHelper"], function (require, exports, rsvp, URITemplate, AttributeLoaderHelper) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Contains the query actions that return properties for Azure Gateway entities.
     */
    var AzureGatewayAttributeLoader = (function () {
        function AzureGatewayAttributeLoader(azureConnection) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureGatewayAttributeLoader.getAllAttributesNamespace, _this.getAttributes);
            };
            /**
             * Gets properties for Azure Gateway Node
             */
            this.getAttributes = function (args) {
                if (args === void 0) { args = null; }
                return Promise.all([
                    _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args),
                    _this._attributeLoaderHelper.getRequest(AzureGatewayAttributeLoader._gatewaySiteLinkUriTemplate, args)
                ]).then(function (responses) {
                    var resource = responses[0];
                    var link = responses[1];
                    var attributes = [
                        {
                            name: "siteId",
                            value: link.properties.targetId
                        },
                        {
                            name: "autoUpdatePolicy",
                            value: resource.properties.updatePolicy
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        return AzureGatewayAttributeLoader;
    }());
    AzureGatewayAttributeLoader.getAllAttributesNamespace = "Azure.Attributes.Gateway.GetAttributes";
    AzureGatewayAttributeLoader._gatewaySiteLinkUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/providers/Microsoft.Resources/links/gatewaySite?api-version=2015-01-01");
    return AzureGatewayAttributeLoader;
});
