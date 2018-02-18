/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Loaders/AttributeLoaderHelper"], function (require, exports, AttributeLoaderHelper) {
    "use strict";
    /**
     * Contains the query actions that return Azure Resource entitites.
     */
    var AzureApplicationInsightsAttributeLoader = (function () {
        function AzureApplicationInsightsAttributeLoader(azureConnection, host) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureApplicationInsightsAttributeLoader.getAllAttributesNamespace, _this.getAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureApplicationInsightsAttributeLoader.isSearchAvailableNamespace, _this.isSearchAvailable);
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
                            name: "instrumentationKey",
                            value: resource.properties.InstrumentationKey
                        }
                    ];
                    return { results: attributes };
                });
            };
            /**
             * Gets a boolean if the ApplicationInsights version installed supports showing the search explorer
             */
            this.isSearchAvailable = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.isApplicationInsightsSearchExplorerAvailable", [])
                    .then(function (canShow) {
                    var attributes = [
                        {
                            name: "isApplicationInsightsSearchWindowAvailable",
                            value: canShow
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
            this._host = host;
        }
        return AzureApplicationInsightsAttributeLoader;
    }());
    AzureApplicationInsightsAttributeLoader.getAllAttributesNamespace = "Azure.Attributes.ApplicationInsights.GetAttributes";
    AzureApplicationInsightsAttributeLoader.isSearchAvailableNamespace = "Azure.Attributes.ApplicationInsights.IsSearchAvailable";
    return AzureApplicationInsightsAttributeLoader;
});
