/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "Common/Utilities"], function (require, exports, _, Utilities) {
    "use strict";
    function isSameSettingId(a, b) {
        return !!a && !!b &&
            isSameStorageAccount(a.storageAccount, b.storageAccount) &&
            a.containerType === b.containerType &&
            a.resourceName === b.resourceName;
    }
    exports.isSameSettingId = isSameSettingId;
    /**
     * TODO: merge with AzureStorageUtilities
     * Determine whether two storage accounts are the same.
     * Two storage accounts are the same only when they have same account name in the same domain.
     * @param a
     * @param b
     */
    function isSameStorageAccount(a, b) {
        var accountNameA = a.accountName || "";
        var endPointsDomainA = a.endpointsDomain || "";
        var connectionTypeA = a.connectionType || 3 /* key */;
        var accountNameB = b.accountName || "";
        var endPointsDomainB = b.endpointsDomain || "";
        var connectionTypeB = b.connectionType || 3 /* key */;
        return accountNameA.toLowerCase() === accountNameB.toLowerCase() &&
            endPointsDomainA.toLowerCase() === endPointsDomainB.toLowerCase() &&
            connectionTypeA === connectionTypeB;
    }
    exports.isSameStorageAccount = isSameStorageAccount;
    function isSameColumnSetting(a, b) {
        return !!a && !!b &&
            Utilities.isEqual(a.columnNames, b.columnNames) &&
            Utilities.isEqual(a.order, b.order) &&
            Utilities.isEqual(a.visible, b.visible);
    }
    exports.isSameColumnSetting = isSameColumnSetting;
    function deepClone(original) {
        var cloned = _.clone(original);
        _.each(cloned, function (value, key) {
            if (_.isObject(value)) {
                cloned[key] = deepClone(value);
            }
        });
        return cloned;
    }
    exports.deepClone = deepClone;
});
