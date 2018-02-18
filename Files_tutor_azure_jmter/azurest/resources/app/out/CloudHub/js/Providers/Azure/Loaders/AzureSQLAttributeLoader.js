/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Loaders/AttributeLoaderHelper"], function (require, exports, AttributeLoaderHelper) {
    "use strict";
    /**
     * Contains the loader for Azure SQL Databases.
     */
    var AzureSQLAttributeLoader = (function () {
        function AzureSQLAttributeLoader(azureConnection) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureSQLAttributeLoader.getAzureSQLDatabaseAttributesNamespace, _this.getAzureSQLDatabaseAttributes);
            };
            /**
             * Gets the attributes for a Azure SQL Databases.
             */
            this.getAzureSQLDatabaseAttributes = function (args) {
                if (args === void 0) { args = null; }
                var splitResourceId = args.id.split("/databases/");
                args.id = splitResourceId[0];
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args)
                    .then(function (resource) {
                    var attributes = [
                        {
                            name: "administratorLogin",
                            value: resource.properties.administratorLogin
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        return AzureSQLAttributeLoader;
    }());
    AzureSQLAttributeLoader.getAzureSQLDatabaseAttributesNamespace = "Azure.Attributes.SQLDatabase.GetAttributes";
    return AzureSQLAttributeLoader;
});
