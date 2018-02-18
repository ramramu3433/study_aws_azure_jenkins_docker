define(["require", "exports", "underscore", "./Constants"], function (require, exports, _, Constants) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
     * Returns a promise that resolves in the specified number of milliseconds.
     */
    function delay(milliseconds) {
        return new Promise(function (resolve) {
            setTimeout(resolve, milliseconds);
        });
    }
    exports.delay = delay;
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
     * Escape meta-characters for jquery selector
     */
    function jQuerySelectorEscape(value) {
        value = value || "";
        return value.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, "\\$&");
    }
    exports.jQuerySelectorEscape = jQuerySelectorEscape;
    function copyTableQuery(query) {
        if (!query) {
            return null;
        }
        return {
            filter: query.filter,
            select: query.select && query.select.slice(),
            top: query.top
        };
    }
    exports.copyTableQuery = copyTableQuery;
    var _divElem = $("<div/>");
    /**
     * Html encode
     */
    function htmlEncode(value) {
        return _divElem.text(value).html();
    }
    exports.htmlEncode = htmlEncode;
    /**
     * Executes an action on a keyboard event.
     * Modifiers: ctrlKey - control/command key, shiftKey - shift key, altKey - alt/option key;
     * pass on 'null' to ignore the modifier (default).
     */
    function onKey(event, eventKeyCode, action, metaKey, shiftKey, altKey) {
        if (metaKey === void 0) { metaKey = null; }
        if (shiftKey === void 0) { shiftKey = null; }
        if (altKey === void 0) { altKey = null; }
        var source = event.target || event.srcElement, keyCode = event.keyCode, $sourceElement = $(source), handled = false;
        if ($sourceElement.length
            && (keyCode === eventKeyCode)
            && $.isFunction(action)
            && ((metaKey === null) || (metaKey === event.metaKey))
            && ((shiftKey === null) || (shiftKey === event.shiftKey))
            && ((altKey === null) || (altKey === event.altKey))) {
            action($sourceElement);
            handled = true;
        }
        return handled;
    }
    exports.onKey = onKey;
    /**
     * Executes an action on an 'enter' keyboard event.
     */
    function onEnter(event, action, metaKey, shiftKey, altKey) {
        if (metaKey === void 0) { metaKey = null; }
        if (shiftKey === void 0) { shiftKey = null; }
        if (altKey === void 0) { altKey = null; }
        return onKey(event, Constants.keyCodes.Enter, action, metaKey, shiftKey, altKey);
    }
    exports.onEnter = onEnter;
    /**
     * Executes an action on a 'tab' keyboard event.
     */
    function onTab(event, action, metaKey, shiftKey, altKey) {
        if (metaKey === void 0) { metaKey = null; }
        if (shiftKey === void 0) { shiftKey = null; }
        if (altKey === void 0) { altKey = null; }
        return onKey(event, Constants.keyCodes.Tab, action, metaKey, shiftKey, altKey);
    }
    exports.onTab = onTab;
    /**
     * Executes an action on an 'Esc' keyboard event.
     */
    function onEsc(event, action, metaKey, shiftKey, altKey) {
        if (metaKey === void 0) { metaKey = null; }
        if (shiftKey === void 0) { shiftKey = null; }
        if (altKey === void 0) { altKey = null; }
        return onKey(event, Constants.keyCodes.Esc, action, metaKey, shiftKey, altKey);
    }
    exports.onEsc = onEsc;
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
     * Returns whether the current platform is MacOS.
     */
    function isMac() {
        var platform = navigator.platform.toUpperCase();
        return platform.indexOf("MAC") >= 0;
    }
    exports.isMac = isMac;
    function getDisplayedNameFromEdmTypeName(edmType) {
        var displayedName = "";
        if (edmType) {
            displayedName = edmType.slice(Constants.EdmTypePrefix.length);
        }
        return displayedName;
    }
    exports.getDisplayedNameFromEdmTypeName = getDisplayedNameFromEdmTypeName;
    function getEdmTypeNameFromDisplayedName(displayedName) {
        var edmType = Constants.EdmType.String;
        if (displayedName) {
            edmType = Constants.EdmTypePrefix + displayedName;
        }
        return edmType;
    }
    exports.getEdmTypeNameFromDisplayedName = getEdmTypeNameFromDisplayedName;
    // MAX_SAFE_INTEGER and MIN_SAFE_INTEGER will be provided by ECMAScript 6's Number
    exports.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
    exports.MIN_SAFE_INTEGER = -exports.MAX_SAFE_INTEGER;
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
    function getInputTypeFromDisplayedName(displayedName) {
        switch (displayedName) {
            case Constants.DisplayedEdmType.DateTime:
                return Constants.InputType.DateTime;
            case Constants.DisplayedEdmType.Int32:
            case Constants.DisplayedEdmType.Int64:
                return Constants.InputType.Number;
            default:
                return Constants.InputType.Text;
        }
    }
    exports.getInputTypeFromDisplayedName = getInputTypeFromDisplayedName;
    function padLongWithZeros(value) {
        var s = "0000000000000000000" + value;
        return s.substr(s.length - 20);
    }
    exports.padLongWithZeros = padLongWithZeros;
    /**
     * Set a data type for each header. The data type is inferred from entities.
     * Notice: Not every header will have a data type since some headers don't even exist in entities.
     */
    function getDataTypesFromEntities(headers, entities) {
        var currentHeaders = _.clone(headers);
        var dataTypes = {};
        entities = entities || [];
        entities.forEach(function (entity, index) {
            if (currentHeaders.length) {
                var keys = _.keys(entity);
                var headersToProcess = _.intersection(currentHeaders, keys);
                headersToProcess.forEach(function (propertyName) {
                    dataTypes[propertyName] = entity[propertyName].$ || Constants.EdmType.String;
                });
                currentHeaders = _.difference(currentHeaders, headersToProcess);
            }
        });
        return dataTypes;
    }
    exports.getDataTypesFromEntities = getDataTypesFromEntities;
});
