"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var $ = require("jquery");
var _ = require("underscore");
var _string = require("underscore.string");
var packageInfo = require("../../package.json");
var Utilities = (function () {
    function Utilities() {
    }
    /**
     * Creates a guid-like string to generate pseudo-unique ids.
     */
    Utilities.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
            s4() + "-" + s4() + s4() + s4();
    };
    Utilities.getProductName = function () {
        return packageInfo.displayName;
    };
    Utilities.getVersion = function () {
        return packageInfo.version;
    };
    Utilities.getPlatform = function () {
        return process.platform.toLowerCase();
    };
    Utilities.isOSX = function () {
        return Utilities.getPlatform() === "darwin";
    };
    /**
     * Remarks: on windows, the API returns "win32" even on a x64 windows OS.
     */
    Utilities.isWin = function () {
        return Utilities.getPlatform() === "win32";
    };
    Utilities.isLinux = function () {
        return Utilities.getPlatform() === "linux";
    };
    /**
     * Remarks: process.arch could be ia32 even on x64 machine.
     */
    Utilities.isWinx64 = function () {
        return Utilities.isWin() && (process.arch.toLowerCase() === "x64" ||
            process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432"));
    };
    /**
     * Returns whether or Electron is running in debug mode
     */
    Utilities.isDebug = function () {
        return process.env.NODE_ENV === "development";
    };
    /**
     * Returns whether HTML5 Storage is supported
     */
    Utilities.isStorageSupported = function () {
        return (typeof (Storage) !== "undefined");
    };
    /**
     * Try to save settings to HTML5 local storage
     */
    Utilities.saveSettings = function (storageKey, settings, telemetryLogger) {
        if (telemetryLogger === void 0) { telemetryLogger = null; }
        if (Utilities.isStorageSupported() && storageKey) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(settings));
            }
            catch (error) {
                // If something goes wrong, log telemetry, and try to clear settings.
                var eventId = "Standalone.saveSettings." + storageKey;
                console.error(eventId, error);
                // Log telemetry
                if ($.isFunction(telemetryLogger)) {
                    telemetryLogger(eventId, error);
                }
                Utilities.clearSettings(storageKey);
            }
        }
    };
    /**
     * Try to load settings from HTML5 local storage
     */
    Utilities.loadSettings = function (storageKey, telemetryLogger) {
        if (telemetryLogger === void 0) { telemetryLogger = null; }
        var settings = null, jsonSettings = null;
        if (Utilities.isStorageSupported() && storageKey) {
            jsonSettings = localStorage.getItem(storageKey);
            try {
                settings = JSON.parse(jsonSettings);
            }
            catch (error) {
                // If something goes wrong, log telemetry, and try to clear settings.
                var eventId = "Standalone.loadSettings." + storageKey;
                console.error(eventId, error);
                // Log telemetry
                if ($.isFunction(telemetryLogger)) {
                    telemetryLogger(eventId, error);
                }
                Utilities.clearSettings(storageKey);
                settings = null;
            }
        }
        return settings;
    };
    /**
     * Try to clear settings in HTML5 local storage
     */
    Utilities.clearSettings = function (storageKey, telemetryLogger) {
        if (telemetryLogger === void 0) { telemetryLogger = null; }
        if (Utilities.isStorageSupported() && storageKey) {
            try {
                localStorage.removeItem(storageKey);
            }
            catch (error) {
                // If something goes wrong, log telemetry and carry on.
                var eventId = "Standalone.clearSettings." + storageKey;
                console.error(eventId, error);
                // Log telemetry
                if ($.isFunction(telemetryLogger)) {
                    telemetryLogger(eventId, error);
                }
            }
        }
    };
    /**
     * Capitalizes first letter of string
     */
    Utilities.capitalizeFirstLetter = function (s) {
        if (s && s.length) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        else {
            return s;
        }
    };
    Utilities.resolveOrReject = function (deferred, error, result) {
        if (error) {
            deferred.reject(error);
        }
        else {
            deferred.resolve(result);
        }
    };
    Utilities.resolveOrRejectPromise = function (resolve, reject, error, result) {
        if (error) {
            reject(error);
        }
        else {
            resolve(result);
        }
    };
    /**
     * Parse the connection string to get key/value pairs
     * see https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string/
     * for possible key names.
     */
    Utilities.parseConnectionStringKeyValues = function (connectionString) {
        var keyValuePairs = {};
        if (connectionString) {
            // split string to get key value pairs
            connectionString.split(";").forEach(function (segment) {
                var separator = segment.indexOf("=");
                if (separator !== -1) {
                    // found the separator in the string
                    var key = segment.substring(0, separator);
                    var value = segment.substring(separator + 1);
                    keyValuePairs[key] = value;
                }
            });
        }
        return keyValuePairs;
    };
    Utilities.removeLeadingSlash = function (uri) {
        if (_string.startsWith(uri, "/")) {
            return uri.substr(1);
        }
        return uri;
    };
    /**
     * Remove the slash at the end if there is one.
     */
    Utilities.removeTrailingSlash = function (s) {
        if (s) {
            var last = s.slice(-1);
            if (last === "/") {
                return s.substr(0, s.length - 1);
            }
        }
        return s;
    };
    /**
     * Remove the prefix and trailing slash (for folder type) of a blob or Azure file name and return the santitized name.
     */
    Utilities.getNameFromStoragePath = function (name) {
        return Utilities.removeTrailingSlash(name).split("/").pop();
    };
    /**
     * Get the environment's new line characters
     */
    Utilities.getEnvironmentNewLine = function () {
        if (Utilities.isWin()) {
            return "\r\n";
        }
        else {
            return "\n";
        }
    };
    /**
     * Gets the path separator used by the current platform.
     */
    Utilities.getEnvironmentPathSeparator = function () {
        return Utilities.isWin() ? "\\" : "/";
    };
    /**
     * Tests whether a value is a safe integer.
     *
     * A safe integer is an integer that can be exactly represented as an IEEE-754 double precision number
     * (all integers from (2^53 - 1) to -(2^53 - 1))
     *
     * Function and constants will be provided by ECMAScript 6's version of Number provides min/max constants.
     *
     * @see CloudHub\ts\Common\Utilities.ts
     */
    Utilities.isSafeInteger = function (value) {
        // Javascript's Number function will convert empty strings to 0, which can give us a false positive.
        if (typeof value === "string") {
            if (_string.isBlank(value)) {
                return false;
            }
        }
        var n = (typeof value !== "number") ? Number(value) : value;
        return !isNaN(n) &&
            Math.round(n) === n &&
            Utilities.MIN_SAFE_INTEGER <= n &&
            n <= Utilities.MAX_SAFE_INTEGER;
    };
    /**
     * Get the file or blob name (with extension) from a file or blob path
     */
    Utilities.getNameFromAnyPath = function (path) {
        if (!path) {
            return "";
        }
        return _.last(_.last(path.split("/"))
            .split("\\"));
    };
    /**
     * Get the folder (path and name) from a file path, with trailing backslash/slash
     */
    Utilities.getFolderFromAnyPath = function (path) {
        return path.substr(0, path.length - this.getNameFromAnyPath(path).length);
    };
    Utilities.replaceBackslashWithSlash = function (path) {
        return path.replace(/\\/g, "/");
    };
    Utilities.appendSlash = function (s) {
        if (s && s.length && s.slice(-1) !== "/" && s.slice(-1) !== "\\") {
            return s + "/";
        }
        return s;
    };
    /**
     * Check if a given key is base 64 encoded.
     */
    Utilities.isBase64Encoded = function (key) {
        var isValidBase64String = key.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/);
        return !!isValidBase64String;
    };
    return Utilities;
}());
Utilities.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
Utilities.MIN_SAFE_INTEGER = -Utilities.MAX_SAFE_INTEGER;
module.exports = Utilities;
