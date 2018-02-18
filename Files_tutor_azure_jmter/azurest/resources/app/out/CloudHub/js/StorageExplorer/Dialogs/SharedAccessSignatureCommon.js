/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureStorageConstants", "Common/Debug", "../Common/Timestamps"], function (require, exports, AzureStorageConstants, Debug, Timestamps_1) {
    "use strict";
    /**
     * Gets the default settings for generating SAS tokens and URIs.
     */
    function getDefaultSettings(localTime, durationHours) {
        if (localTime === void 0) { localTime = true; }
        if (durationHours === void 0) { durationHours = 24; }
        var settings;
        var startTimestamp;
        var expiryTimestamp;
        var timeZone;
        // Set the start time to 15 minutes before the current time to guard against clock skew.
        var now = new Date();
        now.setMinutes(now.getMinutes() - 15);
        startTimestamp = now.toISOString();
        var future = new Date(startTimestamp);
        future.setHours(future.getHours() + durationHours);
        expiryTimestamp = future.toISOString();
        startTimestamp = Timestamps_1.default.trimDateStringSuffix(startTimestamp);
        expiryTimestamp = Timestamps_1.default.trimDateStringSuffix(expiryTimestamp);
        if (localTime) {
            startTimestamp = Timestamps_1.default.localFromUtcDateString(startTimestamp);
            expiryTimestamp = Timestamps_1.default.localFromUtcDateString(expiryTimestamp);
        }
        timeZone = (localTime) ? Timestamps_1.default.local : Timestamps_1.default.utc;
        settings = {
            startTimestamp: startTimestamp,
            expiryTimestamp: expiryTimestamp,
            timeZone: timeZone,
            permissions: ["r", "l"],
            services: "bqtf",
            resourceTypes: "sco"
        };
        return settings;
    }
    exports.getDefaultSettings = getDefaultSettings;
    function getPolicySettings(accessPolicy, convertToLocalTime) {
        var settings, startTimestamp = "", expiryTimestamp = "", permissions = [];
        if (accessPolicy) {
            try {
                startTimestamp = Timestamps_1.default.trimDateStringSuffix(accessPolicy.AccessPolicy.Start);
                if (convertToLocalTime) {
                    startTimestamp = Timestamps_1.default.localFromUtcDateString(startTimestamp);
                }
            }
            catch (error) {
                Debug.error(error);
                startTimestamp = "";
            }
            try {
                expiryTimestamp = Timestamps_1.default.trimDateStringSuffix(accessPolicy.AccessPolicy.Expiry);
                if (convertToLocalTime) {
                    expiryTimestamp = Timestamps_1.default.localFromUtcDateString(expiryTimestamp);
                }
            }
            catch (error) {
                Debug.error(error);
                expiryTimestamp = "";
            }
            try {
                permissions = accessPolicy.AccessPolicy.Permissions.split("");
            }
            catch (error) {
                Debug.error(error);
                permissions = [];
            }
        }
        settings = {
            startTimestamp: startTimestamp,
            expiryTimestamp: expiryTimestamp,
            timeZone: null,
            permissions: permissions
        };
        return settings;
    }
    exports.getPolicySettings = getPolicySettings;
    /**
     * Permission helpers
     */
    function getPermissionString(permissions, resourceType) {
        // The abbreviated permissions list must list permissions in the proper order.
        // Otherwise Azure Storage reports an error with 'XML specified is not syntactically valid.'
        var permissionsOrder = [];
        switch (resourceType) {
            case AzureStorageConstants.sasResourceTypes.account:
                permissionsOrder = ["r", "w", "d", "l", "a", "c", "u", "p"];
                break;
            case AzureStorageConstants.sasResourceTypes.blob:
            case AzureStorageConstants.sasResourceTypes.file:
                permissionsOrder = ["r", "w", "d", "l"];
                break;
            case AzureStorageConstants.sasResourceTypes.table:
                permissionsOrder = ["r", "a", "u", "d"];
                break;
            case AzureStorageConstants.sasResourceTypes.queue:
                permissionsOrder = ["r", "a", "u", "p"];
                break;
        }
        return getParameterString(permissions, permissionsOrder);
    }
    exports.getPermissionString = getPermissionString;
    function getServicesString(services) {
        return getParameterString(services, ["b", "f", "q", "t"]);
    }
    exports.getServicesString = getServicesString;
    function getResourceTypesString(resourceTypes) {
        return getParameterString(resourceTypes, ["s", "c", "o"]);
    }
    exports.getResourceTypesString = getResourceTypesString;
    /**
     * Storage helpers
     */
    function isStorageSupported() {
        return (typeof (Storage) !== "undefined");
    }
    exports.isStorageSupported = isStorageSupported;
    function saveSessionSettings(settings, storageKey) {
        if (this.isStorageSupported() && settings && storageKey) {
            sessionStorage.setItem(storageKey, JSON.stringify(settings));
        }
    }
    exports.saveSessionSettings = saveSessionSettings;
    function loadSessionSettings(storageKey) {
        var settings = null, jsonSettings = null;
        if (this.isStorageSupported() && storageKey) {
            jsonSettings = sessionStorage.getItem(storageKey);
            try {
                settings = JSON.parse(jsonSettings);
            }
            catch (error) {
                Debug.error("Error parsing dialog settings.", storageKey, error);
                settings = null;
            }
        }
        return settings;
    }
    exports.loadSessionSettings = loadSessionSettings;
    /**
     * Input validation helpers
     */
    exports.noTooltip = "", exports.invalidStartTimeTooltip = "Please provide a valid start time.", exports.invalidExpiryTimeRequiredTooltip = "Required field. Please provide a valid expiry time.", exports.invalidExpiryTimeGreaterThanStartTimeTooltip = "The expiry time must be greater than the start time."; // localize
    function isDateString(dateString) {
        var success = false;
        if (dateString) {
            var date = Date.parse(dateString);
            success = $.isNumeric(date);
        }
        return success;
    }
    exports.isDateString = isDateString;
    // Is date string and earlier than expiry time; or is empty
    function isInvalidStartTimeInput(startTimestamp, expiryTimestamp, isUTC) {
        var tooltip = exports.noTooltip, isValid = isDateString(startTimestamp), startDate, expiryDate;
        if (!isValid) {
            isValid = (startTimestamp === "");
        }
        if (!isValid) {
            tooltip = exports.invalidStartTimeTooltip;
        }
        if (isValid && !!startTimestamp && isDateString(expiryTimestamp)) {
            startDate = Timestamps_1.default.parseDate(startTimestamp, isUTC);
            expiryDate = Timestamps_1.default.parseDate(expiryTimestamp, isUTC);
            isValid = (startDate < expiryDate);
            if (!isValid) {
                tooltip = exports.invalidExpiryTimeGreaterThanStartTimeTooltip;
            }
        }
        return { isInvalid: !isValid, help: tooltip };
    }
    exports.isInvalidStartTimeInput = isInvalidStartTimeInput;
    // Is date string, and later than start time (if any)
    function isInvalidExpiryTimeInput(startTimestamp, expiryTimestamp, isUTC) {
        var isValid = isDateString(expiryTimestamp), tooltip = isValid ? exports.noTooltip : exports.invalidExpiryTimeRequiredTooltip, startDate, expiryDate;
        if (isValid && startTimestamp) {
            if (isDateString(startTimestamp)) {
                startDate = Timestamps_1.default.parseDate(startTimestamp, isUTC);
                expiryDate = Timestamps_1.default.parseDate(expiryTimestamp, isUTC);
                isValid = (startDate < expiryDate);
                if (!isValid) {
                    tooltip = exports.invalidExpiryTimeGreaterThanStartTimeTooltip;
                }
            }
        }
        return { isInvalid: !isValid, help: tooltip };
    }
    exports.isInvalidExpiryTimeInput = isInvalidExpiryTimeInput;
    function getParameterString(values, properOrder) {
        var result = "";
        properOrder.forEach(function (value) {
            if (values.indexOf(value) >= 0) {
                result += value;
            }
        });
        return result;
    }
});
