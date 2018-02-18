/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "URIjs/URITemplate", "Providers/Azure/Loaders/AttributeLoaderHelper", "Providers/Common/PermissionChecker"], function (require, exports, URITemplate, AttributeLoaderHelper, PermissionChecker) {
    "use strict";
    /**
     * Contains the query actions that return properties for Azure API App entities.
     */
    var AzurePermissionsAttributeLoader = (function () {
        function AzurePermissionsAttributeLoader(azureConnection) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzurePermissionsAttributeLoader.getPermissionsAttributeNamespace, _this.getIsPermittedAttribute);
            };
            /**
             * Gets isPermittedAttribute
             */
            this.getIsPermittedAttribute = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AzurePermissionsAttributeLoader._permissionsUriTemplate, args)
                    .then(function (resource) {
                    // Get permissions from response
                    var permissions = resource.value[0];
                    var resourceId = args.id;
                    var isPermitted = PermissionChecker.validatePermissions(resourceId, args.requestedActions, permissions);
                    var attributes = [
                        {
                            name: args.attributeName,
                            value: isPermitted,
                            expiration: Date.now() + 120 * 1000
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        return AzurePermissionsAttributeLoader;
    }());
    AzurePermissionsAttributeLoader.getPermissionsAttributeNamespace = "Azure.Attributes.Permissions.GetPermissionsAttribute";
    AzurePermissionsAttributeLoader._permissionsUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/providers/Microsoft.Authorization/permissions?api-version=2014-07-01-preview");
    return AzurePermissionsAttributeLoader;
});
