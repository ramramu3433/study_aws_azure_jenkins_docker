/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "Providers/Common/ResourceTypesService"], function (require, exports, underscore, ResourceTypesService) {
    "use strict";
    /**
     * Helper class to validate Azure RBAC permissions.
     * Most of this code has been taken from the Azure Portal base code.
     * Repo Url: http://vstfrd:8080/Azure/One/_git/AzureUX-PortalFx
     * Code Path: /src/SDK/Extensions/HubsExtension/TypeScript/HubsExtension/Common/HubsPermissions.ts
     */
    var PermissionChecker = (function () {
        function PermissionChecker() {
        }
        /**
         * Validates that the given permissions match the provided ones.
         */
        PermissionChecker.validatePermissions = function (entityId, requestedActions, providedActions) {
            // Check if entity id has a leading "/",
            // if not fix it.
            if (!!entityId) {
                entityId = entityId.toLowerCase();
                if (entityId.charAt(0) !== "/") {
                    entityId = "/" + entityId;
                }
            }
            // Find which type of entity we are trying to check
            var entityType;
            if (ResourceTypesService.isResourceGroupId(entityId)) {
                entityType = "Microsoft.Resources/subscriptions/resourceGroups";
            }
            else if (ResourceTypesService.isResourceId(entityId)) {
                entityType = ResourceTypesService.buildResourceTypeFromResourceId(entityId);
            }
            else if (ResourceTypesService.isSubscriptionId(entityId)) {
                entityType = "Microsoft.Resources/subscriptions";
            }
            return PermissionChecker.validatePermissionsFromResourceType(entityId, requestedActions, entityType, providedActions);
        };
        /**
         * Validates that the given permissions match the provided ones for the given resource type.
         */
        PermissionChecker.validatePermissionsFromResourceType = function (entityId, requestedActions, entityType, permissionSet) {
            if (!requestedActions || !permissionSet) {
                // If there are no requested actions or no available actions the caller has no permissions
                return false;
            }
            // Convert available actions to regexes
            var permissionSetRegex = PermissionChecker.PermissionsToRegExp(permissionSet);
            // Every requested action must be allowed by the permission set
            var result = requestedActions.every(function (item) {
                if (item.length > 1 && item.charAt(0) === "." && item.charAt(1) === "/") {
                    // Special case: turn leading ./ to {resourceType}/ for formatting.
                    item = entityType + item.substring(1);
                }
                return PermissionChecker.IsAllowed(item, permissionSetRegex);
            });
            return result;
        };
        /**
         * Chech that the requested action is allowed in the provided permission.
         */
        PermissionChecker.IsAllowed = function (requestedAction, permission) {
            var actionAllowed = underscore.any(permission.actions, function (action) { return action.test(requestedAction); });
            var actionDenied = underscore.any(permission.notActions, function (notAction) { return notAction.test(requestedAction); });
            return actionAllowed && !actionDenied;
        };
        /**
         * Converts a permission set from a collection of strings to Regular Expressions.
         */
        PermissionChecker.PermissionsToRegExp = function (permissions) {
            var actions = permissions.actions.map(PermissionChecker.ActionToRegExp), notActions = permissions.notActions.map(PermissionChecker.ActionToRegExp);
            return {
                actions: actions,
                notActions: notActions
            };
        };
        /**
         * Converts a permission action from string to Regular Expression
         */
        PermissionChecker.ActionToRegExp = function (action) {
            return PermissionChecker.convertWildCardPatternToRegex(action);
        };
        /**
         * 1. All allowed character escapes are taken into account: \*, \t, \n, \r, \\, \'
         *    a. \0 is explicitly not supported
         * 2. All non-escaped wildcards match 0 or more characters of anything
         * 3. The entire wildcard pattern is matched from beginning to end, and no more (e.g., a*d matches add but not adding or bad).
         * 4. The pattern matching should be case insensitive.
         */
        PermissionChecker.convertWildCardPatternToRegex = function (wildCardPattern) {
            var wildCardEscapeSequence = "\\*";
            var wildCardPattern = wildCardPattern.replace(wildCardEscapeSequence, "\0"); // sentinel for escaped wildcards
            var regex = PermissionChecker.escapeRegExp(wildCardPattern) // escape the rest of the regex
                .replace(wildCardEscapeSequence, ".*") // the previous command escaped legitimate wildcards - replace them with Regex wildcards
                .replace("\0", wildCardEscapeSequence) // replace sentinels with truly escaped wildcards
                .replace("\\t", "\t") // tabs
                .replace("\\n", "\n") // newlines
                .replace("\\r", "\r") // carriage returns
                .replace("\\\\", "\\") // backslashes
                .replace("\\'", "'"); // single quotes
            return new RegExp("^" + regex + "$", "i"); // perform case insensitive compares
        };
        // Escape reserved regex characters so that they are not interpreted by regex evaluation.
        PermissionChecker.escapeRegExp = function (regex) {
            return regex.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        };
        return PermissionChecker;
    }());
    return PermissionChecker;
});
