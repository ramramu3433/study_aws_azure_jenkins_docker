/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "./KeyCodes"], function (require, exports, KeyCodes_1) {
    "use strict";
    var Utilities = (function () {
        function Utilities() {
        }
        /**
         * Executes an action on a keyboard event.
         * Modifiers: ctrlKey - control/command key, shiftKey - shift key, altKey - alt/option key;
         * pass on 'null' to ignore the modifier (default).
         */
        Utilities.onKey = function (event, eventKeyCode, action, metaKey, shiftKey, altKey) {
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
        };
        /**
         * Executes an action on the first matched keyboard event.
         */
        Utilities.onKeys = function (event, eventKeyCodes, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            var handled = false, keyCount, i;
            if ($.isArray(eventKeyCodes)) {
                keyCount = eventKeyCodes.length;
                for (i = 0; i < keyCount; ++i) {
                    handled = Utilities.onKey(event, eventKeyCodes[i], action, metaKey, shiftKey, altKey);
                    if (handled) {
                        break;
                    }
                }
            }
            return handled;
        };
        /**
         * Executes an action on an 'enter' keyboard event.
         */
        Utilities.onEnter = function (event, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            return Utilities.onKey(event, KeyCodes_1.default.Enter, action, metaKey, shiftKey, altKey);
        };
        /**
         * Executes an action on a 'tab' keyboard event.
         */
        Utilities.onTab = function (event, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            return Utilities.onKey(event, KeyCodes_1.default.Tab, action, metaKey, shiftKey, altKey);
        };
        /**
         * Executes an action on an 'Esc' keyboard event.
         */
        Utilities.onEsc = function (event, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            return Utilities.onKey(event, KeyCodes_1.default.Esc, action, metaKey, shiftKey, altKey);
        };
        /**
         * Executes an action on an 'UpArrow' keyboard event.
         */
        Utilities.onUpArrow = function (event, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            return Utilities.onKey(event, KeyCodes_1.default.UpArrow, action, metaKey, shiftKey, altKey);
        };
        /**
         * Executes an action on a 'DownArrow' keyboard event.
         */
        Utilities.onDownArrow = function (event, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            return Utilities.onKey(event, KeyCodes_1.default.DownArrow, action, metaKey, shiftKey, altKey);
        };
        /**
         * Executes an action on a mouse event.
         */
        Utilities.onButton = function (event, eventButtonCode, action) {
            var source = event.currentTarget;
            var buttonCode = event.button;
            var $sourceElement = $(source);
            var handled = false;
            if ($sourceElement.length
                && (buttonCode === eventButtonCode)
                && $.isFunction(action)) {
                action($sourceElement);
                handled = true;
            }
            return handled;
        };
        /**
         * Executes an action on a 'left' mouse event.
         */
        Utilities.onLeftButton = function (event, action) {
            return Utilities.onButton(event, buttonCodes.Left, action);
        };
        return Utilities;
    }());
    var buttonCodes = {
        None: -1,
        Left: 0,
        Middle: 1,
        Right: 2
    };
    return Utilities;
});
