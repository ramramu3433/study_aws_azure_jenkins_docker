/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Loaders/AttributeLoaderHelper"], function (require, exports, AttributeLoaderHelper) {
    "use strict";
    /**
     * Contains the query actions that return Azure Resource entities.
     */
    var AzureVirtualMachineAttributeLoader = (function () {
        function AzureVirtualMachineAttributeLoader(azureConnection) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureVirtualMachineAttributeLoader.getAllAttributesNamespace, _this.getAttributes);
            };
            /**
             * Gets properties for Azure VM Node
             */
            this.getAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args)
                    .then(function (resource) {
                    var attributes = [
                        {
                            name: "status",
                            value: resource.properties.instanceView.status
                        },
                        {
                            name: "size",
                            value: resource.properties.hardwareProfile.size
                        },
                        {
                            name: "dns",
                            value: resource.properties.instanceView.fullyQualifiedDomainName
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        return AzureVirtualMachineAttributeLoader;
    }());
    AzureVirtualMachineAttributeLoader.getAllAttributesNamespace = "Azure.Attributes.VirtualMachine.GetAttributes";
    return AzureVirtualMachineAttributeLoader;
});
