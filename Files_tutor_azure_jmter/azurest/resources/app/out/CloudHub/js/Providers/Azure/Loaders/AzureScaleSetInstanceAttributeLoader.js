/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "URIjs/URITemplate", "underscore", "Providers/Azure/Loaders/AttributeLoaderHelper", "base64"], function (require, exports, rsvp, URITemplate, underscore, AttributeLoaderHelper) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Contains the query actions that return Azure Resource entities.
     */
    var AzureScaleSetInstanceAttributeLoader = (function () {
        function AzureScaleSetInstanceAttributeLoader(azureConnection) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureScaleSetInstanceAttributeLoader.getInstanceViewAttributes, _this.getStateAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureScaleSetInstanceAttributeLoader.getPrivateIpAttribute, _this.getPrivateIpAttribute);
            };
            this.getStateAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AzureScaleSetInstanceAttributeLoader._instanceViewUriTemplate, args)
                    .then(function (resource) {
                    var attributes = [
                        {
                            name: "updateDomain",
                            value: resource.platformUpdateDomain
                        },
                        {
                            name: "faultDomain",
                            value: resource.platformFaultDomain
                        }
                    ];
                    return { results: attributes };
                });
            };
            this.getPrivateIpAttribute = function (args) {
                if (args === void 0) { args = null; }
                if (args && args.networkInterface) {
                    var networkInterfaceIPConfigurations = args.networkInterface.properties.ipConfigurations;
                }
                // Try to find an ip configuration with public IP address from network interface
                var ipConfigurationWithPrivateIpAddress = underscore.find(networkInterfaceIPConfigurations, function (ipConfiguration) {
                    return ipConfiguration.properties.privateIPAddress;
                });
                var privateIpAddressId = ipConfigurationWithPrivateIpAddress
                    ? ipConfigurationWithPrivateIpAddress.properties.privateIPAddress
                    : null;
                var attributes = [
                    {
                        name: "privateIp",
                        value: privateIpAddressId
                    }
                ];
                return Promise.resolve({ results: attributes });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        return AzureScaleSetInstanceAttributeLoader;
    }());
    AzureScaleSetInstanceAttributeLoader.getInstanceViewAttributes = "Azure.Attributes.ScaleSetInstance.GetInstanceViewAttributes";
    AzureScaleSetInstanceAttributeLoader.getPrivateIpAttribute = "Azure.Attributes.ScaleSetInstance.GetPrivateIpAttribute";
    AzureScaleSetInstanceAttributeLoader._instanceViewUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/InstanceView/?api-version={+apiVersion}");
    return AzureScaleSetInstanceAttributeLoader;
});
