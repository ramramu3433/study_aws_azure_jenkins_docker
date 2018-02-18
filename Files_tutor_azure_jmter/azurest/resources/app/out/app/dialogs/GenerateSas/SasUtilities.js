"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ResourceTypes_1 = require("./ResourceTypes");
var TimestampUtilities_1 = require("../../common/TimestampUtilities");
/**
 * Constants
 */
exports.utc = "utc";
exports.local = "local";
function trimDateStringSuffix(dateString) {
    return TimestampUtilities_1.default.trimDateStringSuffix(dateString);
}
exports.trimDateStringSuffix = trimDateStringSuffix;
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
    startTimestamp = trimDateStringSuffix(startTimestamp);
    expiryTimestamp = trimDateStringSuffix(expiryTimestamp);
    if (localTime) {
        startTimestamp = TimestampUtilities_1.default.localFromUtcDateString(startTimestamp);
        expiryTimestamp = TimestampUtilities_1.default.localFromUtcDateString(expiryTimestamp);
    }
    timeZone = (localTime) ? exports.local : exports.utc;
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
            startTimestamp = trimDateStringSuffix(accessPolicy.AccessPolicy.Start);
            if (convertToLocalTime) {
                startTimestamp = TimestampUtilities_1.default.localFromUtcDateString(startTimestamp);
            }
        }
        catch (error) {
            console.error(error);
            startTimestamp = "";
        }
        try {
            expiryTimestamp = trimDateStringSuffix(accessPolicy.AccessPolicy.Expiry);
            if (convertToLocalTime) {
                expiryTimestamp = TimestampUtilities_1.default.localFromUtcDateString(expiryTimestamp);
            }
        }
        catch (error) {
            console.error(error);
            expiryTimestamp = "";
        }
        try {
            permissions = accessPolicy.AccessPolicy.Permissions.split("");
        }
        catch (error) {
            console.error(error);
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
        case ResourceTypes_1.default.account:
            permissionsOrder = ["r", "w", "d", "l", "a", "c", "u", "p"];
            break;
        case ResourceTypes_1.default.blob:
        case ResourceTypes_1.default.file:
            permissionsOrder = ["r", "w", "d", "l"];
            break;
        case ResourceTypes_1.default.table:
            permissionsOrder = ["r", "a", "u", "d"];
            break;
        case ResourceTypes_1.default.queue:
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
 * Input validation helpers
 */
exports.noTooltip = "", exports.invalidStartTimeTooltip = "Please provide a valid start time.", exports.invalidExpiryTimeRequiredTooltip = "Required field. Please provide a valid expiry time.", exports.invalidExpiryTimeGreaterThanStartTimeTooltip = "The expiry time must be greater than the start time."; // localize
// Is date string and earlier than expiry time; or is empty
function isInvalidStartTimeInput(startTimestamp, expiryTimestamp, isUTC) {
    var tooltip = exports.noTooltip, isValid = TimestampUtilities_1.default.isDateString(startTimestamp), startDate, expiryDate;
    if (!isValid) {
        isValid = (startTimestamp === "");
    }
    if (!isValid) {
        tooltip = exports.invalidStartTimeTooltip;
    }
    if (isValid && !!startTimestamp && TimestampUtilities_1.default.isDateString(expiryTimestamp)) {
        startDate = TimestampUtilities_1.default.parseDate(startTimestamp, isUTC);
        expiryDate = TimestampUtilities_1.default.parseDate(expiryTimestamp, isUTC);
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
    var isValid = TimestampUtilities_1.default.isDateString(expiryTimestamp), tooltip = isValid ? exports.noTooltip : exports.invalidExpiryTimeRequiredTooltip, startDate, expiryDate;
    if (isValid && startTimestamp) {
        if (TimestampUtilities_1.default.isDateString(startTimestamp)) {
            startDate = TimestampUtilities_1.default.parseDate(startTimestamp, isUTC);
            expiryDate = TimestampUtilities_1.default.parseDate(expiryTimestamp, isUTC);
            isValid = (startDate < expiryDate);
            if (!isValid) {
                tooltip = exports.invalidExpiryTimeGreaterThanStartTimeTooltip;
            }
        }
    }
    return { isInvalid: !isValid, help: tooltip };
}
exports.isInvalidExpiryTimeInput = isInvalidExpiryTimeInput;
/**
 * Join strings (removes empty entries), using "/" separator
 */
function JoinAzurePaths() {
    var s = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        s[_i] = arguments[_i];
    }
    var path = s.filter(function (path) { return !!path; }).join("/");
    return path.replace(/\/\//g, "/");
}
exports.JoinAzurePaths = JoinAzurePaths;
function getParameterString(values, properOrder) {
    var result = "";
    properOrder.forEach(function (value) {
        if (values.indexOf(value) >= 0) {
            result += value;
        }
    });
    return result;
}
