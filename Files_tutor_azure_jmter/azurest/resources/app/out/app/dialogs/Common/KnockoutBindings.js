"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ko = require("knockout");
var $ = require("jquery");
var KeyCodes_1 = require("./KeyCodes");
// Binding that synchronizes selected text between HTML and view model
ko.bindingHandlers.selectedText = {
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var newSelection = ko.unwrap(valueAccessor());
        // If an empty string is passed to this then it will select all the text in the input it is bound to
        if (newSelection === undefined) {
            element.selectionStart = 0;
            element.selectionEnd = element.value.length;
            return;
        }
        var start = element.selectionStart;
        var end = element.selectionEnd;
        var currentText = element.value;
        if (end < start) {
            var temp = start;
            start = end;
            end = temp;
        }
        var newText = currentText.substr(0, start) + newSelection + currentText.slice(end);
        element.value = newText;
        element.selectionStart = start;
        element.selectionEnd = start + newSelection.length;
        element.focus();
        $(element).trigger("change");
    }
};
var controlCodes;
(function (controlCodes) {
    controlCodes[controlCodes["Ctrl"] = 1000] = "Ctrl";
    controlCodes[controlCodes["Shift"] = 2000] = "Shift";
    controlCodes[controlCodes["Alt"] = 3000] = "Alt";
})(controlCodes || (controlCodes = {}));
/**
 * Binding that executes an action when an arbitrary key is pressed.
 *
 * @example shortcut: { F5: runQuery, 'Shift+F5': stopQuery }
 *
 * NOTE: The key text (F5, etc.) can be anything in the KeyCodes enumeration (must match case),
 *   possibly prefixed with any of Ctrl+, Shift+ or Alt+ (note: Ctrl+ binds to Command key on Mac)
 */
ko.bindingHandlers.shortcut = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // Interpret the key binding text
        var keyBindings = {};
        var bindingParameters = ko.unwrap(valueAccessor());
        for (var keyText in bindingParameters) {
            var fullKeyCode = 0;
            var func = bindingParameters[keyText]; // The function to call when the key is pressed
            keyText.split("+").forEach(function (key) {
                var keyCode = KeyCodes_1.default[key] || 0;
                var controlCode = controlCodes[key] || 0;
                if (!keyCode && !controlCode) {
                    throw "shortcut binding: Could not find a KeyCode or ControlKeys enum matching " + key;
                }
                fullKeyCode += keyCode + controlCode;
            });
            keyBindings[fullKeyCode] = func;
        }
        // Listen to key presses
        $(element).keydown(function (event) {
            var keyCode = event.keyCode +
                (event.altKey ? controlCodes.Alt : 0) +
                ((process.platform === "darwin" ? event.metaKey : event.ctrlKey) ? controlCodes.Ctrl : 0) +
                (event.shiftKey ? controlCodes.Shift : 0);
            var toExecute = keyBindings[keyCode];
            if (toExecute) {
                var result = toExecute.call(viewModel);
                if (result !== false) {
                    // Unless the function explicitly returned false, then prevent the default
                    event.preventDefault();
                }
            }
        });
    }
};
// Binding that executes an action when ENTER is pressed
ko.bindingHandlers.onEnterKey = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        $(element).keydown(function (event) {
            if (event.keyCode === KeyCodes_1.default.Enter) {
                var toExecute = ko.unwrap(valueAccessor());
                toExecute.call(viewModel);
                event.preventDefault();
            }
        });
    }
};
// Custom binding to not allow decimal
ko.bindingHandlers.integerOnly = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        $(element).keydown(function (event) {
            if (event.keyCode === KeyCodes_1.default.Period || event.keyCode === KeyCodes_1.default.DecimalPoint) {
                event.preventDefault();
            }
        });
    }
};
// Custom binding to not allow decimal or negatives
ko.bindingHandlers.positiveIntegerOnly = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        $(element).keydown(function (event) {
            if (event.keyCode === KeyCodes_1.default.Dash ||
                event.keyCode === KeyCodes_1.default.Period ||
                event.keyCode === KeyCodes_1.default.DecimalPoint) {
                event.preventDefault();
            }
        });
    }
};
ko.bindingHandlers.readOnly = {
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value) {
            element.setAttribute("readOnly", true);
        }
        else {
            element.removeAttribute("readOnly");
        }
    }
};
/**
 * This binding is meant only for the table entity editor dialogs.
 *
 * TODO: [cralvord] Make binding more generic. Remove ID selectors.
 */
ko.bindingHandlers.slideVisible = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        if (ko.unwrap(value)) {
            $(element).toggle(true).css({ left: "0" });
            $("#editor-area").focus();
        }
        else {
            $(element).toggle(false).css({ left: "100%" }).blur();
        }
    },
    update: function (element, valueAccessor) {
        // Whenever the value subsequently changes, slide the element in or out from the right.
        var value = valueAccessor();
        if (ko.unwrap(value)) {
            $(element).toggle(true)
                .animate({ left: "0" }, {
                duration: 500,
                // We have to give focus to the first form element, otherwise no event listeners in the panel will be called.
                complete: function () { return $("#editor-area").focus(); }
            });
        }
        else {
            $(element).animate({ left: "100%" }, {
                duration: 500,
                complete: function () { return $(element).toggle(false); }
            });
        }
    }
};
