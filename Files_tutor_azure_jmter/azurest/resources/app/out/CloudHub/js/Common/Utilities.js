/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "jquery", "underscore", "URIjs/URI", "underscore", "es6-promise"], function (require, exports, jquery, underscore, uri, _, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    // MAX_SAFE_INTEGER and MIN_SAFE_INTEGER will be provided by ECMAScript 6's Number
    exports.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
    exports.MIN_SAFE_INTEGER = -exports.MAX_SAFE_INTEGER;
    // Enable for testing only
    var _enableRandomDelayAndFailures = false;
    var _divElem = jquery("<div/>");
    var DefaultThrottleMilliseconds = 50;
    var DelayedPropertyName = "$_delayThrottle_isQueued";
    /**
     * Generates a pseudo-random GUID.
     */
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
            s4() + "-" + s4() + s4() + s4();
    }
    exports.guid = guid;
    /**
     * Returns a string representing the specified the time duration in h/m/s as needed
     */
    function formatDuration(milliseconds) {
        var sPerHour = 60 * 60;
        var sPerMin = 60;
        // Round to nearest second first
        var secondsLeft = Math.round(milliseconds / 1000);
        var hours = Math.floor(secondsLeft / sPerHour);
        secondsLeft = secondsLeft % sPerHour;
        var minutes = Math.floor(secondsLeft / sPerMin);
        var seconds = secondsLeft % sPerMin;
        return ((hours ? hours + "hr" : "") +
            (minutes ? " " + minutes + "min" : "") +
            (seconds || (!hours && !minutes) ? " " + seconds + "s" : ""))
            .trim();
    }
    exports.formatDuration = formatDuration;
    /**
     * Returns a string representing the specified size in units of disk space.
     */
    function formatSize(size) {
        var divisor = 1024;
        var index = 0;
        var units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        while (size >= divisor) {
            size /= divisor;
            index++;
        }
        var displaySize = Math.round(size) !== size ? size.toFixed(1) : size;
        return displaySize + " " + units[index];
    }
    exports.formatSize = formatSize;
    /**
     * Splits a path by either "/" or "\"
     */
    function splitPath(path) {
        // Return empty array for empty string. Split will at least return array with 1 element.
        if (!path) {
            return [];
        }
        // split by slash or backslash
        return path.split(/\/|\\/);
    }
    exports.splitPath = splitPath;
    /**
     * Determines whether the specified path leads to a folder.
     */
    function isPathAFolder(path) {
        if (!path) {
            return true;
        }
        var lastChar = path.charAt(path.length - 1);
        return lastChar === "/" || lastChar === "\\";
    }
    exports.isPathAFolder = isPathAFolder;
    /**
     * Get the filename (with extension) from a file path
     */
    function getFileNameFromPath(path) {
        if (!path) {
            return "";
        }
        return underscore.last(underscore.last(path.split("/"))
            .split("\\"));
    }
    exports.getFileNameFromPath = getFileNameFromPath;
    /**
     * Get the directory path from a file path
     */
    function getDirectoryFromPath(path) {
        if (!path) {
            return "";
        }
        var fileName = getFileNameFromPath(path);
        var directory = path.substr(0, path.length - fileName.length);
        directory = removeTrailingSlash(directory);
        return directory;
    }
    exports.getDirectoryFromPath = getDirectoryFromPath;
    /**
     * Get the file extension (with ".") from a file path
     */
    function getFileExtension(path) {
        var splits = getFileNameFromPath(path).split(".");
        return splits.length > 1 ? "." + underscore.last(splits) : "";
    }
    exports.getFileExtension = getFileExtension;
    /**
     * Adds a slash to the end of a path.
     */
    function appendSlash(s) {
        if (s && s.length && s.slice(-1) !== "/" && s.slice(-1) !== "\\") {
            return s + "/";
        }
        return s;
    }
    exports.appendSlash = appendSlash;
    /**
     * Gets the path separator used by the current platform.
     */
    function getEnvironmentPathSeparator() {
        return isWin() ? "\\" : "/";
    }
    exports.getEnvironmentPathSeparator = getEnvironmentPathSeparator;
    /**
     * Adds a path separator to the end of a path.
     */
    function appendPathSeparator(s) {
        var pathSeparator = getEnvironmentPathSeparator();
        if (s && s.length && s.slice(-1) !== "/" && s.slice(-1) !== "\\") {
            return s + pathSeparator;
        }
        return s;
    }
    exports.appendPathSeparator = appendPathSeparator;
    /**
     * Remove the slash or backslash at the end if there is one.
     */
    function removeTrailingSlash(s) {
        if (!!s && s.length && (s.slice(-1) === "/" || s.slice(-1) === "\\")) {
            return s.substr(0, s.length - 1);
        }
        return s;
    }
    exports.removeTrailingSlash = removeTrailingSlash;
    /**
     * Returns whether the current platform is Windows.
     */
    function isWin() {
        var platform = navigator.platform.toUpperCase();
        return platform.indexOf("WIN") >= 0;
    }
    exports.isWin = isWin;
    /**
     * Returns whether the current platform is MacOS.
     */
    function isMac() {
        var platform = navigator.platform.toUpperCase();
        return platform.indexOf("MAC") >= 0;
    }
    exports.isMac = isMac;
    function isLinux() {
        var platform = navigator.platform.toUpperCase();
        return platform.indexOf("LINUX") >= 0;
    }
    exports.isLinux = isLinux;
    /**
     * Returns true if we support direct links on this platform
     */
    function isDirectLinkSupported() {
        return isRunningOnElectron() && (isWin() || isMac());
    }
    exports.isDirectLinkSupported = isDirectLinkSupported;
    /**
     * Returns true if Cloud Explorer is running on electron shell, false otherwise.
     */
    function isRunningOnElectron() {
        return navigator.userAgent.toLowerCase().indexOf("electron") >= 0;
    }
    exports.isRunningOnElectron = isRunningOnElectron;
    /**
     * Get the environment's new line characters
     */
    function getEnvironmentNewLine() {
        var platform = navigator.platform.toUpperCase();
        if (platform.indexOf("WIN") >= 0) {
            return "\r\n";
        }
        else {
            return "\n";
        }
    }
    exports.getEnvironmentNewLine = getEnvironmentNewLine;
    /**
     * Get parameters passed to the plugin
     */
    function getPluginParameters() {
        var query = uri.parseQuery(location.search);
        return query && query.parameters ? JSON.parse(decodeURIComponent(query.parameters)) : null;
    }
    exports.getPluginParameters = getPluginParameters;
    /**
     * Returns a promise that resolves in the specified number of milliseconds.
     */
    function delay(milliseconds) {
        return new Promise(function (resolve) {
            setTimeout(resolve, milliseconds);
        });
    }
    exports.delay = delay;
    /**
     * Performs the specified action after a delay in milliseconds.
     */
    function delayAction(action, milliseconds) {
        return delay(milliseconds)
            .then(action);
    }
    exports.delayAction = delayAction;
    /**
     * Performs the specified action within a given time range.
     */
    function randomDelay(minMilliseconds, maxMilliseconds) {
        if (_enableRandomDelayAndFailures) {
            var delayInMilliseconds = Math.floor(Math.random() * (maxMilliseconds - minMilliseconds) + minMilliseconds);
            return delay(delayInMilliseconds);
        }
        else {
            return Promise.resolve(null);
        }
    }
    exports.randomDelay = randomDelay;
    /**
     * If In testing mode, add random delays
     */
    function addRandomDelayIfTesting(action, minMilliseconds, maxMilliseconds) {
        if (_enableRandomDelayAndFailures) {
            return function () {
                return randomDelay(minMilliseconds, maxMilliseconds)
                    .then(action);
            };
        }
        else {
            return action;
        }
    }
    exports.addRandomDelayIfTesting = addRandomDelayIfTesting;
    /**
     * If In testing mode, add random failures
     */
    function addRandomFailureIfTesting(action, failurePercentage0To1) {
        if (_enableRandomDelayAndFailures) {
            return function () {
                if (Math.random() > failurePercentage0To1) {
                    throw new Error("This is a random failure");
                }
                return action();
            };
        }
        else {
            return action;
        }
    }
    exports.addRandomFailureIfTesting = addRandomFailureIfTesting;
    /**
     * If In testing mode, add random delays and failures
     */
    function addRandomDelayAndFailureIfTesting(action, minMilliseconds, maxMilliseconds, failurePercentage0To1) {
        return addRandomDelayIfTesting(addRandomFailureIfTesting(action, failurePercentage0To1), minMilliseconds, maxMilliseconds);
    }
    exports.addRandomDelayAndFailureIfTesting = addRandomDelayAndFailureIfTesting;
    /**
     * Join strings (removes empty entries)
     */
    function join(separator) {
        var s = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            s[_i - 1] = arguments[_i];
        }
        return s.filter(function (path) { return !!path; }).join(separator);
    }
    exports.join = join;
    /**
     * Join strings (removes empty entries), using environment file separator
     */
    function JoinFilePaths() {
        var s = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            s[_i] = arguments[_i];
        }
        var path = s.filter(function (path) { return !!path; }).join(getEnvironmentPathSeparator());
        return removeDuplicatePathSeparators(path);
    }
    exports.JoinFilePaths = JoinFilePaths;
    /**
     * Join strings (removes empty entries), using "/" separator
     */
    function JoinAzurePaths() {
        var s = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            s[_i] = arguments[_i];
        }
        var path = s.filter(function (path) { return !!path; }).join("/");
        return removeDuplicateAzurePathSeparators(path);
    }
    exports.JoinAzurePaths = JoinAzurePaths;
    /**
     * Is the environment 'ctrl' key press. This key is used for multi selection, like select one more item, select all.
     * For Windows and Linux, it's ctrl. For Mac, it's command.
     */
    function isEnvironmentCtrlPressed(event) {
        return isMac() ? event.metaKey : event.ctrlKey;
    }
    exports.isEnvironmentCtrlPressed = isEnvironmentCtrlPressed;
    function isEnvironmentShiftPressed(event) {
        return event.shiftKey;
    }
    exports.isEnvironmentShiftPressed = isEnvironmentShiftPressed;
    function isEnvironmentAltPressed(event) {
        return event.altKey;
    }
    exports.isEnvironmentAltPressed = isEnvironmentAltPressed;
    /**
     * Given a value and minimum and maximum limits, returns the value if it is within the limits
     * (inclusive); or the maximum or minimum limit, if the value is greater or lesser than the
     * respective limit.
     */
    function ensureBetweenBounds(value, minimum, maximum) {
        return Math.max(Math.min(value, maximum), minimum);
    }
    exports.ensureBetweenBounds = ensureBetweenBounds;
    /**
     * Check if a given key is base 64 encoded.
     */
    function isBase64Encoded(key) {
        var isValidBase64String = key.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/);
        return !!isValidBase64String;
    }
    exports.isBase64Encoded = isBase64Encoded;
    function isAsciiChar(code) {
        return code < 128;
    }
    function isAscii(s) {
        return s.match(/^[\x00-\x7F]*$/);
    }
    exports.isAscii = isAscii;
    /**
     * Encodes only the non-ASCII portions of a string
     */
    function encodeNonAscii(s) {
        if (isAscii(s)) {
            return s;
        }
        var length = s.length;
        var result = "";
        for (var i = 0; i < length; ++i) {
            var c = s.charAt(i);
            var code = s.charCodeAt(i);
            if (isAsciiChar(code)) {
                result += c;
            }
            else {
                result += encodeURIComponent(c);
            }
        }
        return result;
    }
    exports.encodeNonAscii = encodeNonAscii;
    /**
     * Get all the locations where the search query appears in the display name for the node
     */
    function getNodeHighlightLocations(node, searchQuery) {
        var highlightLocations;
        // functionality removed in PR 40360: Scoping Search & Optimizations
        highlightLocations = [];
        return highlightLocations;
    }
    exports.getNodeHighlightLocations = getNodeHighlightLocations;
    /**
     * Get all the locations where the search query appears in the display name.
     */
    function getHighlightLocations(displayName, searchQuery) {
        var highlightLocations = [];
        // functionality removed in PR 40360: Scoping Search & Optimizations
        highlightLocations = [];
        return highlightLocations;
    }
    exports.getHighlightLocations = getHighlightLocations;
    /**
     * Calls the given function on a delay. Multiple calls to the same function using delayThrottle
     * before the delay is up will be ignored.
     */
    function throttle(func, rateLimitMilliseconds, context) {
        if (!func[DelayedPropertyName]) {
            // Queue up a call
            rateLimitMilliseconds = Math.max(1, rateLimitMilliseconds);
            var timer = setTimeout(function () {
                func[DelayedPropertyName] = null;
                func.apply(context);
            }, rateLimitMilliseconds);
            func[DelayedPropertyName] = timer;
        }
    }
    exports.throttle = throttle;
    /**
     * Loops through an array, calling a function on each item in the array, and giving up the CPU
     * for a while each time a certain amount of time has passed.  Allows the browser UI thread to
     * stay responsive.
     */
    // *** NOTE: Keep this in sync with the version in Standalone/app/Utilities!!
    function forEachResponsive(array, func, continueWhile, threshholdMilliseconds) {
        threshholdMilliseconds = threshholdMilliseconds || DefaultThrottleMilliseconds;
        var arrayLength = array.length;
        return new Promise(function (resolve, reject) {
            var i = 0;
            var processLoop = function () {
                var startedProcessingLoop = Date.now();
                while (true) {
                    if (i >= arrayLength) {
                        // Finished processing all items
                        resolve(true);
                        return;
                    }
                    var item = array[i];
                    if (continueWhile && !continueWhile(item, i)) {
                        // continue test failed
                        resolve(false);
                        return;
                    }
                    var now = Date.now();
                    if (now - startedProcessingLoop >= threshholdMilliseconds) {
                        // Give CPU back for a while before continuing
                        setTimeout(processLoop, 0);
                        return;
                    }
                    else {
                        // Call the function for the current item
                        func(item, i);
                        i++;
                    }
                }
            };
            processLoop();
        });
    }
    exports.forEachResponsive = forEachResponsive;
    /**
     * Retrieves an appropriate error message for an error.
     * @param error The actual error
     * @param simpleMessage A simpler message to use instead of the actual error.
     * If supplied, the original error will be added as "details".
     */
    function getErrorMessage(error, simpleMessage) {
        var detailsMessage;
        if (typeof error === "string" || error instanceof String) {
            detailsMessage = error.toString();
        }
        else {
            detailsMessage = error.message || error.error || error.name;
        }
        if (simpleMessage && detailsMessage) {
            return simpleMessage
                + getEnvironmentNewLine() + getEnvironmentNewLine() +
                "Details: " + detailsMessage;
        }
        else if (simpleMessage) {
            return simpleMessage;
        }
        else {
            return detailsMessage || "An unexpected error has occurred.";
        }
    }
    exports.getErrorMessage = getErrorMessage;
    /**
     * Html encode
     */
    function htmlEncode(value) {
        return _divElem.text(value).html();
    }
    exports.htmlEncode = htmlEncode;
    /**
     * Html decode
     */
    function htmlDecode(value) {
        return _divElem.html(value).text();
    }
    exports.htmlDecode = htmlDecode;
    /**
     * Escape meta-characters for jquery selector
     */
    function jQuerySelectorEscape(value) {
        value = value || "";
        return value.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, "\\$&");
    }
    exports.jQuerySelectorEscape = jQuerySelectorEscape;
    /**
     * Removes redundant path separators from a path.
     */
    function removeDuplicatePathSeparators(path) {
        // To keep from matching \\ at the beginning of a string (UNC path), we match
        // a single non-/\ character followed by // or \\.
        // The $1 in the replacement string represents the value of the first matching group
        // (the character found before the // or \\).
        return path.replace(/([^\/\\])((\/\/)|(\\\\))/g, "$1" + getEnvironmentPathSeparator());
    }
    /**
     * Removes redundant path separators from an Azure path.
     */
    function removeDuplicateAzurePathSeparators(path) {
        return path.replace(/\/\//g, "/");
    }
    /**
     * Returns the substring between two characters
     */
    function substringBetweenCharacters(str, startCharacter, endCharacter) {
        if (endCharacter === void 0) { endCharacter = startCharacter; }
        var substring = null;
        var startIndex = str.indexOf(startCharacter) + 1;
        var endIndex = str.indexOf(endCharacter, startIndex);
        if (startIndex <= endIndex) {
            substring = str.substring(startIndex, endIndex);
        }
        return substring;
    }
    exports.substringBetweenCharacters = substringBetweenCharacters;
    /**
     * Removes the specified item from an array.
     */
    function removeValueFromArray(array, value) {
        var index = array.indexOf(value);
        if (index >= 0) {
            array.splice(index, 1);
        }
    }
    exports.removeValueFromArray = removeValueFromArray;
    /**
     * Splits up an array of items in an array of partitions no larger than the
     * given size.
     */
    function partitionArray(array, partitionSize) {
        var partitions = [];
        var remaining = array.slice();
        while (remaining.length) {
            var partition = remaining.slice(0, partitionSize);
            remaining = remaining.slice(partitionSize);
            partitions.push(partition);
        }
        return partitions;
    }
    exports.partitionArray = partitionArray;
    /**
     * Tests whether a value a safe integer.
     * A safe integer is an integer that can be exactly represented as an IEEE-754 double precision number (all integers from (2^53 - 1) to -(2^53 - 1))
     * Note: Function and constants will be provided by ECMAScript 6's Number.
     */
    function isSafeInteger(value) {
        var n = (typeof value !== "number") ? Number(value) : value;
        return ((Math.round(n) === n) && (exports.MIN_SAFE_INTEGER <= n) && (n <= exports.MAX_SAFE_INTEGER));
    }
    exports.isSafeInteger = isSafeInteger;
    /**
     * Tests whether two arrays have same elements in the same sequence.
     */
    function isEqual(a, b) {
        var isEqual = false;
        if (!!a && !!b && a.length === b.length) {
            isEqual = _.every(a, function (value, index) { return value === b[index]; });
        }
        return isEqual;
    }
    exports.isEqual = isEqual;
    /**
     * Replaces backslashes in a path with forward slashes.
     */
    function replaceBackslashWithSlash(path) {
        return path.replace(/\\/g, "/");
    }
    exports.replaceBackslashWithSlash = replaceBackslashWithSlash;
    function stringifyError(error) {
        return JSON.stringify(errorToObject(error));
    }
    exports.stringifyError = stringifyError;
    function parseError(errorString) {
        return errorFromObject(JSON.parse(errorString));
    }
    exports.parseError = parseError;
    function errorToObject(error) {
        // Errors don't enumerate like a normal object, e.g. _.clone() doesn't handle it
        var errorObject = {
            name: error.name
        };
        Object.getOwnPropertyNames(error).forEach(function (property) {
            errorObject[property] = error[property];
        });
        return errorObject;
    }
    exports.errorToObject = errorToObject;
    function errorFromObject(errorObject) {
        var error = new Error(errorObject.name);
        Object.getOwnPropertyNames(errorObject).forEach(function (propertyName) {
            error[propertyName] = errorObject[propertyName];
        });
        return error;
    }
    exports.errorFromObject = errorFromObject;
});
