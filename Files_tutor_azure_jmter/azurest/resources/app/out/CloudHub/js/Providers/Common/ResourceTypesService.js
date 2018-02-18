/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * Helper class to manipulate different resource types ids and urls.
     * Most of this code has been taken from the Azure Portal base code.
     * Repo Url: http://vstfrd:8080/Azure/One/_git/AzureUX-PortalFx
     * Code Path: /src/SDK/Framework/TypeScript/MsPortalFx/ViewModels/Services/ResourceTypes.ts
     */
    var ResourceTypesService = (function () {
        function ResourceTypesService() {
        }
        /**
         * Determines if a given ID is a subscription ID.
         * Eg: /subscriptions/sub123
         * @param id The ID to check.
         * @return Boolean true if the ID is a resource group ID, otherwise false.
         */
        ResourceTypesService.isSubscriptionId = function (id) {
            if (!id) {
                return false;
            }
            if (typeof id !== "string") {
                return false;
            }
            var parts = id.split("/");
            if (parts.length !== 3) {
                return false;
            }
            if (parts[0].length !== 0) {
                return false;
            }
            if (parts[1].toLowerCase() !== "subscriptions") {
                return false;
            }
            return ResourceTypesService.isValidSegmentIdentifier(parts[2]);
        };
        /**
         * Determines if a given ID is a resource group ID.
         * Eg: /subscriptions/sub123/resourcegroups/rg123
         * @param id The ID to check.
         * @return Boolean true if the ID is a resource group ID, otherwise false.
         */
        ResourceTypesService.isResourceGroupId = function (id) {
            if (!id) {
                return false;
            }
            if (typeof id !== "string") {
                return false;
            }
            var parts = id.split("/");
            if (parts.length !== 5) {
                return false;
            }
            if (parts[0].length !== 0) {
                return false;
            }
            if (parts[1].toLowerCase() !== "subscriptions") {
                return false;
            }
            if (!ResourceTypesService.isValidSegmentIdentifier(parts[2])) {
                return false;
            }
            if (parts[3].toLowerCase() !== "resourcegroups") {
                return false;
            }
            return ResourceTypesService.isValidSegmentIdentifier(parts[4]);
        };
        /**
         * Determines if a given ID is a resource  ID.
         * Eg: /subscriptions/sub123/resourcegroups/rg123/providers/pro123/type123/res123
         *     /subscriptions/sub123/resourcegroups/rg123/providers/pro123/type123/res123[/type456/res456[/type789/res789[...]]]
         * @param id The ID to check.
         * @return Boolean true if the ID is a resource ID, otherwise false.
         */
        ResourceTypesService.isResourceId = function (id) {
            if (!id) {
                return false;
            }
            if (typeof id !== "string") {
                return false;
            }
            var parts = id.split("/");
            if (parts.length < 9) {
                return false;
            }
            if ((parts.length % 2) !== 1) {
                return false;
            }
            if (parts[0].length !== 0) {
                return false;
            }
            if (parts[1].toLowerCase() !== "subscriptions") {
                return false;
            }
            if (!ResourceTypesService.isValidSegmentIdentifier(parts[2])) {
                return false;
            }
            if (parts[3].toLowerCase() !== "resourcegroups") {
                return false;
            }
            if (!ResourceTypesService.isValidSegmentIdentifier(parts[4])) {
                return false;
            }
            if (parts[5].toLowerCase() !== "providers") {
                return false;
            }
            if (!ResourceTypesService.isValidSegmentIdentifier(parts[6])) {
                return false;
            }
            return true;
        };
        /**
         * Builds a resource type from a resource ID.
         * @param resourceId The resource ID.
         * @return The resource type.
         */
        ResourceTypesService.buildResourceTypeFromResourceId = function (resourceId) {
            return ResourceTypesService.buildResourceTypeFromResourceDescriptor(ResourceTypesService.parseResourceDescriptor(resourceId));
        };
        /**
         * Builds a resource type from a resource descriptor.
         * @param resourceDescriptor The resource descriptor.
         * @return The resource type.
         */
        ResourceTypesService.buildResourceTypeFromResourceDescriptor = function (resourceDescriptor) {
            var resourceType = resourceDescriptor.provider, index;
            for (index = 0; index < resourceDescriptor.types.length; index++) {
                resourceType = resourceType + "/" + resourceDescriptor.types[index];
            }
            return resourceType;
        };
        /**
         * Parses a resource ID into a resource descriptor.
         * @param id The resource ID to parse.
         * @return The resource descriptor object.
         */
        ResourceTypesService.parseResourceDescriptor = function (id) {
            if (!id) {
                throw new Error("Invalid resource ID, ID is null or empty.");
            }
            if (typeof id !== "string") {
                throw new Error("Invalid resource ID, ID is not a string.");
            }
            var parts = id.split("/");
            if (parts.length < 9) {
                throw new Error("Invalid resource ID, not enough segments.");
            }
            if ((parts.length % 2) !== 1) {
                throw new Error("Invalid resource ID, invalid number of segments.");
            }
            if (parts[0].length !== 0) {
                throw new Error("Invalid resource ID, first segment must be empty.");
            }
            if (parts[1].toLowerCase() !== "subscriptions") {
                throw new Error("Invalid resource ID, second segment must be 'subscriptions'.");
            }
            if (!ResourceTypesService.isValidSegmentIdentifier(parts[2])) {
                throw new Error("Invalid resource ID, subscription segment has an invalid subscription id.");
            }
            if (parts[3].toLowerCase() !== "resourcegroups") {
                throw new Error("Invalid resource ID, fourth segment must be 'resourcegroups'.");
            }
            if (!ResourceTypesService.isValidSegmentIdentifier(parts[4])) {
                throw new Error("Invalid resource ID, resource group segment has an invalid resource group id.");
            }
            if (parts[5].toLowerCase() !== "providers") {
                throw new Error("Invalid resource ID, sixth segment must be 'providers'.");
            }
            if (!ResourceTypesService.isValidSegmentIdentifier(parts[6])) {
                throw new Error("Invalid resource ID, provider segment has an invalid provider id.");
            }
            // TODO: validate all the type/ID segment pairs.
            var result = {
                subscription: parts[2],
                resourceGroup: parts[4],
                provider: parts[6],
                types: [],
                resources: []
            };
            // Parse all the type/ID segment pairs.
            for (var index = 7; index < parts.length; index += 2) {
                result.type = parts[index];
                result.resource = parts[index + 1];
                result.types.push(result.type);
                result.resources.push(result.resource);
            }
            return result;
        };
        /**
         * Check if the resource identifier is well formed.
         */
        ResourceTypesService.isValidSegmentIdentifier = function (value) {
            var invalidSubscriptionResourceOrGroupCharacter = ["{", "}"];
            // TODO: This is a very conservative filter we should also consult ARM for the full spec.
            if (!value || typeof value !== "string") {
                return false;
            }
            value = value.trim();
            if (!value) {
                return false;
            }
            return !invalidSubscriptionResourceOrGroupCharacter.some(function (ch) {
                return value.indexOf(ch) >= 0;
            });
        };
        return ResourceTypesService;
    }());
    return ResourceTypesService;
});
