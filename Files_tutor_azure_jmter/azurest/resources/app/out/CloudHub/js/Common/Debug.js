/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "Common/Utilities"], function (require, exports, _, Utilities) {
    "use strict";
    var _isDebug;
    var _isDebugCached = false;
    var _global = Function("return this")();
    /**
     * Determines whether the app is being debugged.
     */
    function isDebug() {
        if (!_isDebugCached) {
            _isDebugCached = true;
            var parameters = Utilities.getPluginParameters();
            _isDebug = !!parameters && !!parameters.debug;
        }
        return _isDebug;
    }
    exports.isDebug = isDebug;
    function breakIntoDebugger() {
        if (isDebug()) {
            /* tslint:disable:no-debugger */
            debugger;
        }
    }
    exports.breakIntoDebugger = breakIntoDebugger;
    /**
     * Replacement for console.error that's safe for all browsers
     */
    function error(error) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        // In IE9, console is only available when dev tools are open
        if (_global.console) {
            try {
                _global.console.error.apply(null, [error.message || error].concat(optionalParams));
            }
            catch (err2) {
            }
        }
    }
    exports.error = error;
    /**
     * Replacement for console.warn that's safe for all browsers
     */
    function warn(error) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        // In IE9, console is only available when dev tools are open
        if (_global.console) {
            try {
                _global.console.warn.apply(null, [error.message || error].concat(optionalParams));
            }
            catch (err2) {
            }
        }
    }
    exports.warn = warn;
    /**
     * Replacement for console.log that's safe for all browsers. Logs only in debug mode.
     */
    function log(message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        // In IE9, console is only available when dev tools are open
        if (isDebug()) {
            if (_global.console) {
                try {
                    _global.console.log.apply(null, [message].concat(optionalParams));
                }
                catch (err2) {
                }
            }
        }
    }
    exports.log = log;
    /**
     * Replacement for console.log that's safe for all browsers, and logs whether
     * in debug mode or not.
     */
    function logAlways(message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        // In IE9, console is only available when dev tools are open
        if (_global.console) {
            try {
                _global.console.log.apply(null, [message].concat(optionalParams));
            }
            catch (err2) {
            }
        }
    }
    exports.logAlways = logAlways;
    /**
     * Replacement for console.assert that's safe for all browsers
     */
    function assert(test, message) {
        var optionalParams = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            optionalParams[_i - 2] = arguments[_i];
        }
        if (isDebug()) {
            var testResult = _.isFunction(test) ? test() : test;
            if (!testResult) {
                // Assertion failed
                message = message || "Assertion failed" + (_.isFunction(test) ? ": " + test.toString() : "");
                // In IE9, console is only available when dev tools are open
                if (_global.console) {
                    try {
                        _global.console.assert.apply(null, [false, message].concat(optionalParams));
                    }
                    catch (err2) {
                    }
                }
                throw message;
            }
        }
    }
    exports.assert = assert;
    /**
     * Same as Debug.assert(false, [message])
     */
    function fail(message) {
        assert(false, message);
    }
    exports.fail = fail;
});
