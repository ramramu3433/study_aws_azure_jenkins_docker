/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Loaders/AttributeLoaderHelper"], function (require, exports, AttributeLoaderHelper) {
    "use strict";
    /**
     * Contains the loader for Azure LogicApps.
     */
    var AzureLogicAppsAttributeLoader = (function () {
        function AzureLogicAppsAttributeLoader(azureConnection) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureLogicAppsAttributeLoader.getAzureLogicAppsAttributesNamespace, _this.getAzureLogicAppsAttributes);
            };
            /**
             * Gets the attributes for a Azure Logic Apps.
             */
            this.getAzureLogicAppsAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args)
                    .then(function (resource) {
                    var integrationAccount = "";
                    if (resource.properties.integrationAccount != null && resource.properties.integrationAccount.id != null) {
                        integrationAccount = resource.properties.integrationAccount.id;
                    }
                    var attributes = [
                        {
                            name: "integrationAccountId",
                            value: integrationAccount
                        },
                        {
                            name: "state",
                            value: resource.properties.state,
                            expiration: Date.now() + 750
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        return AzureLogicAppsAttributeLoader;
    }());
    AzureLogicAppsAttributeLoader.getAzureLogicAppsAttributesNamespace = "Azure.Attributes.LogicApps.GetAttributes";
    return AzureLogicAppsAttributeLoader;
});
